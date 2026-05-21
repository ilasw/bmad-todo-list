import type { Todo } from '@todo-list/shared'
import { TaskItem } from './TaskItem.js'

interface TaskListProps {
  todos: Todo[]
}

export function TaskList({ todos }: TaskListProps) {
  return (
    <ul className="flex flex-col gap-3" aria-label="Task list">
      {todos.map((todo) => (
        <TaskItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
