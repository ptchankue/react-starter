import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router'
import { useEffect, useState } from 'react'
import { fetchUsers, type User } from '../api/fakeApi'
import { Demo, PageHeader } from '../components/Demo'

function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    const c = new AbortController()
    fetchUsers(c.signal).then(setUsers, () => {})
    return () => c.abort()
  }, [])
  return users
}

function UserList() {
  const users = useUsers()
  // Search params: state stored in the URL (shareable, survives refresh).
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const sort = params.get('sort') ?? 'name'

  const visible = users
    .filter((u) => u.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => String(a[sort as keyof User]).localeCompare(String(b[sort as keyof User])))

  const update = (key: string, value: string) =>
    setParams((p) => {
      if (value) p.set(key, value)
      else p.delete(key)
      return p
    }, { replace: true })

  return (
    <div className="stack">
      <div className="row">
        <input value={q} onChange={(e) => update('q', e.target.value)} placeholder="Filter (saved in ?q=)" aria-label="Filter users" />
        <select value={sort} onChange={(e) => update('sort', e.target.value)} aria-label="Sort by">
          <option value="name">Sort by name</option>
          <option value="city">Sort by city</option>
          <option value="role">Sort by role</option>
        </select>
      </div>
      {users.length === 0 && <p className="muted">Loading…</p>}
      <ul className="list">
        {visible.map((u) => (
          <li key={u.id}>
            <Link to={`${u.id}`}>{u.name}</Link>
            <span className="muted">{u.city}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function UserPage() {
  // URL params: /routing/users/:userId
  const { userId } = useParams()
  const navigate = useNavigate()
  const users = useUsers()
  const user = users.find((u) => u.id === Number(userId))

  if (users.length === 0) return <p className="muted">Loading…</p>
  if (!user) return <p>No user with id {userId}.</p>

  const next = users[(users.indexOf(user) + 1) % users.length]
  return (
    <div className="stack">
      <h4>{user.name}</h4>
      <p>
        {user.role} from {user.city}
      </p>
      <div className="row">
        <button onClick={() => navigate(-1)}>← Back</button>
        <button onClick={() => navigate(`../${next.id}`, { relative: 'path' })}>Next user →</button>
      </div>
    </div>
  )
}

function Settings() {
  const navigate = useNavigate()
  return (
    <div className="stack">
      <p>Programmatic navigation after an action (e.g. after saving a form):</p>
      <button className="primary" onClick={() => navigate('/routing/users', { state: { from: 'settings' } })}>
        Save & go to users
      </button>
    </div>
  )
}

export default function Routing() {
  return (
    <>
      <PageHeader title="Routing">Client-side routing with React Router: nested routes, params and URL state.</PageHeader>

      <Demo
        title="Nested routes"
        apis={['<Routes>', 'useParams', 'useSearchParams', 'useNavigate', '<Navigate>']}
        description="This page has its own sub-routes. Watch the address bar as you click around."
      >
        <nav className="tabs">
          <NavLink to="users">Users</NavLink>
          <NavLink to="settings">Settings</NavLink>
          <NavLink to="does-not-exist">Broken link</NavLink>
        </nav>
        <div className="card">
          <Routes>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/:userId" element={<UserPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<p>Nested 404 — this route does not exist inside /routing.</p>} />
          </Routes>
        </div>
      </Demo>
    </>
  )
}
