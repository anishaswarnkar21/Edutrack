import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { ClassFilterBar } from "../components/classes/ClassFilterBar.jsx";
import { StudentPerformanceTable } from "../components/analytics/StudentPerformanceTable.jsx";
import { QuizResultsTable } from "../components/analytics/QuizResultsTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useClassFilter } from "../viewmodels/useClassFilter.js";
import { useAnalyticsViewModel } from "../viewmodels/useAnalyticsViewModel.js";
import { useMyQuizResultsViewModel } from "../viewmodels/useMyQuizResultsViewModel.js";

export function ResultsView() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { classes, loading: classesLoading, selectedClassId, setSelectedClassId } = useClassFilter(
    searchParams.get("classId")
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Results"
        description={
          user?.isTeacher
            ? "Per-student attendance, lesson completion, and quiz performance."
            : "Your quiz scores, lesson by lesson."
        }
      />

      {classesLoading && <Spinner label="Loading classes..." />}
      {!classesLoading && (
        <>
          <ClassFilterBar classes={classes} selectedClassId={selectedClassId} onChange={setSelectedClassId} />
          {selectedClassId &&
            (user?.isTeacher ? (
              <TeacherResults classId={selectedClassId} />
            ) : (
              <StudentResults classId={selectedClassId} />
            ))}
        </>
      )}
    </DashboardLayout>
  );
}

function TeacherResults({ classId }) {
  const { rows, loading, error } = useAnalyticsViewModel(classId);
  return (
    <Card>
      <CardHeader title="Student performance" />
      {loading && <Spinner label="Loading..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && <StudentPerformanceTable rows={rows} showRisk />}
    </Card>
  );
}

function StudentResults({ classId }) {
  const { results, loading, error } = useMyQuizResultsViewModel(classId);
  return (
    <Card>
      <CardHeader title="Quiz results" />
      {loading && <Spinner label="Loading..." />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && <QuizResultsTable results={results} />}
    </Card>
  );
}
