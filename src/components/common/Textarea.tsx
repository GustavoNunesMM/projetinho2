import React from "react";
import { Textarea as HTextarea } from "@heroui/react";

interface TextareaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

const Textarea = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  required = false,
  className = "",
}: TextareaProps) => {
  return (
    <HTextarea
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      minRows={rows}
      isRequired={required}
      className={className}
    />
  );
};

export default Textarea;
