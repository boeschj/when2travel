import { Calendar } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative z-10 w-full bg-background border-t border-border py-12">
      <div className="max-w-[1120px] mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-foreground opacity-80">
            <Calendar className="text-primary" />
            <span className="font-bold tracking-tight">PlanTheTrip</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">
              Privacy Policy
            </a>
            <a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">
              Terms of Service
            </a>
            <a className="text-muted-foreground hover:text-primary transition-colors text-sm" href="#">
              Contact Support
            </a>
          </div>
          <p className="text-muted-foreground text-sm">© 2025 PlanTheTrip</p>
        </div>
      </div>
    </footer>
  )
}
