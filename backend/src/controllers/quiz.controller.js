import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { classService } from "../services/class.service.js";
import { lessonService } from "../services/lesson.service.js";
import { quizService } from "../services/quiz.service.js";
import QuizResult from "../models/QuizResult.model.js";
import Quiz from "../models/Quiz.model.js";
import { QUIZ_STATUS } from "../models/Lesson.model.js";

export const getQuizForLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const lesson = await lessonService.getById(lessonId);
  await classService.assertMembership(lesson.class, req.user);

  if (req.user.role === "teacher") {
    const existing = await quizService.getQuizForLesson(lessonId);
    if (!existing) {
      return res.json(new ApiResponse(200, { ready: false, status: lesson.quizStatus }));
    }

    const { quiz, questions } = existing;
    return res.json(
      new ApiResponse(200, {
        ready: true,
        quizId: quiz._id,
        status: lesson.quizStatus,
        submitted: false,
        questions: quizService.toTeacherFacing(questions),
      })
    );
  }

  const completed = await lessonService.isCompletedBy({
    lessonId,
    studentId: req.user._id,
  });
  if (!completed) {
    throw ApiError.forbidden("Mark this lesson as completed before taking its quiz");
  }

  // Generation was already kicked off in the background on upload - this
  // shouldn't normally re-trigger it while that's still in flight.
  if (lesson.quizStatus === QUIZ_STATUS.GENERATING) {
    return res.json(new ApiResponse(200, { ready: false, status: lesson.quizStatus }));
  }

  // PENDING here means generation never actually started - either a lesson
  // uploaded before this feature existed (Mongoose applies the schema default
  // on read, so old docs *appear* 'pending' forever with no job ever queued for
  // them), or an unlikely race right after upload. FAILED means a previous
  // attempt errored. Both cases: kick off generation now rather than leaving
  // the client polling forever for a job that will never run.
  if (lesson.quizStatus === QUIZ_STATUS.PENDING || lesson.quizStatus === QUIZ_STATUS.FAILED) {
    await quizService.generateInBackground(lessonId);
    const refreshed = await lessonService.getById(lessonId);
    if (refreshed.quizStatus !== QUIZ_STATUS.READY) {
      return res.json(new ApiResponse(200, { ready: false, status: refreshed.quizStatus }));
    }
  }

  const { quiz, questions } = await quizService.getOrGenerateForLesson(lessonId);

  const existingResult = await QuizResult.findOne({ quiz: quiz._id, student: req.user._id });
  if (existingResult) {
    return res.json(
      new ApiResponse(200, {
        ready: true,
        quizId: quiz._id,
        submitted: true,
        result: existingResult,
        questions: quizService.toReviewFacing(questions, existingResult),
      })
    );
  }

  res.json(
    new ApiResponse(200, {
      ready: true,
      quizId: quiz._id,
      submitted: false,
      questions: quizService.toStudentFacing(questions),
    })
  );
});

export const updateQuizForLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const lesson = await lessonService.getById(lessonId);
  await classService.assertMembership(lesson.class, req.user);

  const { questions } = req.body;
  const result = await quizService.replaceQuizQuestions(lessonId, questions);

  res.json(
    new ApiResponse(200, {
      quizId: result.quiz._id,
      questions: quizService.toTeacherFacing(result.questions),
    })
  );
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;

  if (req.user.role === "teacher") {
    throw ApiError.forbidden("Teachers can review quizzes but cannot submit them");
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    throw ApiError.badRequest("answers array is required");
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw ApiError.notFound("Quiz not found");
  const lesson = await lessonService.getById(quiz.lesson);
  await classService.assertMembership(lesson.class, req.user);

  const result = await quizService.submit({ quizId, studentId: req.user._id, answers });
  res.status(201).json(new ApiResponse(201, result, "Quiz submitted"));
});

export const listMyResultsForClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  await classService.assertMembership(classId, req.user);

  const results = await quizService.listResultsForStudentInClass(classId, req.user._id);
  res.json(new ApiResponse(200, results));
});
