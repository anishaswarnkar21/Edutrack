import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout.jsx";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { ClassFilterBar } from "../components/classes/ClassFilterBar.jsx";
import { LessonList } from "../components/lessons/LessonList.jsx";
import { LessonUploadForm } from "../components/lessons/LessonUploadForm.jsx";
import { LessonEditForm } from "../components/lessons/LessonEditForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useClassFilter } from "../viewmodels/useClassFilter.js";
import { useLessonsViewModel } from "../viewmodels/useLessonsViewModel.js";

export function LessonsView() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { classes, loading: classesLoading, selectedClassId, setSelectedClassId } = useClassFilter(
    searchParams.get("classId")
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Lessons"
        description={
          user?.isTeacher
            ? "Upload lesson PDFs - a quiz is generated automatically once uploaded."
            : "Read a lesson, mark it complete, then take its quiz."
        }
      />

      {classesLoading && <Spinner label="Loading classes..." />}
      {!classesLoading && (
        <>
          <ClassFilterBar classes={classes} selectedClassId={selectedClassId} onChange={setSelectedClassId} />
          {selectedClassId && <LessonsForClass classId={selectedClassId} isTeacher={user?.isTeacher} />}
        </>
      )}
    </DashboardLayout>
  );
}

function LessonsForClass({ classId, isTeacher }) {
  const {
    lessons,
    loading,
    error,
    uploading,
    uploadLesson,
    updateLesson,
    deleteLesson,
    regenerateQuiz,
  } = useLessonsViewModel(classId);
  const [editingLesson, setEditingLesson] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (changes) => {
    setSaving(true);
    try {
      await updateLesson(editingLesson.id, changes);
      setEditingLesson(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lesson) => {
    if (!window.confirm(`Delete "${lesson.title}"? This also removes its quiz and results.`)) return;
    await deleteLesson(lesson.id);
  };

  return (
    <div className="space-y-6">
      {isTeacher && (
        <Card>
          <CardHeader title="Upload a lesson" />
          <LessonUploadForm onUpload={uploadLesson} uploading={uploading} />
        </Card>
      )}

      <Card>
        <CardHeader title="Lessons" />
        {loading && <Spinner label="Loading..." />}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && editingLesson && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <LessonEditForm
              lesson={editingLesson}
              onSave={handleSave}
              onCancel={() => setEditingLesson(null)}
              saving={saving}
            />
          </div>
        )}

        {!loading && (
          <LessonList
            lessons={lessons}
            isTeacher={isTeacher}
            onEdit={setEditingLesson}
            onDelete={handleDelete}
            onRegenerate={regenerateQuiz}
          />
        )}
      </Card>
    </div>
  );
}
