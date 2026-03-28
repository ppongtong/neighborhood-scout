import React from "react";
import "../a2ui.css";

interface ScoutChipProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "default";
}

export const ScoutChip: React.FC<ScoutChipProps> = ({
  label,
  variant = "default",
}) => (
  <span className={`a2ui-chip a2ui-chip-${variant}`}>{label}</span>
);
