import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { IconUsers, IconClipboard, IconBook, IconChart, IconArrowRight } from "../components/ui/icons.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useClassDetailViewModel } from "../viewmodels/useClassDetailViewModel.js";

const QUICK_LINKS = [
  { to: "/attendance", label: "Attendance", icon: IconClipboard },
  { to: "/lessons", label: "Lessons", icon: IconBook },
  { to: "/results", label: "Results", icon: IconChart },
];

export function ClassDetailView() {
  const { classId } = useParams();
  const { user } = useAuth();
  const { classInfo, roster, loading, error } = useClassDetailViewModel(classId);

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner label="Loading class..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={classInfo?.className}
        description={
          user?.isTeacher ? (
            <span>
              Join code: <span className="font-mono text-gray-700">{classInfo?.joinCode}</span>
            </span>
          ) : undefined
        }
      />
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={`${to}?classId=${classId}`}>
            <Card hoverable className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Icon className="h-4 w-4 text-brand-600" />
                {label}
              </span>
              <IconArrowRight className="h-4 w-4 text-gray-300" />
            </Card>
          </Link>
        ))}
      </div>

      {user?.isTeacher && (
        <Card>
          <CardHeader
            title="Roster"
            description={`${roster.length} student${roster.length === 1 ? "" : "s"} enrolled`}
          />
          {roster.length === 0 ? (
            <EmptyState
              icon={IconUsers}
              title="No students yet"
              description="Share the join code above so students can enroll."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {roster.map((s) => (
                <div key={s._id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-gray-800">{s.name}</span>
                  <span className="text-gray-400">{s.email}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </DashboardLayout>
  );
}
