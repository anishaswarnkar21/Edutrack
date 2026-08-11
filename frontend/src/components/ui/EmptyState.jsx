import { IconInbox } from "./icons.jsx";

export function EmptyState({ icon: Icon = IconInbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
