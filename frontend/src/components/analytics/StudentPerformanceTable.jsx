import { EmptyState } from "../ui/EmptyState.jsx";
import { ProgressBar } from "../ui/ProgressBar.jsx";
import { IconChart } from "../ui/icons.jsx";
import { RiskBadge, isAtRisk } from "./RiskBadge.jsx";

function toneFor(percent) {
  if (percent === null || percent === undefined) return "brand";
  if (percent >= 75) return "green";
  if (percent >= 50) return "yellow";
  return "red";
}

function riskReasons(row) {
  const reasons = [];
  if (row.attendancePercentage < 75) reasons.push("low_attendance");
  if (row.averageQuizScorePercent !== null && row.averageQuizScorePercent < 50) reasons.push("low_quiz_score");
  return reasons;
}

export function StudentPerformanceTable({ rows, showRisk = false }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={IconChart}
        title="No analytics data yet"
        description="Data appears once attendance, lessons, and quizzes have activity."
      />
    );
  }

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="py-2 font-medium">Student</th>
            <th className="py-2 font-medium">Attendance</th>
            <th className="py-2 font-medium">Lessons completed</th>
            <th className="py-2 font-medium">Avg. quiz score</th>
            {showRisk && <th className="py-2 font-medium">Status</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.student.id} className="border-b border-gray-50 last:border-0">
              <td className="py-3 text-gray-800 font-medium whitespace-nowrap">{row.student.name}</td>
              <td className="py-3 w-40">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-xs w-9 shrink-0">{row.attendancePercentage}%</span>
                  <ProgressBar percent={row.attendancePercentage} tone={toneFor(row.attendancePercentage)} />
                </div>
              </td>
              <td className="py-3 text-gray-600">
                {row.lessonsCompleted}/{row.totalLessons}
              </td>
              <td className="py-3 w-40">
                {row.averageQuizScorePercent === null ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-xs w-9 shrink-0">
                      {row.averageQuizScorePercent}%
                    </span>
                    <ProgressBar
                      percent={row.averageQuizScorePercent}
                      tone={toneFor(row.averageQuizScorePercent)}
                    />
                  </div>
                )}
              </td>
              {showRisk && (
                <td className="py-3">
                  {isAtRisk(row) ? (
                    <RiskBadge reasons={riskReasons(row)} />
                  ) : (
                    <span className="text-xs text-gray-400">On track</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
