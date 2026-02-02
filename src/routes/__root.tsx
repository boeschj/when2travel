import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { NotFound } from '@/components/shared/not-found'
import { ErrorScreen } from '@/components/shared/error-screen'
import { queryClient } from '@/lib/query-client'

import type { QueryClient } from '@tanstack/react-query'
import type { ErrorComponentProps } from '@tanstack/react-router'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <HeadContent />
        <Outlet />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  ),
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
})

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message="We encountered an unexpected error. Please try again."
      onRetry={reset}
    />
  )
}
