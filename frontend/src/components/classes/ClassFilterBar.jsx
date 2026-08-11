import { Link } from "react-router-dom";
import { EmptyState } from "../ui/EmptyState.jsx";
import { IconLayers } from "../ui/icons.jsx";

export function ClassFilterBar({ classes, selectedClassId, onChange }) {
  if (classes.length === 0) {
    return (
      <EmptyState
        icon={IconLayers}
        title="No classes yet"
        description="Create or join a class first."
        action={
          <Link to="/classes" className="text-sm text-brand-600 font-medium hover:underline">
            Go to My Classes
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {classes.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            c.id === selectedClassId
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          {c.className}
        </button>
      ))}
    </div>
  );
}
