import { createTodoSchema } from '@todo-list/shared'
import { useState, type FormEvent } from 'react'
import { useUiStore } from '../../stores/ui-store.js'
import { useCreateTodo } from './hooks/use-todos.js'

function getValidationMessage(description: string): string | null {
  const result = createTodoSchema.safeParse({ description })
  if (result.success) {
    return null
  }
  const issue = result.error.issues[0]
  if (issue?.code === 'too_small') {
    return 'Description cannot be empty.'
  }
  if (issue?.code === 'too_big') {
    return 'Description must be 2500 characters or fewer.'
  }
  return issue?.message ?? 'Invalid description.'
}

export function AddTaskForm() {
  const draftDescription = useUiStore((s) => s.draftDescription)
  const setDraftDescription = useUiStore((s) => s.setDraftDescription)
  const clearDraftDescription = useUiStore((s) => s.clearDraftDescription)
  const createTodoMutation = useCreateTodo()
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  )
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const message = getValidationMessage(draftDescription)
    if (message) {
      setValidationMessage(message)
      return
    }

    setValidationMessage(null)

    createTodoMutation.mutate(
      { description: draftDescription },
      {
        onSuccess: () => {
          clearDraftDescription()
        },
        onError: (error) => {
          setDraftDescription(draftDescription)
          setSubmitError(
            error instanceof Error
              ? error.message
              : 'Failed to create task. Please try again.',
          )
        },
      },
    )
  }

  const displayError = validationMessage ?? submitError

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
      <label htmlFor="task-description" className="text-sm font-medium text-slate-700">
        New task
      </label>
      <div className="flex gap-2">
        <input
          id="task-description"
          type="text"
          value={draftDescription}
          onChange={(event) => {
            setDraftDescription(event.target.value)
            if (validationMessage) {
              setValidationMessage(null)
            }
            if (submitError) {
              setSubmitError(null)
            }
          }}
          placeholder="What needs to be done?"
          maxLength={2500}
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          aria-invalid={displayError ? true : undefined}
          aria-describedby={displayError ? 'task-description-error' : undefined}
        />
        <button
          type="submit"
          disabled={createTodoMutation.isPending}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createTodoMutation.isPending ? 'Adding…' : 'Add'}
        </button>
      </div>
      {displayError && (
        <p id="task-description-error" className="text-sm text-red-700" role="alert">
          {displayError}
        </p>
      )}
    </form>
  )
}
