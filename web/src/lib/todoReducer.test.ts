import { describe, expect, it } from 'vitest'
import { todoReducer, type Todo } from './todoReducer'

const base: Todo[] = [
  { id: '1', text: 'a', done: false },
  { id: '2', text: 'b', done: true },
]

describe('todoReducer', () => {
  it('adds a todo without mutating state', () => {
    const next = todoReducer(base, { type: 'add', text: 'c' })
    expect(next).toHaveLength(3)
    expect(next[2]).toMatchObject({ text: 'c', done: false })
    expect(base).toHaveLength(2)
  })

  it('toggles, removes and clears done todos', () => {
    expect(todoReducer(base, { type: 'toggle', id: '1' })[0].done).toBe(true)
    expect(todoReducer(base, { type: 'remove', id: '1' })).toEqual([base[1]])
    expect(todoReducer(base, { type: 'clearDone' })).toEqual([base[0]])
  })
})
