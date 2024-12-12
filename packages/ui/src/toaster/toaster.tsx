"use client";

import { useToast } from "./use-toast.js";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast.js";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const isUploadSuccess = title
          ?.toLowerCase()
          .includes("uploaded successfully");

        return (
          <Toast
            key={id}
            {...props}
            className={`${props.className} ${
              isUploadSuccess
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {isUploadSuccess && (
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
              )}
              <div className="grid gap-1 flex-1">
                {title && (
                  <ToastTitle
                    className={
                      isUploadSuccess ? "text-green-700" : "text-red-700"
                    }
                  >
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription
                    className={
                      isUploadSuccess ? "text-green-600" : "text-red-600"
                    }
                  >
                    {description}
                  </ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
