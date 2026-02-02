import { linkOptions } from '@tanstack/react-router'
import { AppLink } from '@/components/shared/app-link'
import { Menu } from 'lucide-react'
import { Wordmark } from '@/components/shared/wordmark'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import type { LinkOptions } from '@tanstack/react-router'

type NavItem = {
  label: string
  linkProps: LinkOptions
  variant: 'link' | 'button'
}

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
  const navItems = buildNavItems(planId)

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

function NavLink({ item }: { item: NavItem }) {
  return (
    <AppLink
      {...item.linkProps}
      className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary"
      activeProps={{ className: 'text-sm font-medium transition-colors text-primary' }}
      activeOptions={{ exact: true }}
    >
      {item.label}
    </AppLink>
  )
}

function NavButton({ item }: { item: NavItem }) {
  return (
    <AppLink
      {...item.linkProps}
      activeOptions={{ exact: true }}
    >
      {({ isActive }) => (
        <Button
          size="sm"
          variant={isActive ? 'default' : 'outline'}
          className={cn(!isActive && 'border-border hover:border-primary hover:text-primary')}
        >
          {item.label}
        </Button>
      )}
    </AppLink>
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
  return (
    <DropdownMenuItem asChild>
      <AppLink
        {...item.linkProps}
        className="w-full cursor-pointer"
        activeProps={{ className: 'w-full cursor-pointer text-primary font-medium' }}
        activeOptions={{ exact: true }}
      >
        {item.label}
      </AppLink>
    </DropdownMenuItem>
  )
}

function buildNavItems(planId?: string): NavItem[] {
  const items: NavItem[] = [
    {
      label: 'Create Plan',
      linkProps: linkOptions({ to: '/create' }),
      variant: 'link',
    },
  ]

  if (planId) {
    items.push(
      {
        label: 'View Plan',
        linkProps: linkOptions({ to: '/plan/$planId', params: { planId } }),
        variant: 'link',
      },
      {
        label: 'Share Plan',
        linkProps: linkOptions({ to: '/plan/$planId/share', params: { planId } }),
        variant: 'link',
      },
    )
  }

  items.push({
    label: 'My Trips',
    linkProps: linkOptions({ to: '/trips' }),
    variant: 'button',
  })

  return items
}
