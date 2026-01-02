import {
  Dropdown as HDropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { ReactNode } from "react";

type variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "outline"
  | "default"
  | "light"
  | "light-success"
  | "light-danger"
  | "custom";

type colorVariant = "primary" | "secondary" | "success" | "danger" | "default";
type Hvariant = "solid" | "bordered" | "light";

export interface DropdownItemType {
  key: string;
  title: string;
  icon?: any;
  description?: string;
  shortcut?: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  startContent?: ReactNode;
  endContent?: ReactNode;
  isDisabled?: boolean;
  isDanger?: boolean;
  iconClass?: string;
}

interface DropdownProps {
  items: DropdownItemType[];
  onAction: (key: any) => void;
  triggerLabel?: string;
  triggerIcon?: any;
  variant?: variant;
  disabled?: boolean;
  className?: string;
  placement?:
    | "top"
    | "bottom"
    | "right"
    | "left"
    | "top-start"
    | "top-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end"
    | "right-start"
    | "right-end";
  closeOnSelect?: boolean;
  disabledKeys?: string[];
  selectedKeys?: string[];
  selectionMode?: "none" | "single" | "multiple";
}

const Dropdown = ({
  items,
  onAction,
  triggerLabel = "Opções",
  triggerIcon: TriggerIcon,
  variant = "primary",
  disabled = false,
  className = "",
  placement = "bottom-start",
  closeOnSelect = true,
  disabledKeys = [],
  selectedKeys = [],
  selectionMode = "none",
}: DropdownProps) => {
  const mapVariantToProps = (
    v: variant
  ): { color: colorVariant; variant: Hvariant } => {
    switch (v) {
      case "primary":
        return { color: "primary", variant: "solid" };
      case "secondary":
        return { color: "secondary", variant: "solid" };
      case "success":
        return { color: "success", variant: "solid" };
      case "danger":
        return { color: "danger", variant: "solid" };
      case "outline":
        return { color: "default", variant: "bordered" };
      case "light":
        return { color: "primary", variant: "light" };
      case "light-success":
        return { color: "success", variant: "light" };
      case "light-danger":
        return { color: "danger", variant: "light" };
      default:
        return { color: "default", variant: "solid" };
    }
  };

  const { color, variant: hVariant } = mapVariantToProps(variant);

  return (
    <HDropdown placement={placement} closeOnSelect={closeOnSelect}>
      <DropdownTrigger>
        <Button
          className={className}
          color={color}
          variant={hVariant}
          isDisabled={disabled}
          startContent={TriggerIcon ? <TriggerIcon size={20} /> : undefined}
        >
          {triggerLabel}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Dropdown menu"
        onAction={onAction}
        disabledKeys={disabledKeys}
        selectedKeys={selectedKeys}
        selectionMode={selectionMode}
      >
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <DropdownItem
              key={item.key}
              description={item.description}
              shortcut={item.shortcut}
              color={item.color}
              startContent={
                item.startContent ||
                (ItemIcon ? (
                  <ItemIcon size={18} className={item.iconClass || ""} />
                ) : undefined)
              }
              endContent={item.endContent}
              isDisabled={item.isDisabled}
              className={item.isDanger ? "text-danger" : ""}
            >
              {item.title}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </HDropdown>
  );
};

export default Dropdown;
