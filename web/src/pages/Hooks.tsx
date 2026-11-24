import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type Ref,
} from 'react'
import { Demo, PageHeader } from '../components/Demo'
import { useDebounce } from '../hooks/useDebounce'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { todoReducer, type Todo } from '../lib/todoReducer'

// ---- useState ---------------------------------------------------------------
function Counter() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  return (
    <div className="row">
      <button onClick={() => setCount((c) => c - step)} aria-label="decrement">
        −
      </button>
      <output className="big" aria-label="count">
        {count}
      </output>
      <button onClick={() => setCount((c) => c + step)} aria-label="increment">
        +
      </button>
      <label>
        step{' '}
        <input type="number" min={1} value={step} onChange={(e) => setStep(Number(e.target.value) || 1)} />
      </label>
      <button
        onClick={() => {
          // Updater functions see the latest value: this adds 3, not 1.
          setCount((c) => c + 1)
          setCount((c) => c + 1)
          setCount((c) => c + 1)
        }}
      >
        +3 (batched)
      </button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}

// ---- useEffect --------------------------------------------------------------
function Stopwatch() {
  const [running, setRunning] = useState(false)
  const [ms, setMs] = useState(0)

  useEffect(() => {
    if (!running) return
    const start = Date.now() - ms
    const id = setInterval(() => setMs(Date.now() - start), 31)
    return () => clearInterval(id) // cleanup runs before the next effect and on unmount
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- `ms` is only read as the starting point
  }, [running])

  useEffect(() => {
    document.title = running ? `⏱ ${(ms / 1000).toFixed(1)}s` : 'React Showcase'
  }, [running, ms])

  useEffect(() => () => void (document.title = 'React Showcase'), [])

  return (
    <div className="row">
      <output className="big mono">{(ms / 1000).toFixed(2)}s</output>
      <button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Start'}</button>
      <button onClick={() => setMs(0)} disabled={running}>
        Reset
      </button>
      <span className="muted">(watch the tab title)</span>
    </div>
  )
}

function WindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return (
    <p>
      Window: <strong>{size.w}</strong> × <strong>{size.h}</strong> — resize or rotate your phone.
    </p>
  )
}

// ---- useRef -----------------------------------------------------------------
function RefDemo() {
  const inputRef = useRef<HTMLInputElement>(null)
  const clicks = useRef(0) // survives re-renders, but changing it doesn't cause one
  const [text, setText] = useState('')
  const [shown, setShown] = useState<number | null>(null)

  return (
    <div className="stack">
      <div className="row">
        <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type here" />
        <button onClick={() => inputRef.current?.focus()}>Focus input</button>
        <button onClick={() => inputRef.current?.select()}>Select text</button>
      </div>
      <div className="row">
        <button onClick={() => (clicks.current += 1)}>Click (silently counted in a ref)</button>
        <button onClick={() => setShown(clicks.current)}>Read the ref</button>
        {shown !== null && <span>Ref value: {shown}</span>}
      </div>
    </div>
  )
}

// ---- useReducer -------------------------------------------------------------
function TodoApp() {
  const [saved, setSaved] = useLocalStorage<Todo[]>('todos', [
    { id: 'a', text: 'Learn hooks', done: true },
    { id: 'b', text: 'Build something', done: false },
  ])
  // Lazy init from storage, then persist on every change.
  const [todos, dispatch] = useReducer(todoReducer, saved)
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')
  const [text, setText] = useState('')

  useEffect(() => setSaved(todos), [todos, setSaved])

  // Derived state: compute during render instead of storing it.
  const visible = todos.filter((t) => (filter === 'all' ? true : filter === 'done' ? t.done : !t.done))
  const remaining = todos.filter((t) => !t.done).length

  return (
    <div className="stack">
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          dispatch({ type: 'add', text: text.trim() })
          setText('')
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs doing?" aria-label="New todo" />
        <button type="submit">Add</button>
      </form>
      <div className="row" role="group" aria-label="Filter">
        {(['all', 'active', 'done'] as const).map((f) => (
          <button key={f} className={filter === f ? 'primary' : ''} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
        <button onClick={() => dispatch({ type: 'clearDone' })}>Clear done</button>
      </div>
      <ul className="list">
        {visible.map((t) => (
          <li key={t.id}>
            <label className={t.done ? 'done' : ''}>
              <input type="checkbox" checked={t.done} onChange={() => dispatch({ type: 'toggle', id: t.id })} /> {t.text}
            </label>
            <button className="icon-btn" aria-label={`Delete ${t.text}`} onClick={() => dispatch({ type: 'remove', id: t.id })}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      <p className="muted">
        {remaining} item{remaining === 1 ? '' : 's'} left · saved in localStorage
      </p>
    </div>
  )
}

// ---- useId ------------------------------------------------------------------
function LabeledField({ label, hint }: { label: string; hint: string }) {
  const id = useId() // unique, SSR-safe ids for accessibility attributes
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={`${id}-hint`} />
      <small id={`${id}-hint`} className="muted">
        {hint} (id: <code>{id}</code>)
      </small>
    </div>
  )
}

// ---- useLayoutEffect --------------------------------------------------------
function Tooltip({ text, children }: { text: string; children: string }) {
  const [hover, setHover] = useState(false)
  const [above, setAbove] = useState(true)
  const anchorRef = useRef<HTMLSpanElement>(null)

  // Measure before the browser paints, so the tooltip never flickers in the wrong spot.
  useLayoutEffect(() => {
    if (!hover || !anchorRef.current) return
    setAbove(anchorRef.current.getBoundingClientRect().top > 80)
  }, [hover])

  return (
    <span
      ref={anchorRef}
      className="tooltip-anchor"
      tabIndex={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      {children}
      {hover && <span className={`tooltip ${above ? 'above' : 'below'}`}>{text}</span>}
    </span>
  )
}

// ---- useImperativeHandle (+ ref as a prop in React 19) ------------------------
export interface VideoHandle {
  play: () => void
  pause: () => void
  restart: () => void
}

function FancyPlayer({ ref }: { ref: Ref<VideoHandle> }) {
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setFrame((f) => (f + 1) % 8), 120)
    return () => clearInterval(id)
  }, [playing])

  // Expose a small, intentional API instead of the whole DOM node.
  useImperativeHandle(ref, () => ({
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    restart: () => {
      setFrame(0)
      setPlaying(true)
    },
  }))

  const moons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']
  return <div className="player">{moons[frame]}</div>
}

function ImperativeDemo() {
  const playerRef = useRef<VideoHandle>(null)
  return (
    <div className="row">
      <FancyPlayer ref={playerRef} />
      <button onClick={() => playerRef.current?.play()}>Play</button>
      <button onClick={() => playerRef.current?.pause()}>Pause</button>
      <button onClick={() => playerRef.current?.restart()}>Restart</button>
    </div>
  )
}

// ---- Custom hook: useDebounce ----------------------------------------------
function DebounceDemo() {
  const [text, setText] = useState('')
  const debounced = useDebounce(text, 500)
  return (
    <div className="stack">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type quickly…" />
      <p>
        Instant: <code>{text || '—'}</code> · Debounced (500ms): <code>{debounced || '—'}</code>
      </p>
    </div>
  )
}

export default function Hooks() {
  const [showStopwatch, setShowStopwatch] = useState(true)
  return (
    <>
      <PageHeader title="Hooks">Hooks let function components keep state, run side effects and reach the DOM.</PageHeader>

      <Demo title="useState" apis={['useState', 'updater function', 'batching']}>
        <Counter />
      </Demo>

      <Demo
        title="useEffect"
        apis={['useEffect', 'cleanup', 'dependencies']}
        description="Effects sync a component with something outside React: timers, the document, event listeners."
      >
        <label className="row">
          <input type="checkbox" checked={showStopwatch} onChange={(e) => setShowStopwatch(e.target.checked)} />
          Mounted (unmounting runs the cleanup)
        </label>
        {showStopwatch && <Stopwatch />}
        <WindowSize />
      </Demo>

      <Demo title="useRef" apis={['useRef', 'DOM refs', 'mutable values']}>
        <RefDemo />
      </Demo>

      <Demo
        title="useReducer — todo list"
        apis={['useReducer', 'derived state', 'custom hook']}
        description="Move complex update logic into a pure reducer function that is easy to test."
      >
        <TodoApp />
      </Demo>

      <Demo title="useId" apis={['useId']}>
        <div className="stack">
          <LabeledField label="Email" hint="We never share it" />
          <LabeledField label="Phone" hint="Optional" />
        </div>
      </Demo>

      <Demo title="useLayoutEffect" apis={['useLayoutEffect']} description="Hover or focus the words to see a measured tooltip.">
        <p>
          React is a <Tooltip text="Declarative UI library">library</Tooltip> for building{' '}
          <Tooltip text="Reusable pieces of UI">components</Tooltip>.
        </p>
      </Demo>

      <Demo
        title="useImperativeHandle + ref as a prop"
        apis={['useImperativeHandle', 'ref prop (React 19)']}
        description="A parent controls a child through a custom handle. In React 19, `ref` is a normal prop — no forwardRef needed."
      >
        <ImperativeDemo />
      </Demo>

      <Demo title="Custom hook" apis={['useDebounce']}>
        <DebounceDemo />
      </Demo>
    </>
  )
}
