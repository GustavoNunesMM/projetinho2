import { addToast } from "@heroui/react";
import type { ReactNode } from "react";

interface ToastProps {
  message: string | ReactNode;
  color?: "primary" | "success" | "danger" | "warning" | "default";
  variant?: "flat" | "solid" | "bordered" | undefined;
  timeout?: number;
  customStyle?: string;
}

export function Toast({
  message,
  color = "primary",
  variant = "flat",
  timeout = 2000,
  customStyle = "",
}: ToastProps) {
  addToast({
    title: message,
    variant,
    color,
    timeout,
    classNames: {
      base: [
        "bg-default-50 dark:bg-background shadow-sm",
        "border border-l-8 rounded-md rounded-l-none",
        "flex flex-col items-start",
        "border-primary-200 dark:border-primary-100 border-l-primary",
        `${customStyle}`,
      ],
      icon: "w-6 h-6 fill-current",
    },
  });
}
