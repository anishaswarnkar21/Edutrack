const REASON_LABEL = {
  low_attendance: "Low attendance",
  low_quiz_score: "Low quiz score",
};

export function isAtRisk(row, { attendanceThreshold = 75, quizThreshold = 50 } = {}) {
  const lowAttendance = row.attendancePercentage < attendanceThreshold;
  const lowQuizScore = row.averageQuizScorePercent !== null && row.averageQuizScorePercent < quizThreshold;
  return lowAttendance || lowQuizScore;
}

export function RiskBadge({ reasons = [] }) {
  if (reasons.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
      At risk
      <span className="text-red-400">·</span>
      {reasons.map((r) => REASON_LABEL[r] || r).join(", ")}
    </span>
  );
}
