import { Spinner } from "../ui/Spinner.jsx";
import { IconCheckCircle, IconAlertCircle } from "../ui/icons.jsx";

const CONFIG = {
  ready: { label: "Quiz ready", className: "bg-green-50 text-green-700 ring-green-200", icon: IconCheckCircle },
  generating: { label: "Generating quiz...", className: "bg-brand-50 text-brand-700 ring-brand-200" },
  pending: { label: "Queued", className: "bg-gray-100 text-gray-600 ring-gray-200" },
  failed: { label: "Generation failed", className: "bg-red-50 text-red-700 ring-red-200", icon: IconAlertCircle },
};

export function QuizStatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${cfg.className}`}
    >
      {status === "generating" && <Spinner className="h-3 w-3" />}
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {cfg.label}
    </span>
  );
}
