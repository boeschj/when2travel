import { AppLink } from "@/components/shared/app-link";
import Logo from "@/components/shared/logo";

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
          <span className="text-[17px] font-extrabold">PlanTheTrip</span>
        </AppLink>

        <div className="text-text-secondary flex gap-6 text-[14.5px] font-semibold">
          <a
            href="#how-it-works"
            className="hover:text-primary transition-colors"
          >
            How it works
          </a>
          <AppLink
            to="/create"
            className="hover:text-primary transition-colors"
          >
            Start planning
          </AppLink>
        </div>

        <div className="text-text-secondary/60 text-[13.5px] font-medium">
          © 2026 PlanTheTrip. Made for group chats that mean it.
        </div>
      </div>
    </footer>
  );
}
