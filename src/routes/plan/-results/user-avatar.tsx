import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  className?: string;
  colorHex?: string;
}

export function UserAvatar({ name, className, colorHex }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fallbackClassName = cn(
    "font-bold text-xs",
    !colorHex && "bg-surface-darker text-text-secondary",
  );

  const fallbackStyle = colorHex ? { backgroundColor: colorHex, color: "#1a1a1a" } : undefined;

  return (
    <Avatar className={cn("size-8", className)}>
      <AvatarFallback
        className={fallbackClassName}
        style={fallbackStyle}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
