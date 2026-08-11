import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/admin.service.js";

export function useAdminClassesViewModel() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setClasses(await adminService.listClasses());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const deleteClass = useCallback(async (classId) => {
    setActionError(null);
    try {
      await adminService.deleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
    } catch (err) {
      setActionError(err.message);
      throw err;
    }
  }, []);

  return { classes, loading, error, actionError, refresh, deleteClass };
}
