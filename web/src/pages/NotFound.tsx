import { Link, useLocation } from 'react-router'

export default function NotFound() {
  const { pathname } = useLocation()
  return (
    <div className="center">
      <h1>404</h1>
      <p>
        No page at <code>{pathname}</code>.
      </p>
      <Link to="/">Back to overview</Link>
    </div>
  )
}
