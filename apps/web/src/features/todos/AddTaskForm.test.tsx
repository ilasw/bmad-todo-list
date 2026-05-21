import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUiStore } from '../../stores/ui-store.js'
import { AddTaskForm } from './AddTaskForm.js'

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AddTaskForm />
    </QueryClientProvider>,
  )
}

describe('AddTaskForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    useUiStore.setState({
      draftDescription: '',
      setDraftDescription: useUiStore.getState().setDraftDescription,
      clearDraftDescription: useUiStore.getState().clearDraftDescription,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows validation message for empty description', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      /cannot be empty/i,
    )
  })

  it('shows validation message when description exceeds 2500 characters', async () => {
    const user = userEvent.setup()
    useUiStore.setState({ draftDescription: 'a'.repeat(2501) })
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByRole('alert')).toHaveTextContent(/2500 characters/i)
  })

  it('preserves draft description in the input after validation failure', async () => {
    const user = userEvent.setup()
    renderForm()

    const input = screen.getByLabelText(/new task/i)
    await user.type(input, '   ')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(input).toHaveValue('   ')
  })

  it('preserves draft description after failed create', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Server error',
          },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const user = userEvent.setup()
    renderForm()

    const input = screen.getByLabelText(/new task/i)
    await user.type(input, 'My task')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/server error/i),
    )
    expect(input).toHaveValue('My task')
  })
})
