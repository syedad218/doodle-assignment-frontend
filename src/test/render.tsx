import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

export function renderWithClient(ui: ReactElement) {
  return render(ui, { wrapper: createQueryWrapper() })
}

export function renderHookWithClient<Result>(hook: () => Result) {
  return renderHook(hook, { wrapper: createQueryWrapper() })
}
