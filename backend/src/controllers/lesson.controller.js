import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { classService } from "../services/class.service.js";
import { lessonService } from "../services/lesson.service.js";
import { storageService } from "../services/storage.service.js";
import { quizService } from "../services/quiz.service.js";

export const uploadLesson = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { title } = req.body;

  await classService.assertMembership(classId, req.user);

  if (!title) throw ApiError.badRequest("title is required");
  if (!req.file) throw ApiError.badRequest("A PDF file is required");

  const lesson = await lessonService.createLesson({ classId, title, file: req.file });

  // Fire-and-forget: quiz generation runs in the background so the upload
  // response isn't held up by a ~5-10s AI call. generateInBackground never
  // throws - failures are recorded on the lesson's quizStatus/quizError.
  quizService.generateInBackground(lesson._id);

  res.status(201).json(new ApiResponse(201, lesson, "Lesson uploaded"));
});

export const listLessons = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  await classService.assertMembership(classId, req.user);

  const lessons = await lessonService.listForClass(classId);
  res.json(new ApiResponse(200, lessons));
});

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.getById(req.params.lessonId);
  await classService.assertMembership(lesson.class, req.user);

  let completed = false;
  if (req.user.role === "student") {
    completed = Boolean(
      await lessonService.isCompletedBy({ lessonId: lesson._id, studentId: req.user._id })
    );
  }

  res.json(new ApiResponse(200, { ...lesson.toObject(), completed }));
});

export const downloadLessonFile = asyncHandler(async (req, res) => {
  const lesson = await lessonService.getById(req.params.lessonId);
  await classService.assertMembership(lesson.class, req.user);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${encodeURIComponent(lesson.originalFileName)}"`
  );
  storageService.read(lesson.pdfPath).pipe(res);
});

export const completeLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.getById(req.params.lessonId);
  await classService.assertMembership(lesson.class, req.user);

  const completion = await lessonService.markComplete({
    lessonId: lesson._id,
    studentId: req.user._id,
  });
  res.json(new ApiResponse(200, completion, "Lesson marked as completed"));
});

export const updateLesson = asyncHandler(async (req, res) => {
  const existing = await lessonService.getById(req.params.lessonId);
  await classService.assertMembership(existing.class, req.user);

  const { title } = req.body;
  if (!title && !req.file) {
    throw ApiError.badRequest("Provide a new title and/or a replacement PDF file");
  }

  const { lesson, pdfReplaced } = await lessonService.updateLesson({
    lessonId: req.params.lessonId,
    title,
    file: req.file,
  });

  if (pdfReplaced) {
    quizService.generateInBackground(lesson._id);
  }

  res.json(new ApiResponse(200, lesson, "Lesson updated"));
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.getById(req.params.lessonId);
  await classService.assertMembership(lesson.class, req.user);

  await lessonService.deleteLesson(req.params.lessonId);
  res.json(new ApiResponse(200, null, "Lesson deleted"));
});

export const regenerateQuiz = asyncHandler(async (req, res) => {
  const lesson = await lessonService.getById(req.params.lessonId);
  await classService.assertMembership(lesson.class, req.user);

  quizService.generateInBackground(lesson._id);
  res.status(202).json(new ApiResponse(202, null, "Quiz regeneration started"));
});
