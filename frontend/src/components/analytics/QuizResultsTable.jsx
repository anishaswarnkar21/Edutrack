import { EmptyState } from "../ui/EmptyState.jsx";
import { ProgressBar } from "../ui/ProgressBar.jsx";
import { IconChart } from "../ui/icons.jsx";

function toneFor(percent) {
  if (percent >= 75) return "green";
  if (percent >= 50) return "yellow";
  return "red";
}

export function QuizResultsTable({ results }) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon={IconChart}
        title="No quiz results yet"
        description="Complete a lesson and take its quiz to see your results here."
      />
    );
  }

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="py-2 font-medium">Lesson</th>
            <th className="py-2 font-medium">Score</th>
            <th className="py-2 font-medium">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const percent = Math.round((r.score / r.totalQuestions) * 100);
            return (
              <tr key={r._id} className="border-b border-gray-50 last:border-0">
                <td className="py-3 text-gray-800 font-medium">{r.lessonTitle}</td>
                <td className="py-3 w-48">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-xs w-16 shrink-0">
                      {r.score}/{r.totalQuestions} ({percent}%)
                    </span>
                    <ProgressBar percent={percent} tone={toneFor(percent)} />
                  </div>
                </td>
                <td className="py-3 text-gray-500">{new Date(r.submittedAt).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
