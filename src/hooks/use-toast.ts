
import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

const TOAST_DURATION = 1000; // 1 second default

type ToastProps = ExternalToast & {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

const toast = ({
  title,
  description,
  variant = "default",
  duration = TOAST_DURATION,
  ...props
}: ToastProps) => {
  sonnerToast(title || "", {
    description,
    duration,
    className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : "",
    ...props,
  });
};

const useToast = () => {
  return {
    toast,
  };
};

export { useToast, toast };
