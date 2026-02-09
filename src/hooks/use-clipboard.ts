import { useCallback, useState } from "react";
import { toast } from "sonner";

function createHiddenTextArea(text: string): HTMLTextAreaElement {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  return textArea;
}

function copyViaLegacyTextArea(text: string): boolean {
  const textArea = createHiddenTextArea(text);
  // eslint-disable-next-line unicorn/prefer-dom-node-append -- TypeScript types conflict with append() due to lib augmentation
  document.body.appendChild(textArea);
  textArea.select();
  // eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated -- execCommand fallback for legacy browser support
  const didCopy = document.execCommand("copy");
  textArea.remove();
  return didCopy;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      return copyViaLegacyTextArea(text);
    } catch {
      return false;
    }
  }
}

interface UseCopyToClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
  resetDelay?: number;
}

export function useCopyToClipboard(options?: UseCopyToClipboardOptions) {
  const successMessage = options?.successMessage ?? "Link copied to clipboard!";
  const errorMessage = options?.errorMessage ?? "Failed to copy link";
  const resetDelay = options?.resetDelay ?? 2000;

  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      const didCopy = await copyToClipboard(text);

      if (didCopy) {
        setCopied(true);
        toast.success(successMessage);
        setTimeout(() => setCopied(false), resetDelay);
      } else {
        toast.error(errorMessage);
      }

      return didCopy;
    },
    [successMessage, errorMessage, resetDelay],
  );

  return { copied, copy };
}

interface ShareData {
  title: string;
  text: string;
  url: string;
}

interface UseShareOptions {
  fallbackToClipboard?: boolean;
  errorMessage?: string;
}

export function canShare(): boolean {
  const hasNavigator = typeof navigator !== "undefined";
  const hasShareApi = hasNavigator && !!navigator.share;
  return hasShareApi;
}

async function copyUrlWithToast(url: string, errorMessage: string): Promise<boolean> {
  const didCopy = await copyToClipboard(url);

  if (didCopy) {
    toast.success("Link copied to clipboard!");
  } else {
    toast.error(errorMessage);
  }

  return didCopy;
}

export function useShare(options?: UseShareOptions) {
  const fallbackToClipboard = options?.fallbackToClipboard ?? true;
  const errorMessage = options?.errorMessage ?? "Failed to share";

  const share = useCallback(
    async (data: ShareData) => {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share(data);
          return true;
        } catch (error: unknown) {
          const isUserCancellation = error instanceof Error && error.name === "AbortError";
          if (isUserCancellation) return false;

          if (fallbackToClipboard) {
            return copyUrlWithToast(data.url, errorMessage);
          }

          toast.error(errorMessage);
          return false;
        }
      }

      if (fallbackToClipboard) {
        return copyUrlWithToast(data.url, errorMessage);
      }

      return false;
    },
    [fallbackToClipboard, errorMessage],
  );

  return { share, canShare: canShare() };
}
