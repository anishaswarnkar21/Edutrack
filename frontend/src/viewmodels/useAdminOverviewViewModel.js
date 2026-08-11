import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/admin.service.js";

export function useAdminOverviewViewModel() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await adminService.overview());
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
