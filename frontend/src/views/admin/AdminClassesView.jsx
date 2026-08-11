import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { IconLayers, IconTrash, IconAlertCircle } from "../../components/ui/icons.jsx";
import { useAdminClassesViewModel } from "../../viewmodels/useAdminClassesViewModel.js";

export function AdminClassesView() {
  const { classes, loading, error, actionError, deleteClass } = useAdminClassesViewModel();

  const handleDelete = async (classRoom) => {
    if (
      !window.confirm(
        `Delete "${classRoom.className}"? This removes all its lessons, quizzes, attendance, and enrollments.`
      )
    )
      return;
    await deleteClass(classRoom.id);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Classes" description="Every class across every teacher on the platform." />

      {actionError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          <IconAlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}

      <Card>
        {loading && <Spinner label="Loading classes..." />}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && classes.length === 0 && <EmptyState icon={IconLayers} title="No classes yet" />}

        {!loading && classes.length > 0 && (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 font-medium">Class</th>
                  <th className="py-2 font-medium">Teacher</th>
                  <th className="py-2 font-medium">Join code</th>
                  <th className="py-2 font-medium">Students</th>
                  <th className="py-2 font-medium">Lessons</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-800 font-medium">{c.className}</td>
                    <td className="py-3 text-gray-600">{c.teacher?.name || "—"}</td>
                    <td className="py-3 text-gray-500 font-mono text-xs">{c.joinCode}</td>
                    <td className="py-3 text-gray-600">{c.studentCount}</td>
                    <td className="py-3 text-gray-600">{c.lessonCount}</td>
                    <td className="py-3 text-right">
                      <button
                        title="Delete class"
                        onClick={() => handleDelete(c)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
