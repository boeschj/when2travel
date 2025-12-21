import { cn, generateColorFromString } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface UserAvatarProps {
  name: string
  isCurrentUser?: boolean
  className?: string
  /** Unique identifier for consistent color generation (e.g., response ID) */
  colorSeed?: string
}

export function UserAvatar({
  name,
  isCurrentUser: _isCurrentUser,
  className,
  colorSeed
}: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Generate color from seed (or fall back to name)
  const generatedColor = colorSeed ? generateColorFromString(colorSeed) : null

  return (
    <Avatar className={cn('size-8', className)}>
      <AvatarFallback
        className={cn(
          'font-bold text-xs',
          !generatedColor && 'bg-surface-darker text-text-secondary'
        )}
        style={
          generatedColor
            ? { backgroundColor: generatedColor.hex, color: '#1a1a1a' }
            : undefined
        }
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

/** Get the color for a respondent based on their ID */
export function getRespondentColor(id: string) {
  return generateColorFromString(id)
}