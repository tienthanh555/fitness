import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calorieWeek, weightData } from "@/mocks/data";

const tooltipStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  boxShadow: "0 12px 30px rgba(0,0,0,.08)",
  fontSize: 12,
};
export interface CaloriesChartPoint {
  day: string;
  consumed: number;
  target: number;
}
export interface WeightChartPoint {
  date: string;
  weight: number;
}
export function CaloriesChart({ data = calorieWeek }: { data?: CaloriesChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 12 }}>
        <defs>
          <linearGradient id="cal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#28a36f" stopOpacity={0.35} />
            <stop offset="1" stopColor="#28a36f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#edf2ef"
        />
        <XAxis dataKey="day" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          dataKey="target"
          stroke="#9aa7a0"
          strokeDasharray="5 5"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="consumed"
          stroke="#198257"
          fill="url(#cal)"
          strokeWidth={2.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
export function WeightChart({ detailed = false, data = weightData }: { detailed?: boolean; data?: WeightChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={detailed ? 310 : 110}>
      <LineChart
        data={data}
        margin={{ left: detailed ? -18 : 4, right: 12, top: 10, bottom: 0 }}
      >
        {detailed && (
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#edf2ef"
          />
        )}
        {detailed && <XAxis dataKey="date" axisLine={false} tickLine={false} />}{" "}
        {detailed && (
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            axisLine={false}
            tickLine={false}
          />
        )}
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#198257"
          strokeWidth={3}
          dot={detailed ? { r: 4, fill: "#fff", strokeWidth: 2 } : false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
export function BodyChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={weightData} margin={{ left: -22, right: 10, top: 12 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#edf2ef"
        />
        <XAxis dataKey="date" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="waist"
          stroke="#8b5cf6"
          strokeWidth={2.5}
        />
        <Line
          type="monotone"
          dataKey="chest"
          stroke="#0ea5e9"
          strokeWidth={2.5}
        />
        <Line
          type="monotone"
          dataKey="hip"
          stroke="#f59e0b"
          strokeWidth={2.5}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
export function WorkoutFrequencyChart() {
  const data = [
    { week: "W1", sessions: 2 },
    { week: "W2", sessions: 3 },
    { week: "W3", sessions: 2 },
    { week: "W4", sessions: 4 },
    { week: "W5", sessions: 3 },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -30, right: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="week" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar
          dataKey="sessions"
          fill="#28a36f"
          radius={[8, 8, 2, 2]}
          barSize={34}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
