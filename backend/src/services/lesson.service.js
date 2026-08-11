import path from "path";
import Lesson, { QUIZ_STATUS } from "../models/Lesson.model.js";
import LessonCompletion from "../models/LessonCompletion.model.js";
import Quiz from "../models/Quiz.model.js";
import Question from "../models/Question.model.js";
import QuizResult from "../models/QuizResult.model.js";
import { ApiError } from "../utils/ApiError.js";
import { storageService } from "./storage.service.js";

export const lessonService = {
  async createLesson({ classId, title, file }) {
    return Lesson.create({
      class: classId,
      title,
      pdfPath: path.basename(file.path),
      originalFileName: file.originalname,
    });
  },

  async listForClass(classId) {
    return Lesson.find({ class: classId }).sort({ createdAt: -1 });
  },

  async getById(lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw ApiError.notFound("Lesson not found");
    return lesson;
  },

  async extractedTextFor(lesson, pdfService) {
    return pdfService.extractText(storageService.absolutePath(lesson.pdfPath));
  },

  async markComplete({ lessonId, studentId }) {
    return LessonCompletion.findOneAndUpdate(
      { lesson: lessonId, student: studentId },
      { $setOnInsert: { completedAt: new Date() } },
      { upsert: true, new: true }
    );
  },

  async isCompletedBy({ lessonId, studentId }) {
    return LessonCompletion.exists({ lesson: lessonId, student: studentId });
  },

  async countCompletedForStudentInClass({ classId, studentId }) {
    const lessons = await Lesson.find({ class: classId }, "_id");
    const lessonIds = lessons.map((l) => l._id);
    if (!lessonIds.length) return { completed: 0, total: 0 };

    const completed = await LessonCompletion.countDocuments({
      lesson: { $in: lessonIds },
      student: studentId,
    });
    return { completed, total: lessonIds.length };
  },

  // Removes any existing Quiz/Questions/QuizResults for a lesson - used when the
  // PDF is replaced, the lesson is deleted outright, or a regeneration is
  // requested (see quiz.service.js#generateInBackground).
  async clearQuiz(lessonId) {
    const quiz = await Quiz.findOne({ lesson: lessonId });
    if (!quiz) return;
    await Question.deleteMany({ quiz: quiz._id });
    await QuizResult.deleteMany({ quiz: quiz._id });
    await Quiz.deleteOne({ _id: quiz._id });
  },

  async updateLesson({ lessonId, title, file }) {
    const lesson = await this.getById(lessonId);

    if (title) lesson.title = title;

    const pdfReplaced = Boolean(file);
    if (pdfReplaced) {
      const previousPath = lesson.pdfPath;
      lesson.pdfPath = path.basename(file.path);
      lesson.originalFileName = file.originalname;
      lesson.quizStatus = QUIZ_STATUS.PENDING;
      lesson.quizError = undefined;
      await this.clearQuiz(lessonId);
      storageService.delete(previousPath);
    }

    await lesson.save();
    return { lesson, pdfReplaced };
  },

  async deleteLesson(lessonId) {
    const lesson = await this.getById(lessonId);
    await this.clearQuiz(lessonId);
    await LessonCompletion.deleteMany({ lesson: lessonId });
    storageService.delete(lesson.pdfPath);
    await Lesson.deleteOne({ _id: lessonId });
  },
};
