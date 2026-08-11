import { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { IconUsers, IconEdit, IconTrash, IconLock, IconAlertCircle } from "../../components/ui/icons.jsx";
import { useAdminUsersViewModel } from "../../viewmodels/useAdminUsersViewModel.js";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_BADGE = { teacher: "brand", student: "default", admin: "present" };

export function AdminUsersView() {
  const { user: me } = useAuth();
  const { users, loading, error, actionError, updateUser, deleteUser, resetPassword } =
    useAdminUsersViewModel();
  const [editingUser, setEditingUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name} (${user.email})? This removes all their data.`)) return;
    await deleteUser(user.id);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Users" description="Every teacher, student, and admin account on the platform." />

      {actionError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          <IconAlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}

      <Card>
        {loading && <Spinner label="Loading users..." />}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && users.length === 0 && (
          <EmptyState icon={IconUsers} title="No users yet" />
        )}

        {!loading && users.length > 0 && (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Role</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-800 font-medium">{user.name}</td>
                    <td className="py-3 text-gray-600">{user.email}</td>
                    <td className="py-3">
                      <Badge status={ROLE_BADGE[user.role]}>{user.role}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Edit user"
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                        <button
                          title="Reset password"
                          onClick={() => setResettingUser(user)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <IconLock className="h-4 w-4" />
                        </button>
                        {user.id !== me?.id && (
                          <button
                            title="Delete user"
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={async (changes) => {
            await updateUser(editingUser.id, changes);
            setEditingUser(null);
          }}
        />
      )}

      {resettingUser && (
        <ResetPasswordModal
          user={resettingUser}
          onClose={() => setResettingUser(null)}
          onSave={async (newPassword) => {
            await resetPassword(resettingUser.id, newPassword);
            setResettingUser(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}

function EditUserModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, email, role });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 px-4">
      <Card className="w-full max-w-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Edit user</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ResetPasswordModal({ user, onClose, onSave }) {
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(newPassword);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 px-4">
      <Card className="w-full max-w-sm">
        <h2 className="font-semibold text-gray-900 mb-1">Reset password</h2>
        <p className="text-sm text-gray-500 mb-4">{user.email}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              Reset
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
