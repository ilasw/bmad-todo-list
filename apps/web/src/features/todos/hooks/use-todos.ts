import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateTodoInput, Todo } from '@todo-list/shared'
import { createTodo, fetchTodos } from '../../../api/todos.js'

export const TODOS_QUERY_KEY = ['todos'] as const

export function useTodos() {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: fetchTodos,
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY })

      const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY)

      const optimisticTodo: Todo = {
        id: crypto.randomUUID(),
        description: input.description.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        tagIds: [],
      }

      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old = []) => [
        ...old,
        optimisticTodo,
      ])

      return { previousTodos, optimisticId: optimisticTodo.id }
    },
    onError: (_error, _input, context) => {
      if (context?.previousTodos !== undefined) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos)
      }
    },
    onSuccess: (createdTodo, _input, context) => {
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old = []) =>
        old.map((todo) =>
          todo.id === context?.optimisticId ? createdTodo : todo,
        ),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })
    },
  })
}
