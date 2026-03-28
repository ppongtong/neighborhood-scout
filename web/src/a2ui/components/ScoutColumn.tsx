import React from "react";
import "../a2ui.css";

interface ScoutColumnProps {
  children?: React.ReactNode;
}

export const ScoutColumn: React.FC<ScoutColumnProps> = ({ children }) => (
  <div className="a2ui-column">{children}</div>
);
