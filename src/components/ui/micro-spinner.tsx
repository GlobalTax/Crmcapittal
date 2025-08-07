import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MicroSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  show?: boolean
}

export function MicroSpinner({ 
  size = 'sm', 
  className, 
  show = true 
}: MicroSpinnerProps) {
  if (!show) return null

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }

  return (
    <div className={cn(
      "inline-flex items-center justify-center",
      "animate-fade-in",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size]
      )} />
    </div>
  )
}

export function GlobalSpinner({ show = false }: { show?: boolean }) {
  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-background/80 backdrop-blur-sm border rounded-full p-2 shadow-lg">
        <MicroSpinner size="sm" />
      </div>
    </div>
  )
}