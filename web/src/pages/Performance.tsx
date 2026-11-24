/* oxlint-disable react/purity, react/refs -- these demos deliberately measure and count renders */
import { memo, Profiler, useCallback, useDeferredValue, useMemo, useRef, useState, useTransition } from 'react'
import { products, type Product } from '../api/fakeApi'
import { Demo, PageHeader } from '../components/Demo'

// ---- memo + useCallback -----------------------------------------------------
// Intentionally reads a ref during render to visualise re-renders (demo only).
function useRenderCount() {
  const count = useRef(0)
  count.current += 1
  return count.current
}

const MemoChild = memo(function MemoChild({ label, onClick }: { label: string; onClick: () => void }) {
  const renders = useRenderCount()
  return (
    <button onClick={onClick}>
      {label} · renders: <strong>{renders}</strong>
    </button>
  )
})

function MemoDemo() {
  const [count, setCount] = useState(0)
  const [, force] = useState(0)

  // Same function identity across renders → memo() can skip re-rendering.
  const stableIncrement = useCallback(() => setCount((c) => c + 1), [])
  // New function every render → memo() is defeated.
  const unstableIncrement = () => setCount((c) => c + 1)

  return (
    <div className="stack">
      <p>
        Count: <strong>{count}</strong>
      </p>
      <div className="row">
        <MemoChild label="memo + useCallback" onClick={stableIncrement} />
        <MemoChild label="memo + inline fn" onClick={unstableIncrement} />
        <button onClick={() => force((n) => n + 1)}>Re-render parent only</button>
      </div>
    </div>
  )
}

// ---- useMemo ----------------------------------------------------------------
function isPrime(n: number) {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
  return true
}

function UseMemoDemo() {
  const [limit, setLimit] = useState(200_000)
  const [dark, setDark] = useState(false)

  const { count, ms } = useMemo(() => {
    const t = performance.now()
    let c = 0
    for (let i = 0; i < limit; i++) if (isPrime(i)) c++
    return { count: c, ms: performance.now() - t }
  }, [limit]) // only recomputed when `limit` changes, not when `dark` toggles

  return (
    <div className={`stack padded ${dark ? 'inverted' : ''}`}>
      <label>
        Primes below {limit.toLocaleString()}
        <input type="range" min={10_000} max={2_000_000} step={10_000} value={limit} onChange={(e) => setLimit(+e.target.value)} />
      </label>
      <p>
        <strong>{count.toLocaleString()}</strong> primes (computed in {ms.toFixed(1)}ms)
      </p>
      <button onClick={() => setDark((d) => !d)}>Toggle colors (doesn't recompute)</button>
    </div>
  )
}

// ---- useTransition vs useDeferredValue ---------------------------------------
const SlowRow = memo(function SlowRow({ product, query }: { product: Product; query: string }) {
  const start = performance.now()
  while (performance.now() - start < 0.05) {
    /* simulate an expensive row */
  }
  const i = product.name.toLowerCase().indexOf(query.toLowerCase())
  return (
    <li>
      <span>
        {query && i >= 0 ? (
          <>
            {product.name.slice(0, i)}
            <mark>{product.name.slice(i, i + query.length)}</mark>
            {product.name.slice(i + query.length)}
          </>
        ) : (
          product.name
        )}
      </span>
      <span className="muted">
        {product.category} · ${product.price.toFixed(2)}
      </span>
    </li>
  )
})

const ProductList = memo(function ProductList({ query }: { query: string }) {
  const filtered = products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 2000)
  return (
    <>
      <p className="muted">{filtered.length} results (max 2000)</p>
      <ul className="list compact scroll">
        {filtered.map((p) => (
          <SlowRow key={p.id} product={p} query={query} />
        ))}
      </ul>
    </>
  )
})

function DeferredSearch() {
  const [query, setQuery] = useState('')
  // The input updates immediately; the heavy list renders with a lagging copy.
  const deferred = useDeferredValue(query)
  const stale = query !== deferred
  return (
    <div className="stack">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter 5,000 products… (try 42 or Books)" aria-label="Search products" />
      <div style={{ opacity: stale ? 0.5 : 1, transition: 'opacity .2s' }}>
        <ProductList query={deferred} />
      </div>
    </div>
  )
}

const tabs = ['About', 'Products (slow)', 'Contact'] as const
function TransitionTabs() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('About')
  const [isPending, startTransition] = useTransition()
  return (
    <div className="stack">
      <div className="row" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? 'primary' : ''}
            // Non-urgent update: the UI stays responsive and the click can be interrupted.
            onClick={() => startTransition(() => setTab(t))}
          >
            {t}
          </button>
        ))}
        {isPending && <span className="muted">rendering…</span>}
      </div>
      {tab === 'About' && <p>Click “Products”, then immediately “Contact”. The slow render gets abandoned.</p>}
      {tab === 'Products (slow)' && <ProductList query="" />}
      {tab === 'Contact' && <p>📮 hello@example.com</p>}
    </div>
  )
}

// ---- Profiler ---------------------------------------------------------------
function ProfilerDemo() {
  const [n, setN] = useState(100)
  const [stats, setStats] = useState('')
  return (
    <div className="stack">
      <Profiler
        id="boxes"
        onRender={(_id, phase, actual) => queueMicrotask(() => setStats(`${phase} took ${actual.toFixed(2)}ms`))}
      >
        <div className="boxes">
          {Array.from({ length: n }, (_, i) => (
            <span key={i} style={{ background: `hsl(${(i * 37) % 360} 70% 60%)` }} />
          ))}
        </div>
      </Profiler>
      <div className="row">
        <button onClick={() => setN((x) => x + 100)}>+100 boxes</button>
        <button onClick={() => setN(100)}>Reset</button>
        <code>{stats}</code>
      </div>
    </div>
  )
}

export default function Performance() {
  return (
    <>
      <PageHeader title="Performance">Skip work you don't need, and keep the UI responsive during work you do.</PageHeader>

      <Demo title="memo + useCallback" apis={['memo', 'useCallback']} description="Watch the render counters.">
        <MemoDemo />
      </Demo>

      <Demo title="useMemo" apis={['useMemo']} description="Cache an expensive calculation between renders.">
        <UseMemoDemo />
      </Demo>

      <Demo title="useDeferredValue" apis={['useDeferredValue', 'memo']} description="Typing stays smooth while a slow list catches up.">
        <DeferredSearch />
      </Demo>

      <Demo title="useTransition" apis={['useTransition', 'isPending']}>
        <TransitionTabs />
      </Demo>

      <Demo title="Profiler" apis={['<Profiler onRender>']}>
        <ProfilerDemo />
      </Demo>

      <Demo title="Code splitting" apis={['lazy', 'Suspense', 'import()']}>
        <p>
          Every page in this app is loaded with <code>React.lazy</code> (see <code>src/routes.ts</code>). Open the network tab
          and navigate — each page is a separate JS chunk downloaded on demand.
        </p>
      </Demo>
    </>
  )
}
