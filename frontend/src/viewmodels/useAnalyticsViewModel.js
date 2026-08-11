import { useCallback, useEffect, useState } from "react";
import { analyticsService } from "../services/analytics.service.js";

// Pass a classId for the teacher's per-class breakdown, or omit it for the
// current student's own cross-class analytics.
export function useAnalyticsViewModel(classId) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(classId ? await analyticsService.forClass(classId) : await analyticsService.mine());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rows, loading, error, refresh };
}
