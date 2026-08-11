import { useCallback, useEffect, useState } from "react";
import { adminService } from "../services/admin.service.js";

export function useAdminUsersViewModel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await adminService.listUsers());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateUser = useCallback(async (userId, changes) => {
    setActionError(null);
    try {
      const updated = await adminService.updateUser(userId, changes);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      return updated;
    } catch (err) {
      setActionError(err.message);
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    setActionError(null);
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setActionError(err.message);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (userId, newPassword) => {
    setActionError(null);
    try {
      await adminService.resetPassword(userId, newPassword);
    } catch (err) {
      setActionError(err.message);
      throw err;
    }
  }, []);

  return { users, loading, error, actionError, refresh, updateUser, deleteUser, resetPassword };
}
