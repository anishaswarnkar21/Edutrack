import Class from "../models/Class.model.js";
import Enrollment from "../models/Enrollment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateJoinCode } from "../utils/generateJoinCode.js";

async function generateUniqueJoinCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateJoinCode();
    // eslint-disable-next-line no-await-in-loop
    const taken = await Class.exists({ joinCode: code });
    if (!taken) return code;
  }
  throw new Error("Could not generate a unique join code, please retry");
}

export const classService = {
  async createClass({ className, teacherId }) {
    const joinCode = await generateUniqueJoinCode();
    return Class.create({ className, teacher: teacherId, joinCode });
  },

  async joinClass({ joinCode, studentId }) {
    const classDoc = await Class.findOne({ joinCode: joinCode.toUpperCase() });
    if (!classDoc) {
      throw ApiError.notFound("No class found with that join code");
    }

    const existing = await Enrollment.findOne({ class: classDoc._id, student: studentId });
    if (existing) {
      throw ApiError.conflict("Already enrolled in this class");
    }

    await Enrollment.create({ class: classDoc._id, student: studentId });
    return classDoc;
  },

  async listForUser(user) {
    if (user.role === "teacher") {
      return Class.find({ teacher: user._id }).sort({ createdAt: -1 });
    }
    const enrollments = await Enrollment.find({ student: user._id }).populate("class");
    return enrollments.map((e) => e.class).filter(Boolean);
  },

  async assertMembership(classId, user) {
    const classDoc = await Class.findById(classId);
    if (!classDoc) throw ApiError.notFound("Class not found");

    if (user.role === "teacher") {
      if (classDoc.teacher.toString() !== user._id.toString()) {
        throw ApiError.forbidden("You do not teach this class");
      }
    } else {
      const enrolled = await Enrollment.exists({ class: classId, student: user._id });
      if (!enrolled) throw ApiError.forbidden("You are not enrolled in this class");
    }
    return classDoc;
  },

  async getRoster(classId) {
    const enrollments = await Enrollment.find({ class: classId }).populate(
      "student",
      "name email"
    );
    return enrollments.map((e) => e.student);
  },
};
