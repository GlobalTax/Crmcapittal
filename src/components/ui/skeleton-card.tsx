import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonCardProps {
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

export function SkeletonCard({ className, variant = 'default' }: SkeletonCardProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("p-4 border rounded-lg bg-card animate-pulse", className)}>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn("p-6 border rounded-lg bg-card animate-pulse", className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("p-4 border rounded-lg bg-card animate-pulse", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ 
  count = 6, 
  variant = 'default',
  className 
}: { 
  count?: number
  variant?: 'default' | 'compact' | 'detailed'
  className?: string 
}) {
  return (
    <div className={cn(
      "grid gap-6",
      variant === 'compact' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 100}ms` }}
          className="animate-fade-in"
        >
          <SkeletonCard 
            variant={variant}
            className="animate-pulse"
          />
        </div>
      ))}
    </div>
  )
}