import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { NotFound } from '@/components/shared/not-found'

const STALE_TIME_MS = 1000 * 60 * 5

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      retry: 1,
    },
  },
})

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <QueryBoundary>
          <Outlet />
        </QueryBoundary>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  ),
  notFoundComponent: NotFound,
})
