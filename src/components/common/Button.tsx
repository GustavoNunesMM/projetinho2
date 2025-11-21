import { Button as HButton } from "@heroui/react";

type variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "outline"
  | "default"
  | "light"
  | "light-success"
  | "light-danger";

type colorVariant = "primary" | "secondary" | "success" | "danger" | "default";
type Hvariant = "solid" | "bordered" | "light";
type typeProps = "button" | "submit" | "reset";

interface props {
  children: any;
  onClick: () => void;
  variant?: variant;
  disabled?: boolean;
  icon?: any;
  className?: string;
  isIconOnly?: boolean;
  type?: typeProps;
  isLoading?: boolean;
}

const Button = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  icon: Icon,
  className = "",
  isIconOnly = false,
  type = "button",
  isLoading = false,
}: props) => {
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
    <HButton
      type={type}
      onPress={onClick}
      isDisabled={disabled}
      color={color}
      variant={hVariant}
      className={className}
      isIconOnly={isIconOnly}
      startContent={Icon ? <Icon size={20} /> : undefined}
      isLoading={isLoading}
    >
      {children}
    </HButton>
  );
};

export default Button;
