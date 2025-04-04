
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { Toaster as ToastPrimitive } from "sonner"

export function Toaster() {
  return (
    <>
      <ToastPrimitive position="top-right" />
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    </>
  )
}
