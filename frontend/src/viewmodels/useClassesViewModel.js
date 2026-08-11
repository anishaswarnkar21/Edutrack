import { useCallback, useEffect, useState } from "react";
import { classService } from "../services/class.service.js";

// ViewModel backing both the teacher and student dashboards' class list.
export function useClassesViewModel() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setClasses(await classService.listMine());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createClass = useCallback(
    async (className) => {
      setActionError(null);
      try {
        const created = await classService.create(className);
        setClasses((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        setActionError(err.message);
        throw err;
      }
    },
    []
  );

  const joinClass = useCallback(async (joinCode) => {
    setActionError(null);
    try {
      const joined = await classService.join(joinCode);
      await refresh();
      return joined;
    } catch (err) {
      setActionError(err.message);
      throw err;
    }
  }, [refresh]);

  return { classes, loading, error, actionError, createClass, joinClass, refresh };
}
