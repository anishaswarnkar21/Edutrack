export class Lesson {
  constructor({
    _id,
    class: classId,
    title,
    pdfPath,
    originalFileName,
    createdAt,
    completed,
    quizStatus,
    quizError,
  }) {
    this.id = _id;
    this.classId = classId;
    this.title = title;
    this.pdfPath = pdfPath;
    this.originalFileName = originalFileName;
    this.createdAt = createdAt;
    this.completed = Boolean(completed);
    this.quizStatus = quizStatus || "pending";
    this.quizError = quizError;
  }

  static fromApi(data) {
    return new Lesson(data);
  }
}
