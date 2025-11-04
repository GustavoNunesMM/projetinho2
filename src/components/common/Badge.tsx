import React from "react";
import { Chip } from "@heroui/react";

type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "indigo"
  | "orange"
  | "default";

type ChipColor =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "secondary"
  | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const Badge = ({
  children,
  variant = "default",
  className = "",
}: BadgeProps) => {
  const mapVariantToColor = (v: BadgeVariant): ChipColor => {
    switch (v) {
      case "primary":
        return "primary";
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "danger":
        return "danger";
      case "purple":
        return "secondary";
      case "indigo":
        return "secondary";
      case "orange":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Chip size="sm" color={mapVariantToColor(variant)} className={className}>
      {children}
    </Chip>
  );
};

export default Badge;
