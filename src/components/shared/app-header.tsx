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

function NavLink({ item }: { item: NavItem }) {
  const linkProps = {
    to: item.to,
    ...(item.params && { params: item.params }),
  }

  return (
    <Link
      {...linkProps}
      className={cn(
        'text-sm font-medium transition-colors',
        item.isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-primary'
      )}
    >
      {item.label}
    </Link>
  )
}

function NavButton({ item }: { item: NavItem }) {
  const linkProps = {
    to: item.to,
    ...(item.params && { params: item.params }),
  }

  return (
    <Link {...linkProps}>
      <Button
        size="sm"
        variant={item.isActive ? 'default' : 'outline'}
        className={cn(
          item.isActive
            ? ''
            : 'border-border hover:border-primary hover:text-primary'
        )}
      >
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

  // Don't show menu if there's only the button
  if (linkItems.length === 0) {
    return buttonItem ? (
      <div className="md:hidden">
        <NavButton item={buttonItem} />
      </div>
    ) : null
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
          {linkItems.map((item) => {
            const linkProps = {
              to: item.to,
              ...(item.params && { params: item.params }),
            }

            return (
              <DropdownMenuItem key={item.label} asChild>
                <Link
                  {...linkProps}
                  className={cn(
                    'w-full cursor-pointer',
                    item.isActive && 'text-primary font-medium'
                  )}
                >
                  {item.label}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {buttonItem && <NavButton item={buttonItem} />}
    </div>
  )
}

export function AppHeader({
  planId,
  variant = 'default',
  className,
}: AppHeaderProps) {
  const navItems = useNavigation({ planId })

  const outerStyles =
    variant === 'default'
      ? 'w-full border-b border-border bg-background-dark'
      : 'w-full border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50'

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
