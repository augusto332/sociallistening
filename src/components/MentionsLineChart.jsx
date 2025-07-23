import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import ChartTooltip from "./ChartTooltip";

export default function MentionsLineChart({ data = [] }) {
  if (!data.length) {
    return <p className="text-muted-foreground text-sm">Sin datos</p>;
  }

  const months = Array.from(new Set(data.map((d) => d.date.slice(0, 7))));
  const shortRange = months.length <= 2;

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTick = (d) => {
    const date = new Date(d);
    return shortRange
      ? date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
      : date.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
  };

  const monthTicks = months.map((m) => `${m}-01`);

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            tickFormatter={formatTick}
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            {...(!shortRange && { ticks: monthTicks })}
          />
          <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} labelFormatter={formatDate} />
          <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
