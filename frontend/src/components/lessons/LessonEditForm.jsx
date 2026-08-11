import { useState } from "react";
import { Button } from "../ui/Button.jsx";

export function LessonEditForm({ lesson, onSave, onCancel, saving }) {
  const [title, setTitle] = useState(lesson.title);
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({ title: title !== lesson.title ? title : undefined, file: file || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
      <div className="flex-1 w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Replace PDF (optional)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:text-sm file:font-medium hover:file:bg-brand-100"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" loading={saving}>
          Save
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
