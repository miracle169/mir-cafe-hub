
import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

type ToastProps = ExternalToast & {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

const TOAST_DURATION = 3000; // 3 seconds default

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
