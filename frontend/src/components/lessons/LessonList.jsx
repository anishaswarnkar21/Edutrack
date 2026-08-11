import { Link } from "react-router-dom";
import { IconFile, IconArrowRight, IconCheckCircle, IconEdit, IconTrash, IconRefresh } from "../ui/icons.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { QuizStatusBadge } from "./QuizStatusBadge.jsx";

export function LessonList({ lessons, isTeacher, onEdit, onDelete, onRegenerate }) {
  if (lessons.length === 0) {
    return (
      <EmptyState
        icon={IconFile}
        title="No lessons uploaded yet"
        description="Uploaded lesson PDFs will appear here."
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group">
          <Link to={`/lessons/${lesson.id}`} className="flex items-center gap-3 min-w-0 flex-1">
            <span className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <IconFile className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
              <p className="text-xs text-gray-500">
                Uploaded {new Date(lesson.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            {lesson.completed && (
              <span className="text-green-600" title="Completed">
                <IconCheckCircle className="h-4 w-4" />
              </span>
            )}
            <QuizStatusBadge status={lesson.quizStatus} />

            {isTeacher && (
              <>
                {lesson.quizStatus === "failed" && (
                  <button
                    title="Retry quiz generation"
                    onClick={() => onRegenerate(lesson.id)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <IconRefresh className="h-4 w-4" />
                  </button>
                )}
                <button
                  title="Edit lesson"
                  onClick={() => onEdit(lesson)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <IconEdit className="h-4 w-4" />
                </button>
                <button
                  title="Delete lesson"
                  onClick={() => onDelete(lesson)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </>
            )}

            <Link to={`/lessons/${lesson.id}`}>
              <IconArrowRight className="h-4 w-4 text-gray-300 group-hover:text-brand-600 transition-colors" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
