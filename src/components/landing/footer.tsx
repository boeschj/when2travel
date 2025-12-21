import { Wordmark } from '@/components/shared/wordmark'

export function Footer() {
  return (
    <footer className="relative z-10 w-full bg-black border-t border-white/5 py-16">
      <div className="max-w-[1120px] mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <Wordmark asLink={false} className="opacity-80 hover:opacity-100 transition-opacity" />
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-8">
            <a
              className="text-gray-400 hover:text-primary transition-colors text-sm font-medium"
              href="/privacy"
            >
              Privacy Policy
            </a>
            <a
              className="text-gray-400 hover:text-primary transition-colors text-sm font-medium"
              href="/terms"
            >
              Terms of Service
            </a>
            <a
              className="text-gray-400 hover:text-primary transition-colors text-sm font-medium"
              href="mailto:support@planthetrip.com"
            >
              Contact Support
            </a>
          </nav>
          <p className="text-gray-400 text-sm">© 2025 Orion Labs</p>
        </div>
      </div>
    </footer>
  )
}
