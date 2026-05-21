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

const todoA: Todo = {
  id: 'aaaaaaaa-aaaa-4111-8111-111111111111',
  description: 'Task A',
  completed: false,
  createdAt: '2026-05-21T12:00:00.000Z',
  tagIds: [],
}

const todoB: Todo = {
  id: 'bbbbbbbb-bbbb-4111-8111-111111111111',
  description: 'Task B',
  completed: false,
  createdAt: '2026-05-21T12:01:00.000Z',
  tagIds: [],
}

const optimisticTodo: Todo = {
  id: 'cccccccc-cccc-4111-8111-111111111111',
  description: 'Pending create',
  completed: false,
  createdAt: '2026-05-21T12:02:00.000Z',
  tagIds: [],
}

function ConnectedTaskList() {
  const { data = [] } = useTodos()
  return <TaskList todos={data} />
}

function renderConnectedTaskList(todos: Todo[] = [todo]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  })
  queryClient.setQueryData(TODOS_QUERY_KEY, todos)

  return render(
    <QueryClientProvider client={queryClient}>
      <ConnectedTaskList />
    </QueryClientProvider>,
  )
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
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
      .mockResolvedValueOnce(jsonResponse([{ ...todo, completed: true }]))

    renderConnectedTaskList()

    const checkbox = screen.getByRole('checkbox', {
      name: /mark "write tests" complete/i,
    })
    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)

    await waitFor(() => expect(checkbox).toBeChecked())

    resolvePatch!(jsonResponse({ ...todo, completed: true }))

    await waitFor(() => expect(checkbox).toBeChecked())
    expect(screen.getByText('Write tests')).toHaveClass('line-through')
  })

  it('optimistically reverts completion when toggling a completed task', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ ...todo, completed: false }))
      .mockResolvedValueOnce(jsonResponse([{ ...todo, completed: false }]))

    renderConnectedTaskList([{ ...todo, completed: true }])

    const checkbox = screen.getByRole('checkbox', {
      name: /mark "write tests" active/i,
    })
    expect(checkbox).toBeChecked()
    expect(screen.getByText('Write tests')).toHaveClass('line-through')

    await userEvent.click(checkbox)

    await waitFor(() => expect(checkbox).not.toBeChecked())
    expect(screen.getByText('Write tests')).not.toHaveClass('line-through')
  })

  it('reverts optimistic toggle and shows error when API fails', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Server unavailable',
            },
          },
          500,
        ),
      )
      .mockResolvedValueOnce(jsonResponse([todo]))

    renderConnectedTaskList()

    const checkbox = screen.getByRole('checkbox', {
      name: /mark "write tests" complete/i,
    })
    await userEvent.click(checkbox)

    await waitFor(() => expect(checkbox).not.toBeChecked())
    expect(screen.getByRole('alert')).toHaveTextContent(/server unavailable/i)
    expect(screen.getByText('Write tests')).not.toHaveClass('line-through')
  })

  it('reverts only the failed toggle without clobbering concurrent toggles on other items', async () => {
    let resolvePatchA: (value: Response) => void
    const patchAPromise = new Promise<Response>((resolve) => {
      resolvePatchA = resolve
    })

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : input.url
      const method = init?.method ?? 'GET'

      if (method === 'PATCH' && url.endsWith(todoA.id)) {
        return patchAPromise
      }

      if (method === 'PATCH' && url.endsWith(todoB.id)) {
        return jsonResponse({ ...todoB, completed: true })
      }

      if (method === 'GET') {
        return jsonResponse([
          { ...todoA, completed: false },
          { ...todoB, completed: true },
        ])
      }

      throw new Error(`Unexpected fetch: ${method} ${url}`)
    })

    renderConnectedTaskList([todoA, todoB])

    const checkboxA = screen.getByRole('checkbox', {
      name: /mark "task a" complete/i,
    })
    const checkboxB = screen.getByRole('checkbox', {
      name: /mark "task b" complete/i,
    })

    await userEvent.click(checkboxA)
    await waitFor(() => expect(checkboxA).toBeChecked())

    await userEvent.click(checkboxB)
    await waitFor(() => expect(checkboxB).toBeChecked())

    resolvePatchA!(
      jsonResponse(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update task A',
          },
        },
        500,
      ),
    )

    await waitFor(() => expect(checkboxA).not.toBeChecked())
    expect(checkboxB).toBeChecked()
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to update task a/i)
  })

  it('reverts toggle and shows error when toggling a not-yet-persisted todo', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              code: 'NOT_FOUND',
              message: 'Todo not found',
            },
          },
          404,
        ),
      )
      .mockResolvedValueOnce(jsonResponse([optimisticTodo]))

    renderConnectedTaskList([optimisticTodo])

    const checkbox = screen.getByRole('checkbox', {
      name: /mark "pending create" complete/i,
    })
    await userEvent.click(checkbox)

    await waitFor(() => expect(checkbox).not.toBeChecked())
    expect(screen.getByRole('alert')).toHaveTextContent(/todo not found/i)
  })
})
