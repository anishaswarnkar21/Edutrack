import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { IconCheckCircle, IconArrowRight } from "../../components/ui/icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLessonDetailViewModel } from "../../viewmodels/useLessonDetailViewModel.js";

export function LessonDetailView() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const { lesson, fileUrl, completed, loading, error, marking, markComplete } =
    useLessonDetailViewModel(lessonId);

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner label="Loading lesson..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title={lesson?.title} />
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Card className="mb-6 p-2">
        {fileUrl ? (
          <iframe title={lesson?.title} src={fileUrl} className="w-full h-[70vh] rounded-lg" />
        ) : (
          <p className="text-sm text-gray-500 p-3">PDF preview unavailable.</p>
        )}
      </Card>

      {user?.isStudent && (
        <Card className="flex items-center justify-between flex-wrap gap-3">
          {completed ? (
            <>
              <p className="text-sm text-green-700 flex items-center gap-1.5">
                <IconCheckCircle className="h-4 w-4" /> Lesson marked as completed.
              </p>
              <Link to={`/lessons/${lessonId}/quiz`}>
                <Button>
                  Take quiz
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Mark this lesson complete to unlock its AI-generated quiz.
              </p>
              <Button onClick={markComplete} loading={marking}>
                Mark as completed
              </Button>
            </>
          )}
        </Card>
      )}

      {user?.isTeacher && (
        <Card className="flex items-center justify-between flex-wrap gap-3">
          {lesson?.quizStatus === "ready" ? (
            <>
              <p className="text-sm text-gray-600">
                Review the AI-generated quiz and edit questions or answers before students take it.
              </p>
              <Link to={`/lessons/${lessonId}/quiz`}>
                <Button>
                  View &amp; edit quiz
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              {lesson?.quizStatus === "failed"
                ? "Quiz generation failed - retry it from the lessons list."
                : "Quiz is still generating - check back shortly."}
            </p>
          )}
        </Card>
      )}
    </DashboardLayout>
  );
}
