import { useState } from "react";
import { Button } from "../ui/Button.jsx";

const STATUSES = ["present", "absent", "late"];

const STATUS_STYLES = {
  present: "peer-checked:bg-green-600 peer-checked:text-white peer-checked:border-green-600",
  absent: "peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-600",
  late: "peer-checked:bg-yellow-500 peer-checked:text-white peer-checked:border-yellow-500",
};

export function AttendanceSessionForm({ roster, onSubmit, saving }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statusByStudentId, setStatusByStudentId] = useState({});

  const setStatus = (studentId, status) =>
    setStatusByStudentId((prev) => ({ ...prev, [studentId]: status }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(date, statusByStudentId);
  };

  if (roster.length === 0) {
    return <p className="text-sm text-gray-500">Students who join this class will appear here.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Session date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          required
        />
      </div>

      <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
        {roster.map((student) => (
          <div key={student._id} className="flex items-center justify-between text-sm px-3 py-2.5">
            <span className="font-medium text-gray-800">{student.name}</span>
            <div className="flex gap-1.5">
              {STATUSES.map((status) => (
                <label key={status} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`status-${student._id}`}
                    className="peer sr-only"
                    checked={statusByStudentId[student._id] === status}
                    onChange={() => setStatus(student._id, status)}
                    required
                  />
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium capitalize border border-gray-200 text-gray-600 transition-colors ${STATUS_STYLES[status]}`}
                  >
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" loading={saving}>
        Save attendance
      </Button>
    </form>
  );
}
