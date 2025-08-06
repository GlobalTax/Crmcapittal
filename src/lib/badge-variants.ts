import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 text-gray-700",
        secondary:
          "bg-gray-50 text-gray-600",
        destructive:
          "bg-red-50 text-red-700",
        outline: "border border-gray-200 text-gray-600",
        success: "bg-green-50 text-green-700",
        warning: "bg-yellow-50 text-yellow-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);