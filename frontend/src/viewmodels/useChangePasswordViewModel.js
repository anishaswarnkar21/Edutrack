import { useCallback, useState } from "react";
import { authService } from "../services/auth.service.js";

export function useChangePasswordViewModel() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { changePassword, saving, error, success };
}
