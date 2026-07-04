import { AppLink } from "@/components/shared/app-link";
import Logo from "@/components/shared/logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--ptt-green-border)] bg-[var(--ptt-surface)]">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-6 py-9">
        <AppLink
          to="/"
          className="flex items-center gap-2"
        >
          <Logo
            size="small"
            className="w-6 text-[var(--ptt-brand)]"
          />
          <span className="text-[17px] font-extrabold text-[var(--ptt-ink)]">PlanTheTrip</span>
        </AppLink>

        <div className="flex gap-6 text-[14.5px] font-semibold text-[var(--ptt-muted)]">
          <a
            href="#how-it-works"
            className="transition-colors hover:text-[var(--ptt-brand)]"
          >
            How it works
          </a>
          <AppLink
            to="/create"
            className="transition-colors hover:text-[var(--ptt-brand)]"
          >
            Start planning
          </AppLink>
        </div>

        <div className="text-[13.5px] font-medium text-[var(--ptt-faint)]">
          © 2026 PlanTheTrip. Made for group chats that mean it.
        </div>
      </div>
    </footer>
  );
}
