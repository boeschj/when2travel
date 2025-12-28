import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function TripCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex-1 flex flex-col gap-4 pt-6">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </CardContent>
      <CardFooter className="gap-3 pb-6">
        <Skeleton className="h-11 flex-1 rounded-full" />
        <Skeleton className="h-11 w-24 rounded-full" />
      </CardFooter>
    </Card>
  )
}
