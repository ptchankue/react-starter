import { Suspense, use, useState, useTransition } from 'react'
import { fetchFlaky, fetchUser, fetchUsers, type User } from '../api/fakeApi'
import { Demo, PageHeader } from '../components/Demo'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Spinner } from '../components/Spinner'
import { useFetch } from '../hooks/useFetch'

// ---- 1. Effect-based fetching ---------------------------------------------
function UserBrowser() {
  const [selected, setSelected] = useState(1)
  const users = useFetch((signal) => fetchUsers(signal), [])
  // Clicking quickly aborts stale requests, so a slow old response never wins.
  const user = useFetch((signal) => fetchUser(selected, signal), [selected])

  if (users.status === 'loading') return <Spinner label="Loading users…" />
  if (users.status === 'error') return <div className="alert error">{users.error.message}</div>

  return (
    <div className="split">
      <ul className="list selectable">
        {users.data.map((u) => (
          <li key={u.id}>
            <button className={u.id === selected ? 'primary' : ''} onClick={() => setSelected(u.id)}>
              {u.name}
            </button>
          </li>
        ))}
      </ul>
      <div className="card">
        {user.status === 'loading' && <Spinner />}
        {user.status === 'error' && <p>{user.error.message}</p>}
        {user.status === 'success' && <UserDetails user={user.data} />}
      </div>
    </div>
  )
}

function UserDetails({ user }: { user: User }) {
  return (
    <dl className="details">
      <dt>Name</dt>
      <dd>{user.name}</dd>
      <dt>Role</dt>
      <dd>{user.role}</dd>
      <dt>City</dt>
      <dd>{user.city}</dd>
    </dl>
  )
}

// ---- 2. Suspense + use(promise) ---------------------------------------------
// Promises must be cached (created outside render), otherwise every render
// would create a new promise and suspend forever.
const userCache = new Map<number, Promise<User>>()
function getUser(id: number) {
  if (!userCache.has(id)) userCache.set(id, fetchUser(id))
  return userCache.get(id)!
}

function SuspendingUser({ id }: { id: number }) {
  const user = use(getUser(id)) // suspends until the promise resolves
  return <UserDetails user={user} />
}

function SuspenseDemo() {
  const [id, setId] = useState(1)
  const [version, setVersion] = useState(0)
  const [isPending, startTransition] = useTransition()

  const go = (next: number) => {
    // In a transition React keeps showing the old content (dimmed) instead of the fallback.
    startTransition(() => setId(next))
  }

  return (
    <div className="stack">
      <div className="row">
        {[1, 2, 3, 4, 5, 99].map((n) => (
          <button key={n} className={n === id ? 'primary' : ''} onClick={() => go(n)}>
            {n === 99 ? 'Missing user' : `User ${n}`}
          </button>
        ))}
        <button
          onClick={() => {
            userCache.clear()
            setVersion((v) => v + 1) // remount: the next read suspends again
          }}
        >
          Clear cache
        </button>
      </div>
      <div className={`card ${isPending ? 'pending' : ''}`}>
        <ErrorBoundary resetKeys={[id]}>
          <Suspense fallback={<Spinner label="Suspended…" />}><SuspendingUser key={version} id={id} /></Suspense>
        </ErrorBoundary>
      </div>
      <p className="muted">Visited users load instantly from the cache. Others dim the old content while loading.</p>
    </div>
  )
}

// ---- 3. Error boundary with retry -------------------------------------------
function FlakyResult({ promise }: { promise: Promise<string> }) {
  return <div className="alert success">{use(promise)}</div>
}

function FlakyDemo() {
  const [promise, setPromise] = useState(() => fetchFlaky())
  const retry = () => setPromise(fetchFlaky())
  return (
    <ErrorBoundary
      resetKeys={[promise]}
      fallback={(error) => (
        <div className="alert error" role="alert">
          {error.message}
          <button onClick={retry}>Retry</button>
        </div>
      )}
    >
      <Suspense fallback={<Spinner label="Calling a flaky server…" />}>
        <FlakyResult promise={promise} />
        <button onClick={retry}>Call again</button>
      </Suspense>
    </ErrorBoundary>
  )
}

// ---- 4. Crash on purpose ------------------------------------------------------
function Bomb(): never {
  throw new Error('💥 This component threw during render')
}
function CrashDemo() {
  const [boom, setBoom] = useState(false)
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="alert error" role="alert">
          {error.message}
          <button
            onClick={() => {
              setBoom(false)
              reset()
            }}
          >
            Recover
          </button>
        </div>
      )}
    >
      {boom ? <Bomb /> : <button onClick={() => setBoom(true)}>Throw an error</button>}
    </ErrorBoundary>
  )
}

export default function DataFetching() {
  return (
    <>
      <PageHeader title="Data & Suspense">
        Loading states, race conditions, Suspense and error boundaries. Data comes from an in-memory fake API (
        <code>src/api/fakeApi.ts</code>).
      </PageHeader>

      <Demo title="Fetching in an effect" apis={['useEffect', 'AbortController', 'custom hook']}>
        <UserBrowser />
      </Demo>

      <Demo title="Suspense + use()" apis={['Suspense', 'use(promise)', 'useTransition']}>
        <SuspenseDemo />
      </Demo>

      <Demo title="Error boundary + retry" apis={['ErrorBoundary', 'use(promise)']} description="This endpoint fails half the time.">
        <FlakyDemo />
      </Demo>

      <Demo title="Contain a crash" apis={['getDerivedStateFromError', 'componentDidCatch']}>
        <CrashDemo />
      </Demo>
    </>
  )
}
