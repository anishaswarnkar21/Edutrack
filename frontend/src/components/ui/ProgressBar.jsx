export function ProgressBar({ percent, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };
  const clamped = Math.max(0, Math.min(100, percent ?? 0));

  return (
    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${tones[tone]} transition-all`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
