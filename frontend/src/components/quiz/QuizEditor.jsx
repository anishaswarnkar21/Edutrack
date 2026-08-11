import { Button } from "../ui/Button.jsx";
import { IconTrash, IconPlus } from "../ui/icons.jsx";

const OPTION_LETTERS = ["A", "B", "C", "D"];

export function QuizEditor({
  questions,
  updateQuestion,
  updateOption,
  addQuestion,
  removeQuestion,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Editing this quiz replaces its questions for every student. Mark the
        correct option for each question with the radio button.
      </div>

      {questions.map((q, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <label className="flex-1 text-sm font-medium text-gray-700">
              Question {idx + 1}
              <textarea
                value={q.questionText}
                onChange={(e) => updateQuestion(idx, { questionText: e.target.value })}
                rows={2}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </label>
            <button
              type="button"
              title="Remove question"
              onClick={() => removeQuestion(idx)}
              className="p-1.5 mt-6 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((option, optionIdx) => (
              <label
                key={optionIdx}
                className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg border ${
                  q.correctAnswerIndex === optionIdx
                    ? "bg-green-50 border-green-400"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name={`correct-${idx}`}
                  checked={q.correctAnswerIndex === optionIdx}
                  onChange={() => updateQuestion(idx, { correctAnswerIndex: optionIdx })}
                  className="shrink-0 accent-green-600"
                  title="Mark as correct answer"
                />
                <span className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold bg-gray-100 text-gray-500">
                  {OPTION_LETTERS[optionIdx]}
                </span>
                <input
                  value={option}
                  onChange={(e) => updateOption(idx, optionIdx, e.target.value)}
                  className="flex-1 min-w-0 border-none bg-transparent text-sm focus:outline-none"
                  required
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        <IconPlus className="h-4 w-4" /> Add question
      </button>

      <div className="flex gap-2">
        <Button onClick={onSave} loading={saving} disabled={questions.length === 0}>
          Save quiz
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
