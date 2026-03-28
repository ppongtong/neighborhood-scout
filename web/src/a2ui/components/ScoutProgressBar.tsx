import React from "react";
import "../a2ui.css";

interface ScoutProgressBarProps {
  value: number;
  max?: number;
}

export const ScoutProgressBar: React.FC<ScoutProgressBarProps> = ({
  value,
  max = 100,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const color =
    percentage >= 75 ? "#22c55e" : percentage >= 50 ? "#eab308" : "#ef4444";

  return (
    <div className="a2ui-progress-bar">
      <div
        className="a2ui-progress-fill"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
};
