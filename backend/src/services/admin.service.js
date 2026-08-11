import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import Class from "../models/Class.model.js";
import Enrollment from "../models/Enrollment.model.js";
import Attendance from "../models/Attendance.model.js";
import Lesson from "../models/Lesson.model.js";
import LessonCompletion from "../models/LessonCompletion.model.js";
import QuizResult from "../models/QuizResult.model.js";
import { ROLES } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";
import { lessonService } from "./lesson.service.js";

const SALT_ROUNDS = 10;

// Deletes everything under a class (lessons + their quizzes/questions/results,
// enrollments, attendance) before the class document itself - reused by both
// deleteClass and deleteUser (when the user being deleted is a teacher).
async function cascadeDeleteClass(classId) {
  const lessons = await Lesson.find({ class: classId }, "_id");
  for (const lesson of lessons) {
    // eslint-disable-next-line no-await-in-loop
    await lessonService.deleteLesson(lesson._id);
  }
  await Enrollment.deleteMany({ class: classId });
  await Attendance.deleteMany({ class: classId });
  await Class.deleteOne({ _id: classId });
}

export const adminService = {
  async platformOverview() {
    const [totalTeachers, totalStudents, totalAdmins, totalClasses, totalLessons] =
      await Promise.all([
        User.countDocuments({ role: ROLES.TEACHER }),
        User.countDocuments({ role: ROLES.STUDENT }),
        User.countDocuments({ role: ROLES.ADMIN }),
        Class.countDocuments(),
        Lesson.countDocuments(),
      ]);

    return {
      totalTeachers,
      totalStudents,
      totalAdmins,
      totalUsers: totalTeachers + totalStudents + totalAdmins,
      totalClasses,
      totalLessons,
    };
  },

  async listUsers() {
    return User.find().sort({ createdAt: -1 });
  },

  async getUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return user;
  },

  async updateUser(userId, { name, email, role }) {
    const user = await this.getUser(userId);

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) throw ApiError.conflict("Another account already uses this email");
      user.email = email.toLowerCase();
    }
    if (name) user.name = name;
    if (role && Object.values(ROLES).includes(role)) user.role = role;

    await user.save();
    return user;
  },

  async resetPassword(userId, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw ApiError.notFound("User not found");
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();
  },

  async deleteUser(userId, requestingAdminId) {
    if (userId.toString() === requestingAdminId.toString()) {
      throw ApiError.badRequest("You cannot delete your own admin account");
    }

    const user = await this.getUser(userId);

    if (user.role === ROLES.TEACHER) {
      const classes = await Class.find({ teacher: userId }, "_id");
      for (const classDoc of classes) {
        // eslint-disable-next-line no-await-in-loop
        await cascadeDeleteClass(classDoc._id);
      }
    } else if (user.role === ROLES.STUDENT) {
      await Enrollment.deleteMany({ student: userId });
      await Attendance.deleteMany({ student: userId });
      await LessonCompletion.deleteMany({ student: userId });
      await QuizResult.deleteMany({ student: userId });
    }

    await User.deleteOne({ _id: userId });
  },

  async listClasses() {
    const classes = await Class.find().sort({ createdAt: -1 }).populate("teacher", "name email");

    return Promise.all(
      classes.map(async (classDoc) => {
        const [studentCount, lessonCount] = await Promise.all([
          Enrollment.countDocuments({ class: classDoc._id }),
          Lesson.countDocuments({ class: classDoc._id }),
        ]);
        return {
          id: classDoc._id,
          className: classDoc.className,
          joinCode: classDoc.joinCode,
          teacher: classDoc.teacher ? { id: classDoc.teacher._id, name: classDoc.teacher.name } : null,
          studentCount,
          lessonCount,
          createdAt: classDoc.createdAt,
        };
      })
    );
  },

  async getClass(classId) {
    const classDoc = await Class.findById(classId).populate("teacher", "name email");
    if (!classDoc) throw ApiError.notFound("Class not found");

    const roster = await Enrollment.find({ class: classId }).populate("student", "name email");
    const lessons = await Lesson.find({ class: classId }).sort({ createdAt: -1 });

    return {
      id: classDoc._id,
      className: classDoc.className,
      joinCode: classDoc.joinCode,
      teacher: classDoc.teacher ? { id: classDoc.teacher._id, name: classDoc.teacher.name } : null,
      roster: roster.map((e) => e.student).filter(Boolean),
      lessons,
    };
  },

  async deleteClass(classId) {
    const classDoc = await Class.findById(classId);
    if (!classDoc) throw ApiError.notFound("Class not found");
    await cascadeDeleteClass(classId);
  },
};
