import React from "react";
import "../a2ui.css";

interface ScoutRowProps {
  children?: React.ReactNode;
}

export const ScoutRow: React.FC<ScoutRowProps> = ({ children }) => (
  <div className="a2ui-row">{children}</div>
);
