import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Todo } from '@todo-list/shared'
import { TaskList } from './TaskList.js'
import { TODOS_QUERY_KEY, useTodos } from './hooks/use-todos.js'

const todo: Todo = {
  id: '11111111-1111-4111-8111-111111111111',
  description: 'Write tests',
  completed: false,
  createdAt: '2026-05-21T12:00:00.000Z',
  tagIds: [],
}

function ConnectedTaskList() {
  const { data = [] } = useTodos()
  return <TaskList todos={data} />
}

function renderConnectedTaskList() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  })
  queryClient.setQueryData(TODOS_QUERY_KEY, [todo])

  return render(
    <QueryClientProvider client={queryClient}>
      <ConnectedTaskList />
    </QueryClientProvider>,
  )
}

describe('TaskItem', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('optimistically toggles completion when checkbox is clicked', async () => {
    let resolvePatch: (value: Response) => void
    const patchPromise = new Promise<Response>((resolve) => {
      resolvePatch = resolve
    })

    vi.mocked(fetch)
      .mockReturnValueOnce(patchPromise)
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ ...todo, completed: true }]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    renderConnectedTaskList()

    const checkbox = screen.getByRole('checkbox', {
      name: /mark "write tests" complete/i,
    })
    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)

    await waitFor(() => expect(checkbox).toBeChecked())

    resolvePatch!(
      new Response(
        JSON.stringify({ ...todo, completed: true }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await waitFor(() => expect(checkbox).toBeChecked())
    expect(screen.getByText('Write tests')).toHaveClass('line-through')
  })

  it('reverts optimistic toggle and shows error when API fails', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Server unavailable',
            },
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([todo]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    renderConnectedTaskList()

    const checkbox = screen.getByRole('checkbox', {
      name: /mark "write tests" complete/i,
    })
    await userEvent.click(checkbox)

    await waitFor(() => expect(checkbox).not.toBeChecked())
    expect(screen.getByRole('alert')).toHaveTextContent(/server unavailable/i)
    expect(screen.getByText('Write tests')).not.toHaveClass('line-through')
  })
})
