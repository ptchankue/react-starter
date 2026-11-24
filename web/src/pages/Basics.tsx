import { useState, type MouseEvent, type ReactNode } from 'react'
import { Demo, PageHeader } from '../components/Demo'

// ---- Props & children -------------------------------------------------------
interface BadgeProps {
  tone?: 'info' | 'success' | 'warning'
  children: ReactNode
}
function Badge({ tone = 'info', children }: BadgeProps) {
  return <span className={`badge ${tone}`}>{children}</span>
}

interface ProfileProps {
  name: string
  role: string
  online: boolean
  footer?: ReactNode
}
function ProfileCard({ name, role, online, footer }: ProfileProps) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
  return (
    <div className="profile">
      <div className="avatar">{initials}</div>
      <div>
        <strong>{name}</strong>
        <div className="muted">{role}</div>
        {/* Conditional rendering with a ternary */}
        <Badge tone={online ? 'success' : 'warning'}>{online ? 'Online' : 'Away'}</Badge>
      </div>
      {/* Conditional rendering with && */}
      {footer && <div className="profile-footer">{footer}</div>}
    </div>
  )
}

// ---- Lists & keys -----------------------------------------------------------
const initialFruits = [
  { id: 1, name: 'Apple', emoji: '🍎' },
  { id: 2, name: 'Banana', emoji: '🍌' },
  { id: 3, name: 'Cherry', emoji: '🍒' },
]

function FruitList() {
  const [fruits, setFruits] = useState(initialFruits)
  const [nextId, setNextId] = useState(4)
  const extra = ['🥝 Kiwi', '🍇 Grape', '🍉 Melon', '🍑 Peach', '🍍 Pineapple']

  const add = () => {
    const [emoji, name] = extra[(nextId - 4) % extra.length].split(' ')
    // Immutable update: create a new array rather than pushing.
    setFruits((f) => [{ id: nextId, name, emoji }, ...f])
    setNextId((n) => n + 1)
  }
  const remove = (id: number) => setFruits((f) => f.filter((x) => x.id !== id))
  const shuffle = () => setFruits((f) => [...f].sort(() => Math.random() - 0.5))

  return (
    <>
      <div className="row">
        <button onClick={add}>Add</button>
        <button onClick={shuffle}>Shuffle</button>
      </div>
      {fruits.length === 0 ? (
        <p className="muted">The basket is empty.</p>
      ) : (
        <ul className="list">
          {fruits.map((fruit) => (
            // A stable, unique `key` lets React keep each item's state & DOM when reordering.
            <li key={fruit.id}>
              <span>
                {fruit.emoji} {fruit.name}
              </span>
              <input aria-label={`Note for ${fruit.name}`} placeholder="type, then shuffle" />
              <button className="icon-btn" onClick={() => remove(fruit.id)} aria-label={`Remove ${fruit.name}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// ---- Events -----------------------------------------------------------------
function EventsDemo() {
  const [log, setLog] = useState<string[]>([])
  const push = (msg: string) => setLog((l) => [msg, ...l].slice(0, 5))

  const handleClick = (e: MouseEvent<HTMLButtonElement>) =>
    push(`click at (${Math.round(e.clientX)}, ${Math.round(e.clientY)}) ${e.shiftKey ? '+shift' : ''}`)

  return (
    <>
      <div className="row" onClick={() => push('…bubbled up to the parent div')}>
        <button onClick={handleClick}>Click me (bubbles)</button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            push('stopPropagation(): parent not notified')
          }}
        >
          Stop propagation
        </button>
        <input placeholder="Press a key" onKeyDown={(e) => push(`keydown: ${e.key}`)} />
      </div>
      <ol className="log">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ol>
    </>
  )
}

// ---- JSX expressions --------------------------------------------------------
const today = new Date().toLocaleDateString(undefined, { weekday: 'long' })

function JsxDemo() {
  const user = { first: 'Ada', last: 'Lovelace' }
  const style = { color: 'var(--accent)', fontWeight: 700 }
  return (
    <p>
      Hello, <span style={style}>{`${user.first} ${user.last}`}</span>! 2 + 2 = {2 + 2}. Today is{' '}
      {today}.{' '}
      {/* null, undefined, false and true render nothing */}
      {false}
      {null}
    </p>
  )
}

export default function Basics() {
  return (
    <>
      <PageHeader title="Basics">The building blocks: components are functions that turn data into UI.</PageHeader>

      <Demo title="JSX" apis={['{expressions}', 'style', 'className']}>
        <JsxDemo />
      </Demo>

      <Demo
        title="Props, children & conditional rendering"
        apis={['props', 'children', 'default props', '&&', '? :']}
        description="Components are configured with props. `children` (and any prop) can hold JSX."
      >
        <div className="stack">
          <ProfileCard name="Ada Lovelace" role="Engineer" online />
          <ProfileCard
            name="Alan Turing"
            role="Researcher"
            online={false}
            footer={<Badge>Passing JSX as a prop</Badge>}
          />
        </div>
      </Demo>

      <Demo
        title="Lists & keys"
        apis={['Array.map', 'key']}
        description="Type a note next to an item, then shuffle — the note follows its item because each row has a stable key."
      >
        <FruitList />
      </Demo>

      <Demo title="Events" apis={['onClick', 'onKeyDown', 'stopPropagation']}>
        <EventsDemo />
      </Demo>
    </>
  )
}
