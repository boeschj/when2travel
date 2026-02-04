import { Wordmark } from "@/components/shared/wordmark";

const FOOTER_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "mailto:support@planthetrip.com", label: "Contact Support" },
] as const;

export function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-white/5 bg-black py-16">
      <div className="mx-auto max-w-[1120px] px-5">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <Wordmark
            asLink={false}
            className="opacity-80 transition-opacity hover:opacity-100"
          />
          <FooterNav />
          <p className="text-sm text-gray-400">© 2025 Orion Labs</p>
        </div>
      </div>
    </footer>
  );
}

function FooterNav() {
  return (
    <nav
      aria-label="Footer navigation"
      className="flex flex-wrap justify-center gap-8"
    >
      {FOOTER_LINKS.map(link => (
        <FooterLink
          key={link.href}
          href={link.href}
          label={link.label}
        />
      ))}
    </nav>
  );
}

interface FooterLinkProps {
  href: string;
  label: string;
}

function FooterLink({ href, label }: FooterLinkProps) {
  return (
    <a
      className="hover:text-primary text-sm font-medium text-gray-400 transition-colors"
      href={href}
    >
      {label}
    </a>
  );
}
