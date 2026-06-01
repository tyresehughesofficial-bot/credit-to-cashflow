"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SeriesPoint } from "@/lib/data/metrics";

const AXIS = { stroke: "#786e58", fontSize: 11 };
const GRID = "#302c22";

const tooltipStyle = {
  backgroundColor: "#1e1b14",
  border: "1px solid #3e3928",
  borderRadius: 8,
  fontSize: 12,
  color: "#f2ede0",
};

export function RevenueAreaChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gRecurring" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gFunding" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E6C65A" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#E6C65A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="recurring" name="Recurring" stroke="#D4AF37" fill="url(#gRecurring)" strokeWidth={2} />
        <Area type="monotone" dataKey="funding" name="Funding" stroke="#E6C65A" fill="url(#gFunding)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LeadsBarChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(212,175,55,0.06)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="leads" name="Leads" fill="#54410E" radius={[4, 4, 0, 0]} />
        <Bar dataKey="consults" name="Consults" fill="#A07D1F" radius={[4, 4, 0, 0]} />
        <Bar dataKey="clients" name="New Clients" fill="#D4AF37" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EngagementLineChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="engagement" name="Engagement %" stroke="#D4AF37" strokeWidth={2} dot={{ r: 3, fill: "#D4AF37" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  height = 260,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
