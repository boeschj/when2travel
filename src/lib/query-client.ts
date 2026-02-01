import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from './errors'

const STALE_TIME_MS = 1000 * 60 * 5
const MAX_SERVER_RETRIES = 3

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.isClientError) return false
  return failureCount < MAX_SERVER_RETRIES
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      retry: shouldRetry,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const hasStaleData = query.state.data !== undefined
      if (hasStaleData) {
        toast.error(`Background refresh failed: ${error.message}`)
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const hasCustomErrorHandler = mutation.options.onError !== undefined
      if (hasCustomErrorHandler) return
      toast.error(error.message || 'Something went wrong')
    },
  }),
})
