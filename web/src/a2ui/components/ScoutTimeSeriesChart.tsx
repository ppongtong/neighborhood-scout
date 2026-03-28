import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../a2ui.css";

interface SeriesDefinition {
  dataKey: string;
  label: string;
  color: string;
  axis?: "left" | "right";
}

interface ScoutTimeSeriesChartProps {
  title?: string;
  xAxisKey: string;
  series: SeriesDefinition[];
  data: Record<string, any>[];
}

const AXIS_STYLE = {
  tick: { fill: "#64748b", fontSize: 11 },
  axisLine: false as const,
  tickLine: false,
};

export const ScoutTimeSeriesChart: React.FC<ScoutTimeSeriesChartProps> = ({
  title,
  xAxisKey,
  series,
  data,
}) => {
  const hasDualAxis = series.some((s) => s.axis === "right");

  return (
    <div style={{ width: "100%" }}>
      {title && <p className="a2ui-text-h2" style={{ marginBottom: "1rem" }}>{title}</p>}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 4, right: hasDualAxis ? 48 : 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            {...AXIS_STYLE}
            width={48}
          />
          {hasDualAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              {...AXIS_STYLE}
              width={36}
              domain={[0, 10]}
            />
          )}
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#e2e8f0",
              fontSize: 13,
            }}
            labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
            cursor={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 12 }}
            formatter={(value) =>
              series.find((s) => s.dataKey === value)?.label ?? value
            }
          />
          {series.map((s) => (
            <Line
              key={s.dataKey}
              yAxisId={s.axis ?? "left"}
              type="monotone"
              dataKey={s.dataKey}
              name={s.dataKey}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: s.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
