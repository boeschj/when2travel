import { AppLink } from "@/components/shared/app-link";
import Logo from "@/components/shared/logo";

const FOOTER_COPY = {
  brand: "PlanTheTrip",
  contactLabel: "Contact Support",
  contactHref: "mailto:support@planthetrip.com",
  copyright: "© 2026 Orion Labs",
} as const;

export function LandingFooter() {
  return (
    <footer className="mt-24 border-t border-[#1f3319]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-9">
        <AppLink
          to="/"
          className="flex items-center gap-2"
        >
          <Logo
            size="small"
            className="text-primary w-6"
          />
          <span className="text-[17px] font-extrabold">{FOOTER_COPY.brand}</span>
        </AppLink>

        <a
          href={FOOTER_COPY.contactHref}
          className="text-text-secondary hover:text-primary text-[14.5px] font-semibold transition-colors"
        >
          {FOOTER_COPY.contactLabel}
        </a>

        <div className="text-text-secondary/60 text-[13.5px] font-medium">
          {FOOTER_COPY.copyright}
        </div>
      </div>
    </footer>
  );
}
