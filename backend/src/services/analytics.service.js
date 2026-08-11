import Lesson from "../models/Lesson.model.js";
import Quiz from "../models/Quiz.model.js";
import QuizResult from "../models/QuizResult.model.js";
import Enrollment from "../models/Enrollment.model.js";
import Class from "../models/Class.model.js";
import { classService } from "./class.service.js";
import { attendanceService } from "./attendance.service.js";
import { lessonService } from "./lesson.service.js";
import { RISK_THRESHOLDS } from "../constants.js";

async function quizAverageForStudentInClass(classId, studentId) {
  const lessons = await Lesson.find({ class: classId }, "_id");
  const lessonIds = lessons.map((l) => l._id);
  if (!lessonIds.length) return { averageScorePercent: null, quizzesTaken: 0 };

  const quizzes = await Quiz.find({ lesson: { $in: lessonIds } }, "_id");
  const quizIds = quizzes.map((q) => q._id);
  if (!quizIds.length) return { averageScorePercent: null, quizzesTaken: 0 };

  const results = await QuizResult.find({ quiz: { $in: quizIds }, student: studentId });
  if (!results.length) return { averageScorePercent: null, quizzesTaken: 0 };

  const percentSum = results.reduce((sum, r) => sum + r.score / r.totalQuestions, 0);
  return {
    averageScorePercent: Math.round((percentSum / results.length) * 1000) / 10,
    quizzesTaken: results.length,
  };
}

async function studentBreakdown(classId, student) {
  const [attendance, lessonsProgress, quizStats] = await Promise.all([
    attendanceService.summaryForStudent(classId, student._id),
    lessonService.countCompletedForStudentInClass({ classId, studentId: student._id }),
    quizAverageForStudentInClass(classId, student._id),
  ]);

  return {
    student: { id: student._id, name: student.name, email: student.email },
    attendancePercentage: attendance.attendancePercentage,
    lessonsCompleted: lessonsProgress.completed,
    totalLessons: lessonsProgress.total,
    averageQuizScorePercent: quizStats.averageScorePercent,
    quizzesTaken: quizStats.quizzesTaken,
  };
}

export const analyticsService = {
  async forClass(classId) {
    const roster = await classService.getRoster(classId);
    return Promise.all(roster.map((student) => studentBreakdown(classId, student)));
  },

  async forStudentAcrossClasses(studentId) {
    const enrollments = await Enrollment.find({ student: studentId }).populate("class");
    return Promise.all(
      enrollments
        .filter((e) => e.class)
        .map(async (e) => ({
          class: { id: e.class._id, className: e.class.className },
          ...(await studentBreakdown(e.class._id, { _id: studentId })),
        }))
    );
  },

  // Powers the teacher's Home page: totals across all classes they teach, plus
  // which students are falling behind (below either risk threshold) and where.
  async forTeacherOverview(teacherId) {
    const classes = await Class.find({ teacher: teacherId });

    const perClass = await Promise.all(
      classes.map(async (c) => ({
        class: { id: c._id, className: c.className },
        rows: await this.forClass(c._id),
      }))
    );

    const uniqueStudentIds = new Set();
    const atRiskStudents = [];
    let attendanceSum = 0;
    let attendanceCount = 0;
    let quizSum = 0;
    let quizCount = 0;

    for (const { class: classInfo, rows } of perClass) {
      for (const row of rows) {
        uniqueStudentIds.add(row.student.id.toString());

        attendanceSum += row.attendancePercentage;
        attendanceCount += 1;
        if (row.averageQuizScorePercent !== null) {
          quizSum += row.averageQuizScorePercent;
          quizCount += 1;
        }

        const lowAttendance = row.attendancePercentage < RISK_THRESHOLDS.ATTENDANCE_PERCENT;
        const lowQuizScore =
          row.averageQuizScorePercent !== null &&
          row.averageQuizScorePercent < RISK_THRESHOLDS.QUIZ_SCORE_PERCENT;

        if (lowAttendance || lowQuizScore) {
          atRiskStudents.push({
            ...row,
            class: classInfo,
            reasons: [
              lowAttendance ? "low_attendance" : null,
              lowQuizScore ? "low_quiz_score" : null,
            ].filter(Boolean),
          });
        }
      }
    }

    atRiskStudents.sort((a, b) => a.attendancePercentage - b.attendancePercentage);

    return {
      totalClasses: classes.length,
      totalStudents: uniqueStudentIds.size,
      averageAttendancePercentage:
        attendanceCount === 0 ? null : Math.round((attendanceSum / attendanceCount) * 10) / 10,
      averageQuizScorePercent: quizCount === 0 ? null : Math.round((quizSum / quizCount) * 10) / 10,
      atRiskStudents,
      classes: perClass.map(({ class: classInfo, rows }) => ({ class: classInfo, studentCount: rows.length })),
    };
  },
};
