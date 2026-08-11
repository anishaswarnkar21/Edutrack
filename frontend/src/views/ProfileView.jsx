import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { IconAlertCircle, IconCheckCircle, IconLock } from "../components/ui/icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useChangePasswordViewModel } from "../viewmodels/useChangePasswordViewModel.js";

export function ProfileView() {
  const { user } = useAuth();
  const { changePassword, saving, error, success } = useChangePasswordViewModel();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword !== confirmPassword) {
      setFormError("New password and confirmation do not match");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // error already surfaced by the viewmodel
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

  return (
    <DashboardLayout>
      <PageHeader title="Profile" description="Your account details and security settings." />

      <div className="space-y-6 max-w-lg">
        <Card>
          <CardHeader title="Account" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </span>
              <div>
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500">Role</span>
              <span className="capitalize text-gray-800 font-medium">{user?.role}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Change password" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <input
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
              <input
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {(formError || error) && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <IconAlertCircle className="h-4 w-4 shrink-0" />
                {formError || error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <IconCheckCircle className="h-4 w-4 shrink-0" />
                Password updated.
              </div>
            )}

            <Button type="submit" loading={saving}>
              <IconLock className="h-4 w-4" />
              Update password
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
