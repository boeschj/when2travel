import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function TripCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Badge */}
        <Skeleton className="h-6 w-24 rounded-full" />
        {/* Trip name */}
        <Skeleton className="h-7 w-3/4" />
        {/* Date range */}
        <Skeleton className="h-5 w-1/2" />
        {/* Progress */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-24 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}
