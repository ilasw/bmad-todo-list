import type { Todo } from '@todo-list/shared'

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
  return (
    <li className="flex gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <input
        type="checkbox"
        checked={todo.completed}
        readOnly
        aria-label={`Mark "${todo.description}" complete`}
        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`break-words text-slate-900 ${todo.completed ? 'line-through text-slate-500' : ''}`}
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
      </div>
    </li>
  )
}
