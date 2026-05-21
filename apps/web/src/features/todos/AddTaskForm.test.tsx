import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
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
    useUiStore.setState({
      draftDescription: '',
      setDraftDescription: useUiStore.getState().setDraftDescription,
      clearDraftDescription: useUiStore.getState().clearDraftDescription,
    })
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
})
