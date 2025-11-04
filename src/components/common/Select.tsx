// Select.tsx
import React from "react";
import { Select as HSelect, SelectItem, Selection } from "@heroui/react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  className = "",
}: SelectProps) => {
  const selectedKeys = value ? new Set([String(value)]) : new Set<string>();

  const handleSelectionChange = (keys: Selection) => {
    const keysArray = Array.from(keys);
    const first = (keysArray[0] as string) ?? "";
    if (onChange) {
      onChange({ target: { value: first } });
    }
  };

  return (
    <HSelect
      label={label}
      placeholder={placeholder}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      className={className}
    >
      {options?.map((option) => (
        <SelectItem key={option.value}>{option.label}</SelectItem>
      ))}
    </HSelect>
  );
};

export default Select;
