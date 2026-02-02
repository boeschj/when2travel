import * as React from 'react'
import { useIsMobile } from '@/hooks/use-is-mobile'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

const ResponsiveDialogContext = React.createContext(false)

function useIsDesktop() {
  return React.useContext(ResponsiveDialogContext)
}

function ResponsiveDialog({
  children,
  ...props
}: React.ComponentProps<typeof Dialog>) {
  const isMobile = useIsMobile()
  const isDesktop = !isMobile
  const Root = isDesktop ? Dialog : Drawer

  return (
    <ResponsiveDialogContext.Provider value={isDesktop}>
      <Root {...props}>{children}</Root>
    </ResponsiveDialogContext.Provider>
  )
}

function ResponsiveDialogContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <DialogContent className={className} {...props}>
        {children}
      </DialogContent>
    )
  }

  return (
    <DrawerContent className="min-h-[40vh] px-4 pb-6">
      {children}
    </DrawerContent>
  )
}

function ResponsiveDialogHeader(props: React.ComponentProps<"div">) {
  const isDesktop = useIsDesktop()
  const Component = isDesktop ? DialogHeader : DrawerHeader
  return <Component {...props} />
}

function ResponsiveDialogTitle(props: React.ComponentProps<"h2">) {
  const isDesktop = useIsDesktop()
  const Component = isDesktop ? DialogTitle : DrawerTitle
  return <Component {...props} />
}

function ResponsiveDialogDescription(props: React.ComponentProps<"p">) {
  const isDesktop = useIsDesktop()
  const Component = isDesktop ? DialogDescription : DrawerDescription
  return <Component {...props} />
}

function ResponsiveDialogFooter(props: React.ComponentProps<"div">) {
  const isDesktop = useIsDesktop()
  const Component = isDesktop ? DialogFooter : DrawerFooter
  return <Component {...props} />
}

function ResponsiveDialogClose(props: React.ComponentProps<"button">) {
  const isDesktop = useIsDesktop()
  const Component = isDesktop ? DialogClose : DrawerClose
  return <Component {...props} />
}

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
}
