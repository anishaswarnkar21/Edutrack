import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { DashboardLayout } from "../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { RiskBadge } from "../components/analytics/RiskBadge.jsx";
import { IconLayers, IconUsers, IconClipboard, IconChart, IconBook, IconCheckCircle } from "../components/ui/icons.jsx";
import { useTeacherOverviewViewModel } from "../viewmodels/useTeacherOverviewViewModel.js";
import { useAnalyticsViewModel } from "../viewmodels/useAnalyticsViewModel.js";
import { useAdminOverviewViewModel } from "../viewmodels/useAdminOverviewViewModel.js";

export function HomeView() {
  const { user } = useAuth();
  if (user?.isAdmin) return <AdminHome />;
  return user?.isTeacher ? <TeacherHome /> : <StudentHome />;
}

function AdminHome() {
  const { overview, loading, error } = useAdminOverviewViewModel();

  return (
    <DashboardLayout>
      <PageHeader title="Overview" description="Platform-wide stats across every class." />

      {loading && <Spinner label="Loading overview..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {overview && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={IconUsers} label="Total users" value={overview.totalUsers} />
          <StatCard icon={IconUsers} label="Teachers" value={overview.totalTeachers} accent="green" />
          <StatCard icon={IconUsers} label="Students" value={overview.totalStudents} accent="yellow" />
          <StatCard icon={IconLayers} label="Classes" value={overview.totalClasses} />
          <StatCard icon={IconBook} label="Lessons" value={overview.totalLessons} />
          <StatCard icon={IconChart} label="Admins" value={overview.totalAdmins} />
        </div>
      )}
    </DashboardLayout>
  );
}

function TeacherHome() {
  const { overview, loading, error } = useTeacherOverviewViewModel();

  return (
    <DashboardLayout>
      <PageHeader title="Home" description="Overview across all of your classes." />

      {loading && <Spinner label="Loading overview..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {overview && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={IconLayers} label="Classes" value={overview.totalClasses} />
            <StatCard icon={IconUsers} label="Students" value={overview.totalStudents} accent="green" />
            <StatCard
              icon={IconClipboard}
              label="Avg. attendance"
              value={overview.averageAttendancePercentage === null ? "—" : `${overview.averageAttendancePercentage}%`}
              accent="yellow"
            />
            <StatCard
              icon={IconChart}
              label="Avg. quiz score"
              value={overview.averageQuizScorePercent === null ? "—" : `${overview.averageQuizScorePercent}%`}
            />
          </div>

          <Card>
            <CardHeader
              title="Students at risk"
              description="Below 75% attendance or 50% average quiz score."
            />
            {overview.atRiskStudents.length === 0 ? (
              <EmptyState
                icon={IconCheckCircle}
                title="No students flagged"
                description="Everyone is meeting the attendance and quiz score thresholds."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {overview.atRiskStudents.map((row) => (
                  <div
                    key={`${row.class.id}-${row.student.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{row.student.name}</p>
                      <p className="text-xs text-gray-500">{row.class.className}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Attendance: {row.attendancePercentage}%</span>
                      <span>
                        Quiz avg:{" "}
                        {row.averageQuizScorePercent === null ? "—" : `${row.averageQuizScorePercent}%`}
                      </span>
                      <RiskBadge reasons={row.reasons} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}

function StudentHome() {
  const { rows, loading, error } = useAnalyticsViewModel();

  const totalLessonsCompleted = rows.reduce((sum, r) => sum + r.lessonsCompleted, 0);
  const totalLessons = rows.reduce((sum, r) => sum + r.totalLessons, 0);
  const attendanceValues = rows.map((r) => r.attendancePercentage);
  const avgAttendance = attendanceValues.length
    ? Math.round((attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length) * 10) / 10
    : null;
  const quizScores = rows.filter((r) => r.averageQuizScorePercent !== null);
  const highestQuiz = quizScores.length ? Math.max(...quizScores.map((r) => r.averageQuizScorePercent)) : null;
  const weakest = quizScores.length
    ? quizScores.reduce((min, r) => (r.averageQuizScorePercent < min.averageQuizScorePercent ? r : min))
    : null;

  return (
    <DashboardLayout>
      <PageHeader title="Home" description="Your learning snapshot across all classes." />

      {loading && <Spinner label="Loading..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={IconBook}
              label="Lessons completed"
              value={`${totalLessonsCompleted}/${totalLessons}`}
            />
            <StatCard
              icon={IconClipboard}
              label="Attendance"
              value={avgAttendance === null ? "—" : `${avgAttendance}%`}
              accent="yellow"
            />
            <StatCard
              icon={IconChart}
              label="Highest quiz score"
              value={highestQuiz === null ? "—" : `${highestQuiz}%`}
              accent="green"
            />
            <StatCard icon={IconLayers} label="Classes" value={rows.length} />
          </div>

          {weakest && weakest.averageQuizScorePercent < 50 && (
            <Card className="mb-6 border-red-100 bg-red-50/40">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-medium text-red-800">
                    You're falling behind in {weakest.class.className}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Average quiz score: {weakest.averageQuizScorePercent}% - review recent lessons and retake
                    practice quizzes.
                  </p>
                </div>
                <Link
                  to="/results"
                  className="text-xs font-medium text-red-700 hover:underline shrink-0"
                >
                  View results
                </Link>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Your classes" />
            {rows.length === 0 ? (
              <EmptyState icon={IconLayers} title="No classes yet" description="Join a class to get started." />
            ) : (
              <div className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <div key={r.class.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <p className="text-sm font-medium text-gray-900">{r.class.className}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Lessons: {r.lessonsCompleted}/{r.totalLessons}
                      </span>
                      <span>Attendance: {r.attendancePercentage}%</span>
                      <span>
                        Quiz avg: {r.averageQuizScorePercent === null ? "—" : `${r.averageQuizScorePercent}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
