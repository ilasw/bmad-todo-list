import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskListPage } from './TaskListPage.js'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <TaskListPage />
    </QueryClientProvider>,
  )
}

describe('TaskListPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows error banner with retry when fetch fails', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Network down',
            },
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    renderPage()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/network down/i),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() =>
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument(),
    )
  })
})
