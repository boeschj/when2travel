import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { Wordmark } from '@/components/shared/wordmark'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigation, type NavItem } from '@/hooks/use-navigation'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  planId?: string
  variant?: 'default' | 'transparent'
  className?: string
}

export default function AppHeader({
  planId,
  variant = 'default',
  className,
}: AppHeaderProps) {
  const navItems = useNavigation({ planId })

  const isDefault = variant === 'default'
  const outerStyles = cn(
    'w-full border-b border-border',
    isDefault && 'bg-background-dark',
    !isDefault && 'bg-background/95 backdrop-blur sticky top-0 z-50'
  )

  return (
    <div className={outerStyles}>
      <header
        className={cn(
          'flex items-center justify-between whitespace-nowrap mx-auto max-w-[1440px] px-4 md:px-10 py-3',
          className
        )}
      >
        <Wordmark />
        <DesktopNav items={navItems} />
        <MobileNav items={navItems} />
      </header>
    </div>
  )
}

export { AppHeader }

function buildLinkProps(item: NavItem) {
  const props: { to: string; params?: Record<string, string> } = {
    to: item.to,
  }
  if (item.params) {
    props.params = item.params
  }
  return props
}

function NavLink({ item }: { item: NavItem }) {
  const linkProps = buildLinkProps(item)
  const linkStyles = cn(
    'text-sm font-medium transition-colors',
    item.isActive && 'text-primary',
    !item.isActive && 'text-muted-foreground hover:text-primary'
  )

  return (
    <Link {...linkProps} className={linkStyles}>
      {item.label}
    </Link>
  )
}

function NavButton({ item }: { item: NavItem }) {
  const linkProps = buildLinkProps(item)

  const buttonVariant = item.isActive ? 'default' : 'outline'
  const buttonStyles = cn(
    !item.isActive && 'border-border hover:border-primary hover:text-primary'
  )

  return (
    <Link {...linkProps}>
      <Button size="sm" variant={buttonVariant} className={buttonStyles}>
        {item.label}
      </Button>
    </Link>
  )
}

function DesktopNav({ items }: { items: NavItem[] }) {
  const linkItems = items.filter((item) => item.variant === 'link')
  const buttonItem = items.find((item) => item.variant === 'button')

  return (
    <nav className="hidden md:flex items-center gap-6">
      {linkItems.map((item) => (
        <NavLink key={item.label} item={item} />
      ))}
      {buttonItem && <NavButton item={buttonItem} />}
    </nav>
  )
}

function MobileNav({ items }: { items: NavItem[] }) {
  const linkItems = items.filter((item) => item.variant === 'link')
  const buttonItem = items.find((item) => item.variant === 'button')

  const hasNoLinks = linkItems.length === 0

  if (hasNoLinks) {
    return (
      <div className="md:hidden">
        {buttonItem && <NavButton item={buttonItem} />}
      </div>
    )
  }

  return (
    <div className="flex md:hidden items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {linkItems.map((item) => (
            <MobileNavLink key={item.label} item={item} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {buttonItem && <NavButton item={buttonItem} />}
    </div>
  )
}

function MobileNavLink({ item }: { item: NavItem }) {
  const linkProps = buildLinkProps(item)
  const linkStyles = cn(
    'w-full cursor-pointer',
    item.isActive && 'text-primary font-medium'
  )

  return (
    <DropdownMenuItem asChild>
      <Link {...linkProps} className={linkStyles}>
        {item.label}
      </Link>
    </DropdownMenuItem>
  )
}
