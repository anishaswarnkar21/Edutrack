"""Turns lesson text into structured MCQ dicts using a chunk-aware QA pipeline.

The model is asked to generate a question from a selected answer span plus a
passage context in the training-script format:

    generate question: <hl> answer <hl> context

This service now follows that shape more carefully: it cleans the lesson text,
chunks it into coherent passages, extracts answer candidates per chunk, deduplicates
those candidates globally before generating, and filters the generated questions so
only unique, high-quality questions survive.

Real student-report PDFs (title pages, "Submitted By:"/"Roll No:" metadata, running
page headers, bullet-style fact lists, parameter tables) are mostly non-prose. Text
extraction (`backend/src/services/pdf.service.js`) preserves line breaks specifically
so `_clean_body_paragraphs` can drop that junk line-by-line before it gets welded onto
real sentences - a single glued blob of "Roll No: 221315 TITLE: ... Objective: ..."
would otherwise pass the word-count/letter-ratio checks below as if it were prose.
"""

import random
import re
from collections import Counter
from typing import List, Optional

from app.services.model_loader import get_model

_STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "then", "than", "that", "this",
    "these", "those", "is", "are", "was", "were", "be", "been", "being", "to",
    "of", "in", "on", "at", "for", "with", "as", "by", "it", "its", "from",
    "into", "about", "which", "who", "whom", "their", "there", "here", "such",
    "can", "could", "will", "would", "should", "may", "might", "must", "not",
    "also", "when", "where", "while", "because", "each", "other", "some", "any",
    "all", "more", "most", "very", "used", "using", "use",
}

_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")
_WORD = re.compile(r"[A-Za-z][A-Za-z\-]{3,}")
_TOC_LEADER = re.compile(r"\.{3,}|\.\s\.\s\.")
_SECTION_NUMBER = re.compile(r"^\s*\d+(\.\d+)*\.?\s")
_LETTER = re.compile(r"[A-Za-z]")
_REPEATED_WORD = re.compile(r"\b(\w+)(?:\s+\1\b){2,}", re.IGNORECASE)
_REPEATED_CHARS = re.compile(r"(.)\1{3,}")
_CAPITALIZED_PHRASE = re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b")
_NUMBER = re.compile(r"\b\d{1,4}(?:[/-]\d{1,4})?\b")
_NOUN_PHRASE = re.compile(r"\b(?:[A-Z][a-z]+|[a-z]+(?:\s+[a-z]+){1,3})\b")
_PAGE_NUMBER_LINE = re.compile(r"^\d{1,4}$")
_PAGE_REF = re.compile(r"\b(page|pp?\.)\s*\d+\b", re.IGNORECASE)
_LABEL_LINE = re.compile(r"^[A-Z][A-Za-z ]{0,30}:(\s|$)")
# PDF bullet glyphs (Wingdings/Symbol-font private-use-area codepoints, common
# bullet chars, dashes) that precede list items - stripped so heading/label
# detection below (which anchors on the first real character) still applies.
# Written as \uXXXX escapes (not literal glyphs) so this source file stays
# plain ASCII - literal Unicode bullets here previously broke on non-UTF-8
# terminals/tools. Bullet codepoints: BULLET U+2022, BLACK CIRCLE U+25CF,
# BLACK SMALL SQUARE U+25AA, WHITE BULLET U+25E6, TRIANGULAR BULLET U+2023,
# BULLET OPERATOR U+2219, plus the Symbol-font private-use range U+F000-U+F8FF.
_BULLET_PREFIX = re.compile("^[\s\u2022\u25cf\u25aa\u25e6\u2023\u2219\uf000-\uf8ff*-]+")


def _normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def _normalize_answer(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (text or "").lower()).strip()


def _looks_noisy(text: str) -> bool:
    if not text:
        return True
    if _REPEATED_WORD.search(text):
        return True
    if _REPEATED_CHARS.search(text):
        return True
    tokens = [token.lower() for token in re.findall(r"[A-Za-z][A-Za-z\-']+", text)]
    if not tokens:
        return True
    if len(tokens) >= 6 and len(set(tokens)) / len(tokens) < 0.5:
        return True
    return False


def _is_substantive(sentence: str) -> bool:
    words = sentence.split()
    if not (8 <= len(words) <= 60):
        return False
    if _TOC_LEADER.search(sentence):
        return False
    if _SECTION_NUMBER.match(sentence):
        return False
    letters = len(_LETTER.findall(sentence))
    if letters < len(sentence) * 0.6:
        return False
    if sentence.isupper():
        return False
    if _looks_noisy(sentence):
        return False
    return True


def _is_junk_line(line: str, header_footer_counts: Counter) -> bool:
    """A line that is almost certainly not lesson prose: a title-page field, a
    running page header/footer, a page number, a TOC entry, or a heading."""
    if not line:
        return True
    if _TOC_LEADER.search(line):
        return True
    if _PAGE_NUMBER_LINE.match(line):
        return True
    if _PAGE_REF.search(line):
        return True
    if _SECTION_NUMBER.match(line):
        return True
    if re.match(r"^(references|bibliography|index|table of contents)\b", line, re.IGNORECASE):
        return True
    word_count = len(line.split())
    if len(re.findall(r"[A-Za-z]", line)) < 3:
        return True
    if line.isupper() and word_count < 12:
        return True
    # "Name: ...", "Roll No: ...", "Objective:", "Submitted By: Submitted To:" -
    # title-page/metadata fields and section labels, not lesson content. Anchored
    # on a leading capital with no sentence punctuation before the colon, so a
    # wrapped line like "building. The logic handles:" (real prose followed by
    # the *next* heading) isn't mistaken for a pure label and dropped whole.
    if word_count <= 12 and _LABEL_LINE.match(line):
        return True
    # A short line repeated verbatim elsewhere in the document is a running
    # header/footer (course title + page number reprinted on every page).
    if word_count <= 10 and header_footer_counts[line.lower()] >= 2:
        return True
    return False


def _clean_body_paragraphs(text: str) -> List[str]:
    raw_lines = []
    for raw in re.split(r"\r\n|\n", text or ""):
        line = _normalize_whitespace(raw)
        line = _BULLET_PREFIX.sub("", line).strip()
        raw_lines.append(line)

    header_footer_counts = Counter(
        line.lower() for line in raw_lines if line and len(line.split()) <= 10
    )

    paragraphs: List[str] = []
    current: List[str] = []
    for line in raw_lines:
        if not line:
            # A genuine blank line is a paragraph break.
            if current:
                paragraphs.append(_normalize_whitespace(" ".join(current)))
                current = []
            continue
        if _is_junk_line(line, header_footer_counts):
            # Skip without flushing: a running header or page number often
            # interrupts a sentence mid-page-break, not just between paragraphs.
            continue
        current.append(line)
    if current:
        paragraphs.append(_normalize_whitespace(" ".join(current)))

    return [p for p in paragraphs if len(re.findall(r"[A-Za-z]", p)) >= 8]


def _sentence_split(text: str) -> List[str]:
    return [s.strip() for s in _SENTENCE_SPLIT.split(text) if s.strip()]


def _chunk_paragraphs(paragraphs: List[str], max_words: int = 80, max_sentences: int = 2) -> List[str]:
    chunks: List[str] = []
    for paragraph in paragraphs:
        sentences = _sentence_split(paragraph)
        if not sentences:
            continue
        current_sentences: List[str] = []
        current_words = 0
        for sentence in sentences:
            sentence_words = len(sentence.split())
            if current_sentences and (
                len(current_sentences) >= max_sentences or current_words + sentence_words > max_words
            ):
                chunk = " ".join(current_sentences)
                if len(chunk.split()) >= 8:
                    chunks.append(chunk)
                current_sentences, current_words = [], 0
            current_sentences.append(sentence)
            current_words += sentence_words

        if current_sentences:
            chunk = " ".join(current_sentences)
            if len(chunk.split()) >= 8:
                chunks.append(chunk)
    return chunks


def _clean_sentences(lesson_text: str) -> List[str]:
    paragraphs = _clean_body_paragraphs(lesson_text)
    if not paragraphs:
        return []
    chunks = _chunk_paragraphs(paragraphs)
    sentences: List[str] = []
    for chunk in chunks:
        sentences.extend([s for s in _sentence_split(chunk) if _is_substantive(s)])
    return sentences or [s for chunk in chunks for s in _sentence_split(chunk)]


def _question_prompt(answer: str, passage: str) -> str:
    return f"generate question: <hl> {answer} <hl> {passage}"


def _clean_question(text: str) -> Optional[str]:
    text = text.strip().strip('"').strip()
    if len(text) < 8:
        return None
    if _looks_noisy(text):
        return None
    if not text.endswith("?"):
        text += "?"
    return text


def _is_duplicate_text(a: str, b: str) -> bool:
    a_tokens = {
        token for token in _normalize_answer(a).split() if token not in _STOPWORDS
    }
    b_tokens = {
        token for token in _normalize_answer(b).split() if token not in _STOPWORDS
    }
    if not a_tokens or not b_tokens:
        return _normalize_answer(a) == _normalize_answer(b)
    union = a_tokens | b_tokens
    if not union:
        return True
    return len(a_tokens & b_tokens) / len(union) > 0.8


def _keyword_pool(sentences: List[str]) -> List[str]:
    """Distinct content words across the lesson, used as a distractor pool."""
    seen = set()
    words: List[str] = []
    for sentence in sentences:
        for word in _WORD.findall(sentence):
            lower = word.lower()
            if lower in _STOPWORDS or lower in seen or _REPEATED_CHARS.search(lower):
                continue
            seen.add(lower)
            words.append(word)
    return words


def _extract_chunk_candidates(chunk: str) -> List[str]:
    """Picks answer-worthy spans from a chunk, strongest signal first.

    Single common words (adjectives, generic nouns like "book"/"shelf") make
    poor quiz answers - a QG model asked about them just parrots back
    "What is <word>?" instead of a real comprehension question. So this only
    ever proposes multi-word spans: named entities/proper-noun phrases and
    numbers (strongest signal - listed first so callers that truncate the
    result keep these), plus generic 2-3 word noun phrases with no stopword
    at any position (weaker signal, listed after).
    """
    sentences = _sentence_split(chunk)
    seen = set()

    strong: List[str] = []
    for sentence in sentences:
        for match in _CAPITALIZED_PHRASE.finditer(sentence):
            candidate = match.group(1).strip()
            if candidate.lower() in _STOPWORDS or candidate.lower() in seen:
                continue
            seen.add(candidate.lower())
            strong.append(candidate)

        for match in _NUMBER.finditer(sentence):
            candidate = match.group(0)
            if candidate.lower() in seen:
                continue
            seen.add(candidate.lower())
            strong.append(candidate)

    fallback: List[str] = []
    for sentence in sentences:
        for match in re.finditer(r"\b[a-z]+(?:\s+[a-z]+){1,2}\b", sentence):
            candidate = match.group(0).strip()
            words = candidate.split()
            lower = candidate.lower()
            if lower in seen:
                continue
            if any(word in _STOPWORDS or len(word) < 3 for word in words):
                continue
            seen.add(lower)
            fallback.append(candidate)

    return strong + fallback


def _candidate_quality(candidate: str, chunk: str, chunk_index: int) -> float:
    normalized = _normalize_answer(candidate)
    if not normalized:
        return -999
    score = 0.0
    if re.search(r"\d", candidate):
        score += 2.0
    if re.search(r"[A-Z]", candidate) and not candidate.isupper():
        score += 1.5
    if len(candidate.split()) > 1:
        score += 1.0
    if len(candidate) >= 6:
        score += 0.5
    if normalized.split() and normalized.split()[0] in _STOPWORDS:
        score -= 3.0
    score += max(0.0, 1.0 - (chunk_index * 0.05))
    score += min(1.0, len(chunk.split()) / 120.0)
    return score


def _dedupe_candidates(candidates: List[dict]) -> List[dict]:
    kept: List[dict] = []
    seen_norms: List[str] = []
    for entry in candidates:
        normalized = _normalize_answer(entry["answer"])
        if not normalized:
            continue
        if any(_is_duplicate_text(normalized, existing) for existing in seen_norms):
            continue
        seen_norms.append(normalized)
        kept.append(entry)
    return kept


def _is_degenerate_question(question_text: str, answer: str) -> bool:
    normalized_question = _normalize_answer(question_text)
    normalized_answer = _normalize_answer(answer)
    if not normalized_question or not normalized_answer:
        return True
    if not question_text.endswith("?"):
        return True
    if len(normalized_question.split()) < 4:
        return True
    if re.fullmatch(r"what (is|are|was|were|does|do|did) " + re.escape(normalized_answer) + r"\??", normalized_question):
        return True
    if normalized_question.startswith("what is ") and normalized_question.endswith("?") and normalized_question.split()[-2] == normalized_answer.split()[-1]:
        return True
    return False


def _build_distractors(correct_answer: str, pool: List[str], rng: random.Random) -> List[str]:
    """Picks 3 distractors from the lesson's own vocabulary, preferring words with
    a similar length to the correct answer so options don't visually stand out."""
    candidates = [w for w in pool if _normalize_answer(w) != _normalize_answer(correct_answer)]
    if not candidates:
        return ["A", "B", "C"]
    candidates.sort(key=lambda w: abs(len(w) - len(correct_answer)))
    closest = candidates[:8]
    rng.shuffle(closest)

    distractors = closest[:3]
    filler_index = 1
    while len(distractors) < 3:
        distractors.append(f"None of the above ({filler_index})")
        filler_index += 1
    return distractors


def generate_quiz(lesson_text: str, num_questions: int) -> List[dict]:
    sentences = _clean_sentences(lesson_text)
    if not sentences:
        fallback_text = _normalize_whitespace(lesson_text) or "lesson"
        sentences = [fallback_text]

    chunks = _chunk_paragraphs(_clean_body_paragraphs(lesson_text)) or [" ".join(sentences)]
    pool = _keyword_pool(sentences)
    model = get_model()
    rng = random.Random(hash(lesson_text) & 0xFFFFFFFF)  # deterministic per lesson

    candidate_entries: List[dict] = []
    for chunk_index, chunk in enumerate(chunks):
        for answer in _extract_chunk_candidates(chunk)[:2]:
            candidate_entries.append({
                "answer": answer,
                "chunk": chunk,
                "chunk_index": chunk_index,
                "score": _candidate_quality(answer, chunk, chunk_index),
            })

    ranked_candidates = sorted(candidate_entries, key=lambda entry: entry["score"], reverse=True)
    ranked_candidates = _dedupe_candidates(ranked_candidates)

    if not ranked_candidates:
        fallback_answer = _normalize_whitespace(" ".join(sentences[:2])) or "lesson"
        fallback_chunk = " ".join(sentences[:2]) or lesson_text
        ranked_candidates = [
            {
                "answer": fallback_answer,
                "chunk": fallback_chunk,
                "chunk_index": 0,
                "score": 999.0,
            }
        ]

    questions: List[dict] = []
    produced_questions: List[str] = []
    batch_size = max(24, num_questions * 2)

    for start in range(0, len(ranked_candidates), batch_size):
        if len(questions) >= num_questions:
            break
        for entry in ranked_candidates[start:start + batch_size]:
            if len(questions) >= num_questions:
                break
            answer = entry["answer"]
            generated_text = model.generate(_question_prompt(answer, entry["chunk"]), max_new_tokens=48)
            question_text = _clean_question(generated_text)
            if not question_text:
                question_text = f"What is {answer}?"
            if _is_degenerate_question(question_text, answer):
                question_text = f"What is {answer}?"
            if _looks_noisy(question_text) and len(questions) > 0:
                continue
            if any(_is_duplicate_text(question_text, existing) for existing in produced_questions) and len(questions) > 0:
                continue

            distractors = _build_distractors(answer, pool, rng)
            options = distractors + [answer]
            rng.shuffle(options)

            questions.append(
                {
                    "questionText": question_text,
                    "options": options,
                    "correctAnswerIndex": options.index(answer),
                }
            )
            produced_questions.append(question_text)

    return questions[:num_questions]
