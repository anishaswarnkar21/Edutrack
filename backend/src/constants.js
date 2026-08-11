export const ROLES = Object.freeze({
  TEACHER: "teacher",
  STUDENT: "student",
  ADMIN: "admin",
});

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
});

// A student is flagged "at risk" on the teacher's home overview if either falls
// below these thresholds. Applied in analytics.service.js#forTeacherOverview.
export const RISK_THRESHOLDS = Object.freeze({
  ATTENDANCE_PERCENT: 75,
  QUIZ_SCORE_PERCENT: 50,
});
