import types

import pytest

from app.services import quiz_generator


class FakeModel:
    def generate(self, prompt, max_new_tokens=48):
        answer = prompt.split("<hl>", 2)[1].strip()
        return f"What is the role of {answer}?"


@pytest.fixture(autouse=True)
def patch_model(monkeypatch):
    monkeypatch.setattr(quiz_generator, "get_model", lambda: FakeModel())


def test_generate_quiz_returns_unique_questions_for_distinct_answers():
    lesson_text = (
        "Luna is a friendly dog that lives near the river. "
        "Luna loves to chase bright red balls in the afternoon. "
        "The river flows behind the garden where Luna sleeps. "
        "The garden contains tall sunflowers and a wooden gate. "
        "During winter, Luna curls up beside the fireplace."
    )

    questions = quiz_generator.generate_quiz(lesson_text, 4)

    assert len(questions) == 4
    normalized_answers = {q["options"][q["correctAnswerIndex"]] for q in questions}
    assert len(normalized_answers) == 4

    normalized_questions = [q["questionText"].lower().strip("? ") for q in questions]
    assert len(normalized_questions) == len(set(normalized_questions))


def test_generate_quiz_returns_fallback_questions_when_model_is_empty(monkeypatch):
    class EmptyModel:
        def generate(self, prompt, max_new_tokens=48):
            return ""

    monkeypatch.setattr(quiz_generator, "get_model", lambda: EmptyModel())

    questions = quiz_generator.generate_quiz("A short lesson about Luna and the garden.", 2)

    assert len(questions) >= 1
    assert all(q["questionText"].endswith("?") for q in questions)


def test_generate_quiz_returns_fallback_when_no_candidates_are_found(monkeypatch):
    class EmptyModel:
        def generate(self, prompt, max_new_tokens=48):
            return "What is the topic?"

    monkeypatch.setattr(quiz_generator, "get_model", lambda: EmptyModel())

    questions = quiz_generator.generate_quiz("123 456 789", 1)

    assert len(questions) == 1
    assert questions[0]["questionText"].endswith("?")
