import { Copy, Mail, MessageCircle, Send, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PLATFORM = {
  EMAIL: "email",
  WHATSAPP: "whatsapp",
  TELEGRAM: "telegram",
  COPY: "copy",
} as const;

type Platform = (typeof PLATFORM)[keyof typeof PLATFORM];

interface ShareButtonProps extends React.ComponentProps<typeof Button> {
  platform: Platform;
}

const platformConfig: Record<Platform, { icon: LucideIcon; bgColor: string; title: string }> = {
  [PLATFORM.EMAIL]: {
    icon: Mail,
    bgColor: "hover:bg-[#25D366] hover:text-white",
    title: "Share via Email",
  },
  [PLATFORM.WHATSAPP]: {
    icon: MessageCircle,
    bgColor: "hover:bg-[#25D366] hover:text-white",
    title: "Share on WhatsApp",
  },
  [PLATFORM.TELEGRAM]: {
    icon: Send,
    bgColor: "hover:bg-[#0088cc] hover:text-white",
    title: "Share on Telegram",
  },
  [PLATFORM.COPY]: {
    icon: Copy,
    bgColor: "hover:bg-primary hover:text-primary-foreground",
    title: "Copy Link",
  },
};

export function ShareButton({ platform, className, ...props }: ShareButtonProps) {
  const config = platformConfig[platform];
  const Icon = config.icon;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "bg-secondary text-secondary-foreground size-12 rounded-full",
        "group flex items-center justify-center transition-all duration-300",
        config.bgColor,
        className,
      )}
      title={config.title}
      {...props}
    >
      <Icon className="size-5 transition-transform group-hover:scale-110" />
    </Button>
  );
}

export { PLATFORM };
