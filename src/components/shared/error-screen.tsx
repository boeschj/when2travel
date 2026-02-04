import { AlertCircle, Home, MapPin } from "lucide-react";

import { AppLink } from "@/components/shared/app-link";
import { Button } from "@/components/ui/button";

import Logo from "./logo";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "default" | "not-found";
}

export function ErrorScreen({
  title = "Something went wrong",
  message = "We couldn't load this page. Please try again.",
  onRetry,
  variant = "default",
}: ErrorScreenProps) {
  if (variant === "not-found") {
    return (
      <NotFoundScreen
        title={title}
        message={message}
      />
    );
  }

  return (
    <DefaultErrorScreen
      title={title}
      message={message}
      onRetry={onRetry}
    />
  );
}

function NotFoundScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6 py-20">
      <BackgroundText />
      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <HeroImage />
        <h1 className="text-foreground mb-4 text-4xl font-black md:text-5xl">{title}</h1>
        <p className="text-muted-foreground mb-8 text-lg">{message}</p>
        <Button
          asChild
          size="lg"
          className="gap-2"
        >
          <AppLink to="/trips">
            <Home className="h-5 w-5" />
            Back to Home Base
          </AppLink>
        </Button>
      </div>
    </div>
  );
}

function DefaultErrorScreen({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <Logo
        size="large"
        color="muted"
      />
      <ErrorMessage
        title={title}
        message={message}
      />
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

function ErrorMessage({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="text-destructive flex items-center gap-2">
        <AlertCircle className="size-5" />
        <span className="text-xl font-semibold">{title}</span>
      </div>
      <p className="text-muted-foreground max-w-md">{message}</p>
    </div>
  );
}

function BackgroundText() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
      <span className="text-muted/10 text-[20rem] leading-none font-black md:text-[30rem]">
        404
      </span>
    </div>
  );
}

function HeroImage() {
  return (
    <div className="relative mb-8">
      <div className="border-border/20 h-44 w-64 overflow-hidden rounded-2xl border shadow-2xl shadow-black/30">
        <img
          src="/images/hero-3.webp"
          alt="Misty forest landscape"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <div className="relative">
          <MapPin className="text-primary fill-primary h-12 w-12" />
          <div className="bg-background absolute top-3 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full" />
        </div>
      </div>
    </div>
  );
}
