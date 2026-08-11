export function Card({ className = "", hoverable = false, children }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-card p-5 ${
        hoverable ? "transition-shadow hover:shadow-card-hover" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}
