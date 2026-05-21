import type { Todo } from '@todo-list/shared'
import { useState } from 'react'
import { useToggleTodo } from './hooks/use-todos.js'

interface TaskItemProps {
  todo: Todo
}

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function TaskItem({ todo }: TaskItemProps) {
  const toggleTodoMutation = useToggleTodo()
  const [toggleError, setToggleError] = useState<string | null>(null)
  const isPending =
    toggleTodoMutation.isPending &&
    toggleTodoMutation.variables?.id === todo.id

  const handleToggle = () => {
    setToggleError(null)
    toggleTodoMutation.mutate(
      { id: todo.id, completed: !todo.completed },
      {
        onError: (error) => {
          setToggleError(
            error instanceof Error
              ? error.message
              : 'Failed to update task. Please try again.',
          )
        },
      },
    )
  }

  return (
    <li
      className={`flex gap-3 rounded-lg border px-4 py-3 shadow-sm ${
        todo.completed
          ? 'border-slate-200 bg-slate-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        disabled={isPending}
        aria-label={`Mark "${todo.description}" ${todo.completed ? 'active' : 'complete'}`}
        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`break-words ${
            todo.completed
              ? 'text-slate-500 line-through decoration-slate-400'
              : 'text-slate-900'
          }`}
        >
          {todo.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <time dateTime={todo.createdAt}>{formatCreatedAt(todo.createdAt)}</time>
          {todo.tagIds.length > 0 ? (
            <span className="rounded bg-slate-100 px-2 py-0.5">
              {todo.tagIds.length} tag{todo.tagIds.length === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
        {toggleError ? (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {toggleError}
          </p>
        ) : null}
      </div>
    </li>
  )
}
