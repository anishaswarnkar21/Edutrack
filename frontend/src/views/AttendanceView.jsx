import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { ClassFilterBar } from "../components/classes/ClassFilterBar.jsx";
import { AttendanceTable } from "../components/attendance/AttendanceTable.jsx";
import { AttendanceSessionForm } from "../components/attendance/AttendanceSessionForm.jsx";
import { MonthlyAttendanceChart } from "../components/attendance/MonthlyAttendanceChart.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useClassFilter } from "../viewmodels/useClassFilter.js";
import { useClassDetailViewModel } from "../viewmodels/useClassDetailViewModel.js";
import { useAttendanceViewModel } from "../viewmodels/useAttendanceViewModel.js";

export function AttendanceView() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { classes, loading: classesLoading, selectedClassId, setSelectedClassId } = useClassFilter(
    searchParams.get("classId")
  );

  return (
    <DashboardLayout>
      <PageHeader title="Attendance" description="Monthly trend and session-by-session history." />

      {classesLoading && <Spinner label="Loading classes..." />}
      {!classesLoading && (
        <>
          <ClassFilterBar classes={classes} selectedClassId={selectedClassId} onChange={setSelectedClassId} />
          {selectedClassId && <AttendanceForClass classId={selectedClassId} isTeacher={user?.isTeacher} />}
        </>
      )}
    </DashboardLayout>
  );
}

function AttendanceForClass({ classId, isTeacher }) {
  const { roster } = useClassDetailViewModel(classId);
  const { records, loading, error, saving, recordSession } = useAttendanceViewModel(classId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Monthly trend" />
        {loading ? <Spinner label="Loading..." /> : <MonthlyAttendanceChart records={records} />}
      </Card>

      {isTeacher && (
        <Card>
          <CardHeader title="Record today's session" />
          <AttendanceSessionForm roster={roster} onSubmit={recordSession} saving={saving} />
        </Card>
      )}

      <Card>
        <CardHeader title={isTeacher ? "All attendance records" : "Your attendance history"} />
        {loading && <Spinner label="Loading..." />}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && <AttendanceTable records={records} />}
      </Card>
    </div>
  );
}
