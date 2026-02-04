import { useCopyToClipboard, useShare } from "@/hooks/use-clipboard";
import { Check, Copy, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShareLinkInputProps {
  link: string;
  planName?: string;
  className?: string;
}

export function ShareLinkInput({ link, planName, className }: ShareLinkInputProps) {
  const { copied, copy } = useCopyToClipboard();
  const { share, canShare } = useShare();

  const handleCopy = () => void copy(link);

  const handleShare = () => {
    if (!planName) return;
    void share({
      title: `Join our trip: ${planName}`,
      text: `I'm organizing a trip and would love to know when you're available!`,
      url: link,
    });
  };

  const handleCopyButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    void copy(link);
  };

  const showShareButton = canShare && !!planName;
  const copyIcon = copied ? <Check className="size-4 scale-110" /> : <Copy className="size-4" />;
  const copyLabel = copied ? "Copied!" : "Copy";
  const copyVariant: "secondary" | "default" = showShareButton ? "secondary" : "default";

  return (
    <div className={cn("flex w-full items-center gap-2", className)}>
      <div
        role="button"
        tabIndex={0}
        className="bg-input group relative flex h-14 flex-1 cursor-pointer items-center rounded-2xl shadow-inner"
        onClick={handleCopy}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCopy();
          }
        }}
      >
        <Input
          className="text-foreground placeholder:text-muted-foreground/50 pointer-events-none w-full cursor-pointer truncate border-none bg-transparent px-5 text-sm font-medium select-all focus:ring-0 focus-visible:ring-0"
          value={link}
          readOnly
          tabIndex={-1}
          hideHelperText
        />
        <div className="pr-2">
          <Button
            onClick={handleCopyButtonClick}
            size="sm"
            variant={copyVariant}
            className="h-10 rounded-xl px-5"
          >
            {copyIcon}
            {copyLabel}
          </Button>
        </div>
      </div>
      {showShareButton && (
        <Button
          onClick={handleShare}
          size="sm"
          className="h-14 shrink-0 rounded-2xl px-5"
        >
          <Share2 className="size-4" />
          Share
        </Button>
      )}
    </div>
  );
}
