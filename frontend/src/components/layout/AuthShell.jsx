import { IconBook, IconCheckCircle, IconChart, IconClipboard } from "../ui/icons.jsx";
import config from "../../config/config.js";

const FEATURES = [
  { icon: IconClipboard, text: "Automatic attendance tracking with live percentages" },
  { icon: IconBook, text: "Upload lesson PDFs and track completion" },
  { icon: IconCheckCircle, text: "AI-generated quizzes from lesson content" },
  { icon: IconChart, text: "Performance analytics for every student" },
];

export function AuthShell({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-600 to-brand-800 text-white p-12">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center">
            <IconBook className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">{config.appName}</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Classroom management, minus the busywork.
          </h1>
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-brand-50">
                <span className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-brand-200">
          Attendance · Lessons · AI Quizzes · Analytics
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">{children}</div>
    </div>
  );
}
