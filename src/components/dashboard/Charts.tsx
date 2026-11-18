import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ActivityPoint, AttendancePoint } from "@/types/office";

const attendanceConfig = {
  present: { label: "On site", color: "#22d3ee" },
  remote: { label: "Remote", color: "#6366f1" },
} satisfies ChartConfig;

const activityConfig = {
  focusHours: { label: "Focus hours", color: "#38bdf8" },
  meetings: { label: "Meeting hours", color: "#a78bfa" },
} satisfies ChartConfig;

export function AttendanceChart({ data }: { data: AttendancePoint[] }) {
  return (
    <ChartContainer
      config={attendanceConfig}
      className="aspect-auto h-[236px] w-full"
    >
      <AreaChart data={data} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="attendance-present" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.42} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="attendance-remote" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "#8291a6" }}
          dy={6}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "#8291a6" }}
          width={38}
        />
        <ChartTooltip
          cursor={{ stroke: "rgba(34,211,238,0.35)", strokeWidth: 1 }}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          type="monotone"
          dataKey="present"
          stroke="#22d3ee"
          strokeWidth={2}
          fill="url(#attendance-present)"
          activeDot={{ r: 3.5, fill: "#22d3ee", stroke: "#03121f", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="remote"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#attendance-remote)"
          activeDot={{ r: 3.5, fill: "#6366f1", stroke: "#03121f", strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function WeeklyActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <ChartContainer config={activityConfig} className="aspect-auto h-[210px] w-full">
      <BarChart data={data} margin={{ left: -24, right: 4, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "#8291a6" }}
          dy={6}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "#8291a6" }}
          width={38}
        />
        <ChartTooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="focusHours" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={12} />
        <Bar dataKey="meetings" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={12} />
      </BarChart>
    </ChartContainer>
  );
}
