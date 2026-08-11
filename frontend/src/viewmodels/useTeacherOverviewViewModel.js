import { useCallback, useEffect, useState } from "react";
import { analyticsService } from "../services/analytics.service.js";

export function useTeacherOverviewViewModel() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await analyticsService.teacherOverview());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { overview, loading, error, refresh };
}
