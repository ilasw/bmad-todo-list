import { createBrowserRouter } from 'react-router-dom'
import { TaskListPage } from '../features/todos/pages/TaskListPage.js'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <TaskListPage />,
  },
])
