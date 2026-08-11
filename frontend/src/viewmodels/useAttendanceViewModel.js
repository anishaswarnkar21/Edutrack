import { useCallback, useEffect, useState } from "react";
import { attendanceService } from "../services/attendance.service.js";

export function useAttendanceViewModel(classId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRecords(await attendanceService.list(classId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordSession = useCallback(
    async (date, statusByStudentId) => {
      setSaving(true);
      setError(null);
      try {
        const recordsPayload = Object.entries(statusByStudentId).map(([studentId, status]) => ({
          studentId,
          status,
        }));
        await attendanceService.record(classId, { date, records: recordsPayload });
        await refresh();
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [classId, refresh]
  );

  return { records, loading, error, saving, recordSession, refresh };
}
