const COLORS = {
  present: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  late: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200",
  absent: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200",
  default: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200",
};

export function Badge({ status = "default", children }) {
  const color = COLORS[status] || COLORS.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
      {children}
    </span>
  );
}
