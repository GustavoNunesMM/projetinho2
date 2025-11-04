import React from "react";
import { Input as HInput } from "@heroui/react";

interface InputProps {
  label?: string | null;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  step?: string;
}

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  step,
}: InputProps) => {
  return (
    <HInput
      type={type}
      label={label || undefined}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={disabled}
      isRequired={required}
      className={className}
      step={step}
    />
  );
};

export default Input;
