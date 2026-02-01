import { Wordmark } from '@/components/shared/wordmark'

const FOOTER_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: 'mailto:support@planthetrip.com', label: 'Contact Support' },
] as const

export function Footer() {
  return (
    <footer className="relative z-10 w-full bg-black border-t border-white/5 py-16">
      <div className="max-w-[1120px] mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <Wordmark asLink={false} className="opacity-80 hover:opacity-100 transition-opacity" />
          <FooterNav />
          <p className="text-gray-400 text-sm">© 2025 Orion Labs</p>
        </div>
      </div>
    </footer>
  )
}

function FooterNav() {
  return (
    <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-8">
      {FOOTER_LINKS.map((link) => (
        <FooterLink key={link.href} href={link.href} label={link.label} />
      ))}
    </nav>
  )
}

interface FooterLinkProps {
  href: string
  label: string
}

function FooterLink({ href, label }: FooterLinkProps) {
  return (
    <a
      className="text-gray-400 hover:text-primary transition-colors text-sm font-medium"
      href={href}
    >
      {label}
    </a>
  )
}
