import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { LoginView } from "../views/auth/LoginView.jsx";
import { RegisterView } from "../views/auth/RegisterView.jsx";
import { HomeView } from "../views/HomeView.jsx";
import { MyClassesView } from "../views/MyClassesView.jsx";
import { ClassDetailView } from "../views/ClassDetailView.jsx";
import { AttendanceView } from "../views/AttendanceView.jsx";
import { LessonsView } from "../views/LessonsView.jsx";
import { ResultsView } from "../views/ResultsView.jsx";
import { ProfileView } from "../views/ProfileView.jsx";
import { LessonDetailView } from "../views/student/LessonDetailView.jsx";
import { QuizPageView } from "../views/student/QuizPageView.jsx";
import { AdminUsersView } from "../views/admin/AdminUsersView.jsx";
import { AdminClassesView } from "../views/admin/AdminClassesView.jsx";

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/register" element={<RegisterView />} />

      <Route path="/home" element={<Protected><HomeView /></Protected>} />
      <Route path="/classes" element={<Protected><MyClassesView /></Protected>} />
      <Route path="/classes/:classId" element={<Protected><ClassDetailView /></Protected>} />
      <Route path="/attendance" element={<Protected><AttendanceView /></Protected>} />
      <Route path="/lessons" element={<Protected><LessonsView /></Protected>} />
      <Route path="/lessons/:lessonId" element={<Protected><LessonDetailView /></Protected>} />
      <Route path="/lessons/:lessonId/quiz" element={<Protected><QuizPageView /></Protected>} />
      <Route path="/results" element={<Protected><ResultsView /></Protected>} />
      <Route path="/profile" element={<Protected><ProfileView /></Protected>} />

      <Route path="/admin/users" element={<Protected><AdminUsersView /></Protected>} />
      <Route path="/admin/classes" element={<Protected><AdminClassesView /></Protected>} />

      <Route path="/dashboard" element={<Navigate to="/home" replace />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
