import { useCallback, useEffect, useRef, useState } from "react";
import { lessonService } from "../services/lesson.service.js";

const POLL_INTERVAL_MS = 2000;

export function useLessonsViewModel(classId) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const pollTimer = useRef(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const list = await lessonService.listForClass(classId);
      setLessons(list);

      // Quiz generation runs in the background after upload - keep polling while
      // any lesson is still pending/generating so status badges update live.
      const stillWorking = list.some((l) => l.quizStatus === "pending" || l.quizStatus === "generating");
      clearTimeout(pollTimer.current);
      if (stillWorking) {
        pollTimer.current = setTimeout(refresh, POLL_INTERVAL_MS);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    refresh();
    return () => clearTimeout(pollTimer.current);
  }, [refresh]);

  const uploadLesson = useCallback(
    async (title, file) => {
      setUploading(true);
      setError(null);
      try {
        const created = await lessonService.upload(classId, { title, file });
        await refresh();
        return created;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [classId, refresh]
  );

  const markComplete = useCallback(async (lessonId) => {
    await lessonService.markComplete(lessonId);
  }, []);

  const updateLesson = useCallback(
    async (lessonId, { title, file }) => {
      await lessonService.update(lessonId, { title, file });
      await refresh();
    },
    [refresh]
  );

  const deleteLesson = useCallback(
    async (lessonId) => {
      await lessonService.remove(lessonId);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    },
    []
  );

  const regenerateQuiz = useCallback(
    async (lessonId) => {
      await lessonService.regenerateQuiz(lessonId);
      await refresh();
    },
    [refresh]
  );

  return {
    lessons,
    loading,
    error,
    uploading,
    uploadLesson,
    markComplete,
    updateLesson,
    deleteLesson,
    regenerateQuiz,
    refresh,
  };
}
