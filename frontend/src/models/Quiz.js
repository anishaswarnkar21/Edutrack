export class QuizQuestion {
  constructor({ id, questionText, options, correctAnswerIndex, selectedIndex, isCorrect }) {
    this.id = id;
    this.questionText = questionText;
    this.options = options;
    // Only present for teachers (review/edit) or students viewing a submitted
    // quiz's per-question breakdown - undefined for a student mid-attempt.
    this.correctAnswerIndex = correctAnswerIndex;
    this.selectedIndex = selectedIndex;
    this.isCorrect = isCorrect;
  }
}

export class Quiz {
  constructor({ ready, status, quizId, submitted, questions = [], result = null }) {
    this.ready = ready;
    this.status = status; // 'pending' | 'generating' | 'failed' when not ready
    this.quizId = quizId;
    this.submitted = submitted;
    this.questions = questions.map((q) => new QuizQuestion(q));
    this.result = result;
  }

  static fromApi(data) {
    return new Quiz(data);
  }
}
