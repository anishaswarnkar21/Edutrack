import { Spinner } from "./Spinner.jsx";

const VARIANTS = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 disabled:bg-brand-300 focus-visible:ring-brand-500",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:text-gray-400 focus-visible:ring-gray-400",
  ghost: "text-gray-600 hover:bg-gray-100 disabled:text-gray-300 focus-visible:ring-gray-400",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:bg-red-300 focus-visible:ring-red-500",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
