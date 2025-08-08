import React from "react"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
  clickable?: boolean
  loading?: boolean
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, hover = true, clickable = false, loading = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          "transition-all duration-200 ease-out",
          hover && "hover:shadow-xl hover:-translate-y-1",
          clickable && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
          loading && "animate-pulse pointer-events-none opacity-70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"

interface AnimatedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const AnimatedCardHeader = React.forwardRef<HTMLDivElement, AnimatedCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AnimatedCardHeader.displayName = "AnimatedCardHeader"

interface AnimatedCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

const AnimatedCardTitle = React.forwardRef<HTMLParagraphElement, AnimatedCardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
        {...props}
      >
        {children}
      </h3>
    )
  }
)
AnimatedCardTitle.displayName = "AnimatedCardTitle"

interface AnimatedCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

const AnimatedCardDescription = React.forwardRef<HTMLParagraphElement, AnimatedCardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      >
        {children}
      </p>
    )
  }
)
AnimatedCardDescription.displayName = "AnimatedCardDescription"

interface AnimatedCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const AnimatedCardContent = React.forwardRef<HTMLDivElement, AnimatedCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
        {children}
      </div>
    )
  }
)
AnimatedCardContent.displayName = "AnimatedCardContent"

interface AnimatedCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const AnimatedCardFooter = React.forwardRef<HTMLDivElement, AnimatedCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props}>
        {children}
      </div>
    )
  }
)
AnimatedCardFooter.displayName = "AnimatedCardFooter"

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardFooter,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
}