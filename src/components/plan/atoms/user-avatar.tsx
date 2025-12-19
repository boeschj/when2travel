import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface UserAvatarProps {
  name: string
  isCurrentUser?: boolean
  className?: string
}

export function UserAvatar({
  name,
  isCurrentUser,
  className
}: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={cn('size-8', className)}>
      <AvatarFallback
        className={cn(
          'font-bold text-xs',
          isCurrentUser
            ? 'bg-primary text-background-dark'
            : 'bg-surface-darker text-text-secondary'
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}