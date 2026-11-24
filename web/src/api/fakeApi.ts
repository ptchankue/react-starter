// A tiny in-memory "backend" with artificial latency, so the demos work offline
// and are deterministic in tests.

export interface User {
  id: number
  name: string
  role: string
  city: string
}

export interface Product {
  id: number
  name: string
  price: number
  category: string
}

const users: User[] = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer', city: 'London' },
  { id: 2, name: 'Alan Turing', role: 'Researcher', city: 'Manchester' },
  { id: 3, name: 'Grace Hopper', role: 'Admiral', city: 'New York' },
  { id: 4, name: 'Linus Torvalds', role: 'Maintainer', city: 'Portland' },
  { id: 5, name: 'Margaret Hamilton', role: 'Director', city: 'Boston' },
]

const categories = ['Books', 'Games', 'Music', 'Tools', 'Garden']
export const products: Product[] = Array.from({ length: 5000 }, (_, i) => ({
  id: i + 1,
  name: `Product #${i + 1}`,
  price: Math.round(((i * 7919) % 10000) / 10) / 10 + 1,
  category: categories[i % categories.length],
}))

export let latency = 600
export function setLatency(ms: number) {
  latency = ms
}

function delay<T>(value: T, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => resolve(value), latency)
    signal?.addEventListener('abort', () => {
      clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

export function fetchUsers(signal?: AbortSignal) {
  return delay(users, signal)
}

export async function fetchUser(id: number, signal?: AbortSignal) {
  const user = await delay(users.find((u) => u.id === id), signal)
  if (!user) throw new Error(`User ${id} not found`)
  return user
}

export async function fetchFlaky(signal?: AbortSignal) {
  await delay(null, signal)
  if (Math.random() < 0.5) throw new Error('The server is having a bad day (50% failure rate)')
  return 'Success! The flaky request worked this time.'
}

export async function saveName(name: string) {
  await delay(null)
  if (name.trim().toLowerCase() === 'error') throw new Error('"error" is not a valid name')
  return name.trim()
}
