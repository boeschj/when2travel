import { useAtom } from "jotai";
import { Cookie, X } from "lucide-react";

import { tripsBannerDismissedAtom } from "@/lib/atoms";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function StorageBanner() {
  const [dismissed, setDismissed] = useAtom(tripsBannerDismissedAtom);

  if (dismissed) return null;

  const handleDismiss = () => setDismissed(true);

  return (
    <Alert className="relative rounded-lg pr-12">
      <Cookie className="h-4 w-4" />
      <AlertDescription>
        <span className="text-foreground font-semibold">Browser Storage:</span> These trips are
        stored in your browser's local cache. Avoid clearing your browsing data to keep this list,
        or bookmark your trip links directly.
      </AlertDescription>
      <DismissButton onDismiss={handleDismiss} />
    </Alert>
  );
}

interface DismissButtonProps {
  onDismiss: () => void;
}

function DismissButton({ onDismiss }: DismissButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="absolute top-3 right-3"
      onClick={onDismiss}
      aria-label="Dismiss"
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
