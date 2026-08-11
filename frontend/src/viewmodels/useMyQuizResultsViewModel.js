import { useCallback, useEffect, useState } from "react";
import { quizService } from "../services/quiz.service.js";

export function useMyQuizResultsViewModel(classId) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResults(await quizService.myResultsForClass(classId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { results, loading, error, refresh };
}
