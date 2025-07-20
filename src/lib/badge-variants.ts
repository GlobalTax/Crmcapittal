import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-[10px] px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        warning:
          "bg-yellow-500 text-yellow-50",
        success:
          "bg-green-500 text-green-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);