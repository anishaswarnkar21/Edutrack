import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "../ui/EmptyState.jsx";
import { IconChart } from "../ui/icons.jsx";

function buildMonthlySeries(records) {
  const byMonth = new Map();

  for (const r of records) {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = byMonth.get(key) || { total: 0, present: 0 };
    bucket.total += 1;
    if (r.status === "present" || r.status === "late") bucket.present += 1;
    byMonth.set(key, bucket);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { total, present }]) => {
      const [year, month] = key.split("-");
      const label = new Date(Number(year), Number(month) - 1).toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      });
      return { month: label, percent: total ? Math.round((present / total) * 1000) / 10 : 0 };
    });
}

export function MonthlyAttendanceChart({ records }) {
  const series = buildMonthlySeries(records);

  if (series.length === 0) {
    return (
      <EmptyState
        icon={IconChart}
        title="No attendance history yet"
        description="A monthly trend chart will appear once sessions are recorded."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, "Attendance"]}
          contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb", fontSize: 12 }}
        />
        <Bar dataKey="percent" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
