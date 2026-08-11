import { Link } from "react-router-dom";
import { IconArrowRight, IconUsers } from "../ui/icons.jsx";

const ACCENTS = [
  "from-brand-500 to-brand-700",
  "from-emerald-500 to-emerald-700",
  "from-amber-500 to-amber-600",
  "from-sky-500 to-sky-700",
  "from-rose-500 to-rose-600",
  "from-violet-500 to-violet-700",
];

function accentFor(id) {
  const sum = String(id)
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return ACCENTS[sum % ACCENTS.length];
}

export function ClassCard({ classRoom, showJoinCode = false }) {
  return (
    <Link to={`/classes/${classRoom.id}`} className="group block">
      <div className="rounded-xl border border-gray-200 bg-white shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
        <div className={`h-16 bg-gradient-to-r ${accentFor(classRoom.id)}`} />
        <div className="p-4">
          <p className="font-semibold text-gray-900 truncate">{classRoom.className}</p>
          {showJoinCode ? (
            <p className="text-xs text-gray-500 mt-1">
              Join code: <span className="font-mono text-gray-700">{classRoom.joinCode}</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <IconUsers className="h-3.5 w-3.5" /> Enrolled
            </p>
          )}
          <div className="flex items-center gap-1 text-xs font-medium text-brand-600 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            Open class <IconArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
