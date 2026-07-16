import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function QueryWrapper({ children }: Readonly<{ children: ReactNode }>) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return { queryClient, QueryWrapper }
}

export function renderWithClient(ui: ReactElement) {
  const { queryClient, QueryWrapper } = createQueryWrapper()
  return { ...render(ui, { wrapper: QueryWrapper }), queryClient }
}

export function renderHookWithClient<Result>(hook: () => Result) {
  const { queryClient, QueryWrapper } = createQueryWrapper()
  return { ...renderHook(hook, { wrapper: QueryWrapper }), queryClient }
}
