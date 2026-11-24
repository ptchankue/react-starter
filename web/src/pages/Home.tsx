import { version } from 'react'
import { Link } from 'react-router'
import { navItems } from '../routes'

const blurbs: Record<string, string> = {
  '/basics': 'JSX, props, children, conditional rendering, lists & keys, events.',
  '/hooks': 'useState, useEffect, useRef, useReducer, useId, useLayoutEffect, useImperativeHandle.',
  '/context': 'Context providers, the use() hook, and a shopping cart with useReducer.',
  '/forms': 'Controlled & uncontrolled inputs, form actions, useActionState, useFormStatus, useOptimistic.',
  '/data': 'Effects with AbortController, Suspense + use(), error boundaries, retry.',
  '/performance': 'memo, useMemo, useCallback, useTransition, useDeferredValue, lazy loading.',
  '/patterns': 'Portals, compound components, render props, HOCs, custom hooks.',
  '/routing': 'Nested routes, URL params, search params, programmatic navigation.',
  '/mobile': 'Installable PWA, offline mode, touch gestures, geolocation, vibration, share.',
}

export default function Home() {
  return (
    <>
      <div className="hero">
        <h1>
          React <span className="accent">{version}</span> Showcase
        </h1>
        <p className="lead">
          Every page is a set of live, editable examples of one area of React. Open the source in{' '}
          <code>src/pages</code> next to the running app. A React Native version lives in{' '}
          <code>../mobile</code>.
        </p>
      </div>
      <div className="grid">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className="card link-card">
            <span className="card-icon" aria-hidden>
              {item.icon}
            </span>
            <h2>{item.label}</h2>
            <p className="muted">{blurbs[item.to]}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
