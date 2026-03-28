import React from "react";
import "../a2ui.css";

interface ScoutTextProps {
  text: string;
  variant?: "h1" | "h2" | "body";
}

export const ScoutText: React.FC<ScoutTextProps> = ({
  text,
  variant = "body",
}) => {
  if (variant === "h1") return <p className="a2ui-text-h1">{text}</p>;
  if (variant === "h2") return <p className="a2ui-text-h2">{text}</p>;
  return <p className="a2ui-text-body">{text}</p>;
};
