import { Badge } from "../ui/Badge.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { IconClipboard } from "../ui/icons.jsx";

export function AttendanceTable({ records }) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={IconClipboard}
        title="No attendance recorded yet"
        description="Sessions you record will show up here."
      />
    );
  }

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="py-2 font-medium">Date</th>
            <th className="py-2 font-medium">Student</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
              <td className="py-2.5 text-gray-700">{new Date(r.date).toLocaleDateString()}</td>
              <td className="py-2.5 text-gray-700">{r.student?.name || r.student}</td>
              <td className="py-2.5">
                <Badge status={r.status}>{r.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
