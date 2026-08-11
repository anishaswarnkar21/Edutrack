import { useState } from "react";
import { Button } from "../ui/Button.jsx";
import { IconPlus } from "../ui/icons.jsx";

export function LessonUploadForm({ onUpload, uploading }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    await onUpload(title, file);
    setTitle("");
    setFile(null);
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
      <div className="flex-1 w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="e.g. Chapter 3 - Photosynthesis"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">PDF file</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:text-sm file:font-medium hover:file:bg-brand-100"
          required
        />
      </div>
      <Button type="submit" loading={uploading}>
        <IconPlus className="h-4 w-4" />
        Upload lesson
      </Button>
    </form>
  );
}
