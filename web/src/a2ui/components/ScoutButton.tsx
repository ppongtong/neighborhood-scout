import React from "react";
import "../a2ui.css";

interface ScoutButtonAction {
  event?: { name: string; context?: Record<string, any> };
}

interface ScoutButtonProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
  action?: ScoutButtonAction;
  onAction?: (action: { name: string; context: any }) => void;
}

export const ScoutButton: React.FC<ScoutButtonProps> = ({
  children,
  variant = "primary",
  action,
  onAction,
}) => {
  const handleClick = () => {
    if (action?.event && onAction) {
      onAction({ name: action.event.name, context: action.event.context ?? {} });
    }
  };

  return (
    <button
      className={`a2ui-button a2ui-button-${variant}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
