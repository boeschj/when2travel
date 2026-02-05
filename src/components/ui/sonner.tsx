import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const VALID_THEMES: ReadonlySet<string> = new Set(["light", "dark", "system"]);
type ValidTheme = "light" | "dark" | "system";

function isValidTheme(theme: string | undefined): theme is ValidTheme {
  return theme !== undefined && VALID_THEMES.has(theme);
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const validatedTheme = isValidTheme(theme) ? theme : "system";

  return (
    <Sonner
      theme={validatedTheme}
      position="top-right"
      offset={100}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "bg-card text-card-foreground border border-border rounded-xl px-4 py-3 shadow-lg flex gap-3 items-start",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors",
          cancelButton:
            "bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors",
          closeButton:
            "bg-background text-foreground border border-border rounded-full p-1 hover:bg-accent transition-colors absolute top-2 right-2",
          success: "border-primary/50 shadow-glow-soft",
          error:
            "bg-destructive text-destructive-foreground border-destructive shadow-glow-destructive",
          warning: "border-warning/50 shadow-glow-warning",
          info: "border-primary/30 shadow-glow-subtle",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
