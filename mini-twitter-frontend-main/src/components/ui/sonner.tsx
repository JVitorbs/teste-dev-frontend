import type { ComponentProps } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Toaster as Sonner } from "sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-[var(--tw-border)] group-[.toaster]:bg-[var(--tw-surface)] group-[.toaster]:text-[var(--tw-text)]",
          description: "group-[.toast]:text-[var(--tw-muted)]",
          actionButton: "group-[.toast]:bg-[var(--tw-brand)] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[var(--tw-surface-soft)] group-[.toast]:text-[var(--tw-text)]",
        },
      }}
      {...props}
    />
  );
}
