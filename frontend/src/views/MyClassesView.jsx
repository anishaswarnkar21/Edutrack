import { useAuth } from "../context/AuthContext.jsx";
import { TeacherDashboardView } from "./teacher/TeacherDashboardView.jsx";
import { StudentDashboardView } from "./student/StudentDashboardView.jsx";

export function MyClassesView() {
  const { user } = useAuth();
  return user?.isTeacher ? <TeacherDashboardView /> : <StudentDashboardView />;
}
