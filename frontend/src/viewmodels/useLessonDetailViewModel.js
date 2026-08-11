import { useCallback, useEffect, useState } from "react";
import { lessonService } from "../services/lesson.service.js";

export function useLessonDetailViewModel(lessonId) {
  const [lesson, setLesson] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let objectUrl;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [lessonData, url] = await Promise.all([
          lessonService.getById(lessonId),
          lessonService.fetchFileObjectUrl(lessonId),
        ]);
        setLesson(lessonData);
        setCompleted(lessonData.completed);
        objectUrl = url;
        setFileUrl(url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [lessonId]);

  const markComplete = useCallback(async () => {
    setMarking(true);
    setError(null);
    try {
      await lessonService.markComplete(lessonId);
      setCompleted(true);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setMarking(false);
    }
  }, [lessonId]);

  return { lesson, fileUrl, completed, loading, error, marking, markComplete };
}
