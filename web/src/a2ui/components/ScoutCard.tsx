import React from "react";
import "../a2ui.css";

interface ScoutCardProps {
  children?: React.ReactNode;
}

export const ScoutCard: React.FC<ScoutCardProps> = ({ children }) => (
  <div className="a2ui-card">{children}</div>
);
