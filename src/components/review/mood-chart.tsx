"use client";

import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DiaryEntry } from "@/types/diary";

type MoodChartProps = {
  entries: DiaryEntry[];
};

export function MoodChart({ entries }: MoodChartProps) {
  const data = entries.map((entry) => ({
    date: format(parseISO(entry.date), "M/d", { locale: ja }),
    mood: entry.mood,
    body: entry.body,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="rgba(141, 109, 77, 0.12)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#876d5a", fontSize: 12 }}
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#876d5a", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 18,
            border: "1px solid #edd8b6",
            backgroundColor: "rgba(255, 252, 246, 0.96)",
            color: "#4b382d",
          }}
        />
        <Line
          type="monotone"
          dataKey="mood"
          stroke="#d69242"
          strokeWidth={3}
          dot={{ fill: "#f3c878", r: 4 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
