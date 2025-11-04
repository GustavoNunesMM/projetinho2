import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { ToastProvider } from "@heroui/toast";

export function Provider({ children }: { children: any }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider />
      {children}
    </HeroUIProvider>
  );
}
