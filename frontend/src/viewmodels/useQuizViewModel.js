import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { quizService } from "../services/quiz.service.js";

const POLL_INTERVAL_MS = 2000;

export function useQuizViewModel(lessonId) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({}); // questionId -> selectedIndex
  const [editing, setEditing] = useState(false);
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const pollTimer = useRef(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      // The quiz was generated in the background right after the teacher
      // uploaded the lesson, so this is usually already ready() = true. If not
      // (still generating, or this is an older lesson), poll until it is.
      const result = await quizService.getForLesson(lessonId);
      setQuiz(result);
      if (!result.ready) {
        pollTimer.current = setTimeout(refresh, POLL_INTERVAL_MS);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    refresh();
    return () => clearTimeout(pollTimer.current);
  }, [refresh]);

  const selectAnswer = useCallback((questionId, selectedIndex) => {
    if (isTeacher) return;
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  }, [isTeacher]);

  const submit = useCallback(async () => {
    if (!quiz || isTeacher) return null;
    setSubmitting(true);
    setError(null);
    try {
      const payload = Object.entries(answers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      }));
      const result = await quizService.submit(quiz.quizId, payload);
      await refresh();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [quiz, answers, refresh]);

  const canAttempt = !isTeacher;
  const allAnswered = canAttempt && quiz?.questions?.length > 0 && quiz.questions.every((q) => answers[q.id] !== undefined);

  const startEditing = useCallback(() => {
    if (!quiz?.questions?.length) return;
    setDraftQuestions(
      quiz.questions.map((q) => ({
        questionText: q.questionText,
        options: [...q.options],
        correctAnswerIndex: q.correctAnswerIndex,
      }))
    );
    setError(null);
    setEditing(true);
  }, [quiz]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setDraftQuestions([]);
  }, []);

  const updateDraftQuestion = useCallback((index, changes) => {
    setDraftQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...changes } : q))
    );
  }, []);

  const updateDraftOption = useCallback((index, optionIndex, value) => {
    setDraftQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? { ...q, options: q.options.map((o, oi) => (oi === optionIndex ? value : o)) }
          : q
      )
    );
  }, []);

  const addDraftQuestion = useCallback(() => {
    setDraftQuestions((prev) => [
      ...prev,
      { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
    ]);
  }, []);

  const removeDraftQuestion = useCallback((index) => {
    setDraftQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const saveEdits = useCallback(async () => {
    if (!quiz) return;
    setSaving(true);
    setError(null);
    try {
      await quizService.update(lessonId, draftQuestions);
      await refresh();
      setEditing(false);
      setDraftQuestions([]);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [quiz, lessonId, draftQuestions, refresh]);

  return {
    quiz,
    loading,
    error,
    submitting,
    answers,
    selectAnswer,
    submit,
    allAnswered,
    canAttempt,
    isTeacher,
    editing,
    draftQuestions,
    saving,
    startEditing,
    cancelEditing,
    updateDraftQuestion,
    updateDraftOption,
    addDraftQuestion,
    removeDraftQuestion,
    saveEdits,
  };
}
