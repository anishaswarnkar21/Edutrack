import { Button } from "../ui/Button.jsx";
import { ProgressBar } from "../ui/ProgressBar.jsx";
import { IconCheckCircle } from "../ui/icons.jsx";

const OPTION_LETTERS = ["A", "B", "C", "D"];

export function QuizPlayer({
  quiz,
  answers,
  selectAnswer,
  onSubmit,
  submitting,
  allAnswered,
  canAttempt,
  isTeacher,
  onStartEditing,
}) {
  if (quiz.submitted) {
    const { result, questions } = quiz;
    const percent = Math.round((result.score / result.totalQuestions) * 100);
    return (
      <div className="py-2">
        <div className="text-center py-4">
          <div className="h-14 w-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
            <IconCheckCircle className="h-7 w-7" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            Quiz already submitted
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Score:{" "}
            <span className="font-semibold text-gray-900">{result.score}</span> /{" "}
            {result.totalQuestions} ({percent}%)
          </p>
        </div>

        {questions?.length > 0 && (
          <div className="mt-6 space-y-6 border-t border-gray-100 pt-6">
            <p className="text-sm font-medium text-gray-700">Question review</p>
            {questions.map((q, idx) => (
              <div key={q.id}>
                <p className="font-medium text-gray-900 mb-3 flex items-start gap-2">
                  <span className="text-gray-400">{idx + 1}.</span>
                  <span className="flex-1">{q.questionText}</span>
                  {q.isCorrect ? (
                    <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                      Correct
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full shrink-0">
                      Incorrect
                    </span>
                  )}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((option, optionIdx) => {
                    const isCorrectOption = optionIdx === q.correctAnswerIndex;
                    const isStudentPick = optionIdx === q.selectedIndex;
                    let tone = "border-gray-200 text-gray-700";
                    if (isCorrectOption) {
                      tone = "bg-green-50 border-green-400 text-green-800";
                    } else if (isStudentPick) {
                      tone = "bg-red-50 border-red-400 text-red-800";
                    }
                    return (
                      <div
                        key={optionIdx}
                        className={`flex items-center gap-2.5 text-left text-sm px-3 py-2.5 rounded-lg border ${tone}`}
                      >
                        <span
                          className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                            isCorrectOption
                              ? "bg-green-600 text-white"
                              : isStudentPick
                              ? "bg-red-600 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {OPTION_LETTERS[optionIdx]}
                        </span>
                        {option}
                        {isStudentPick && !isCorrectOption && (
                          <span className="ml-auto text-xs text-red-600 shrink-0">Your answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-8">
      {!canAttempt && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 flex items-center justify-between gap-3">
          <span>
            Review mode: you can inspect the generated quiz here, but students are
            the ones who submit answers.
          </span>
          {isTeacher && onStartEditing && (
            <button
              type="button"
              onClick={onStartEditing}
              className="shrink-0 text-sm font-medium text-brand-700 hover:text-brand-900 underline"
            >
              Edit quiz
            </button>
          )}
        </div>
      )}
      {canAttempt && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>
              {answeredCount} of {quiz.questions.length} answered
            </span>
            <span>
              {Math.round((answeredCount / quiz.questions.length) * 100)}%
            </span>
          </div>
          <ProgressBar
            percent={(answeredCount / quiz.questions.length) * 100}
            tone="brand"
          />
        </div>
      )}

      {quiz.questions.map((q, idx) => (
        <div key={q.id}>
          <p className="font-medium text-gray-900 mb-3">
            <span className="text-gray-400 mr-1.5">{idx + 1}.</span>
            {q.questionText}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((option, optionIdx) => {
              const selected = answers[q.id] === optionIdx;
              if (!canAttempt) {
                const isCorrectOption = optionIdx === q.correctAnswerIndex;
                return (
                  <div
                    key={optionIdx}
                    className={`flex items-center gap-2.5 text-left text-sm px-3 py-2.5 rounded-lg border ${
                      isCorrectOption
                        ? "bg-green-50 border-green-400 text-green-800"
                        : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <span
                      className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                        isCorrectOption
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {OPTION_LETTERS[optionIdx]}
                    </span>
                    {option}
                    {isCorrectOption && (
                      <span className="ml-auto text-xs text-green-600 shrink-0">Correct</span>
                    )}
                  </div>
                );
              }

              return (
                <button
                  type="button"
                  key={optionIdx}
                  onClick={() => selectAnswer(q.id, optionIdx)}
                  className={`flex items-center gap-2.5 text-left text-sm px-3 py-2.5 rounded-lg border transition-colors ${
                    selected
                      ? "bg-brand-50 border-brand-400 text-brand-800"
                      : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                      selected
                        ? "bg-brand-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {OPTION_LETTERS[optionIdx]}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {canAttempt && (
        <Button
          onClick={onSubmit}
          disabled={!allAnswered}
          loading={submitting}
          className="w-full sm:w-auto"
        >
          Submit quiz
        </Button>
      )}
    </div>
  );
}
