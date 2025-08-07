import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700",
        secondary: "bg-slate-50 text-slate-600",
        destructive: "bg-red-100 text-red-800",
        outline: "border border-slate-200 text-slate-600",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        info: "bg-blue-100 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);