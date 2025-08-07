import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg",
        default: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg",
        secondary: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:shadow-md",
        outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:shadow-md",
        destructive: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg",
        ghost: "hover:bg-slate-100 text-slate-700 hover:shadow-sm",
        link: "text-blue-600 underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-4 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  successState?: boolean
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, successState = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const buttonVariant = successState ? "success" : variant
    const buttonContent = loading && loadingText ? loadingText : children
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant: buttonVariant, size, className }),
          "relative overflow-hidden",
          loading && "cursor-not-allowed",
          successState && "animate-pulse"
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {successState && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-white animate-ping" />
          </div>
        )}
        <span className={cn(
          "transition-opacity duration-200",
          loading && "opacity-70"
        )}>
          {buttonContent}
        </span>
      </Comp>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton, buttonVariants }