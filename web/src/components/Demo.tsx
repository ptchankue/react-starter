import type { ReactNode } from 'react'

interface DemoProps {
  title: string
  /** Hooks / APIs this demo shows, rendered as tags. */
  apis?: string[]
  description?: ReactNode
  children: ReactNode
}

/** A card wrapping one live example. Demonstrates composition via `children`. */
export function Demo({ title, apis = [], description, children }: DemoProps) {
  return (
    <section className="demo">
      <header>
        <h3>{title}</h3>
        {apis.length > 0 && (
          <ul className="tags" aria-label="APIs used">
            {apis.map((api) => (
              <li key={api}>
                <code>{api}</code>
              </li>
            ))}
          </ul>
        )}
      </header>
      {description && <p className="muted">{description}</p>}
      <div className="demo-body">{children}</div>
    </section>
  )
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {children && <p className="lead">{children}</p>}
    </div>
  )
}
