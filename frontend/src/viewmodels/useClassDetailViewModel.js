import { useCallback, useEffect, useState } from "react";
import { classService } from "../services/class.service.js";
import { useAuth } from "../context/AuthContext.jsx";

export function useClassDetailViewModel(classId) {
  const { user } = useAuth();
  const [classInfo, setClassInfo] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await classService.getById(classId);
      setClassInfo(info);
      if (user?.isTeacher) {
        setRoster(await classService.getRoster(classId));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { classInfo, roster, loading, error, refresh };
}
