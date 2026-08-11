import { useParams } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { IconAlertCircle } from "../../components/ui/icons.jsx";
import { useQuizViewModel } from "../../viewmodels/useQuizViewModel.js";
import { QuizPlayer } from "../../components/quiz/QuizPlayer.jsx";
import { QuizEditor } from "../../components/quiz/QuizEditor.jsx";

const STATUS_MESSAGE = {
  pending:
    "Your quiz hasn't started generating yet - this should only take a moment.",
  generating:
    "Generating your quiz from the lesson content, this can take a few seconds...",
  failed: "Quiz generation failed. Retrying automatically...",
};

export function QuizPageView() {
  const { lessonId } = useParams();
  const {
    quiz,
    loading,
    error,
    submitting,
    answers,
    selectAnswer,
    submit,
    allAnswered,
    canAttempt,
    isTeacher,
    editing,
    draftQuestions,
    saving,
    startEditing,
    cancelEditing,
    updateDraftQuestion,
    updateDraftOption,
    addDraftQuestion,
    removeDraftQuestion,
    saveEdits,
  } = useQuizViewModel(lessonId);

  return (
    <DashboardLayout>
      <PageHeader
        title="Lesson quiz"
        description="Answer every question, then submit for your score."
      />

      <Card className="max-w-2xl mx-auto">
        {loading && (
          <div className="py-8 text-center">
            <Spinner className="h-6 w-6 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        {!loading && quiz && !quiz.ready && (
          <div className="py-8 text-center">
            <Spinner className="h-6 w-6 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {STATUS_MESSAGE[quiz.status] || STATUS_MESSAGE.generating}
            </p>
          </div>
        )}
        {!loading && quiz?.ready && editing && (
          <QuizEditor
            questions={draftQuestions}
            updateQuestion={updateDraftQuestion}
            updateOption={updateDraftOption}
            addQuestion={addDraftQuestion}
            removeQuestion={removeDraftQuestion}
            onSave={saveEdits}
            onCancel={cancelEditing}
            saving={saving}
          />
        )}
        {!loading && quiz?.ready && !editing && (
          <QuizPlayer
            quiz={quiz}
            answers={answers}
            selectAnswer={selectAnswer}
            onSubmit={submit}
            submitting={submitting}
            allAnswered={allAnswered}
            canAttempt={canAttempt}
            isTeacher={isTeacher}
            onStartEditing={startEditing}
          />
        )}
      </Card>
    </DashboardLayout>
  );
}
