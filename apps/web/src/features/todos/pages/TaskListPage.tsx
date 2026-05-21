import { EmptyState } from '../../../components/ui/EmptyState.js'
import { ErrorBanner } from '../../../components/ui/ErrorBanner.js'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner.js'
import { AddTaskForm } from '../AddTaskForm.js'
import { TaskList } from '../TaskList.js'
import { useTodos } from '../hooks/use-todos.js'

export function TaskListPage() {
  const { data, isPending, isError, error, isSuccess, refetch } = useTodos()
  const todos = data ?? []

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
        <p className="mt-1 text-sm text-slate-600">
          Capture todos without friction.
        </p>
      </header>

      <section className="mb-8">
        <AddTaskForm />
      </section>

      <section>
        {isPending && todos.length === 0 && <LoadingSpinner />}

        {isError && (
          <ErrorBanner
            message={
              error instanceof Error
                ? error.message
                : 'Could not load tasks. Please try again.'
            }
            onRetry={() => refetch()}
          />
        )}

        {isSuccess && todos.length === 0 && <EmptyState />}

        {todos.length > 0 && <TaskList todos={todos} />}
      </section>
    </main>
  )
}
