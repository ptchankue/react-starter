// A pure reducer: (state, action) => newState. Easy to unit test.
export interface Todo {
  id: string
  text: string
  done: boolean
}
export type TodoAction =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clearDone' }

export function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'add':
      return [...state, { id: crypto.randomUUID(), text: action.text, done: false }]
    case 'toggle':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
    case 'remove':
      return state.filter((t) => t.id !== action.id)
    case 'clearDone':
      return state.filter((t) => !t.done)
  }
}
