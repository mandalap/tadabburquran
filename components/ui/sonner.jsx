"use client";
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      position="top-right"
      expand={false}
      duration={4000}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl",
          title: "group-[.toast]:font-semibold",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-gold group-[.toast]:text-black group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700",
          success: "group-[.toast]:border-green-200 group-[.toast]:bg-green-50",
          error: "group-[.toast]:border-red-200 group-[.toast]:bg-red-50",
          warning: "group-[.toast]:border-amber-200 group-[.toast]:bg-amber-50",
          info: "group-[.toast]:border-blue-200 group-[.toast]:bg-blue-50",
        },
      }}
      icons={{
        success: <CheckCircle className="w-5 h-5 text-green-600" />,
        error: <XCircle className="w-5 h-5 text-red-600" />,
        warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
        info: <Info className="w-5 h-5 text-blue-600" />,
        loading: <Loader2 className="w-5 h-5 text-gold animate-spin" />,
      }}
      {...props} />
  );
}

export { Toaster }
