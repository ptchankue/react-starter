export interface User {
  id: number
  name: string
  role: string
  city: string
  emoji: string
}

export const users: User[] = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer', city: 'London', emoji: '👩‍💻' },
  { id: 2, name: 'Alan Turing', role: 'Researcher', city: 'Manchester', emoji: '🧠' },
  { id: 3, name: 'Grace Hopper', role: 'Admiral', city: 'New York', emoji: '⚓' },
  { id: 4, name: 'Linus Torvalds', role: 'Maintainer', city: 'Portland', emoji: '🐧' },
  { id: 5, name: 'Margaret Hamilton', role: 'Director', city: 'Boston', emoji: '🚀' },
  { id: 6, name: 'Katherine Johnson', role: 'Mathematician', city: 'Hampton', emoji: '📐' },
  { id: 7, name: 'Dennis Ritchie', role: 'Language designer', city: 'Murray Hill', emoji: '🔤' },
  { id: 8, name: 'Barbara Liskov', role: 'Professor', city: 'Cambridge', emoji: '🎓' },
]

/** Fake network call with latency. */
export function fetchUsers(page: number, pageSize = 20): Promise<User[]> {
  return new Promise((resolve) =>
    setTimeout(() => {
      const start = page * pageSize
      resolve(
        Array.from({ length: pageSize }, (_, i) => {
          const base = users[(start + i) % users.length]
          return { ...base, id: start + i + 1 }
        }),
      )
    }, 700),
  )
}
