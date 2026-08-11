export function Spinner({ className = "h-5 w-5", label }) {
  return (
    <span className="inline-flex items-center gap-2 text-gray-500">
      <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
        />
      </svg>
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}
