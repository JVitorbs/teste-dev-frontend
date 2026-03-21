import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--tw-brand)] text-white",
        secondary: "border-[var(--tw-border)] bg-[var(--tw-surface-soft)] text-[var(--tw-text)]",
        destructive: "border-transparent bg-red-500 text-white",
        outline: "border-[var(--tw-border)] text-[var(--tw-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
