import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { PostHogProvider } from 'posthog-js/react'
import './index.css'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

const router = createRouter({
  routeTree,
  scrollRestoration: false,
})

router.subscribe('onResolved', () => {
  window.scrollTo(0, 0)
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true,
        debug: import.meta.env.MODE === 'development',
      }}
    >
      <RouterProvider router={router} />
    </PostHogProvider>
  </StrictMode>,
)