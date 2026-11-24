import {
  Children,
  createContext,
  use,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { Demo, PageHeader } from '../components/Demo'
import { Modal } from '../components/Modal'

// ---- Portal -----------------------------------------------------------------
function PortalDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="clip-box">
      <p className="muted">This box has overflow: hidden, yet the modal escapes it.</p>
      <button className="primary" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Hello from a portal">
        <p>
          I'm rendered into <code>document.body</code>, but I'm still a child of <code>PortalDemo</code> in the React tree.
          Press <kbd>Esc</kbd> or click outside to close.
        </p>
        <button onClick={() => setOpen(false)}>Got it</button>
      </Modal>
    </div>
  )
}

// ---- Compound components ------------------------------------------------------
const AccordionContext = createContext<{ open: string | null; toggle: (id: string) => void } | null>(null)
const ItemContext = createContext('')

function Accordion({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<string | null>(null)
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id))
  return (
    <AccordionContext value={{ open, toggle }}>
      <div className="accordion">{children}</div>
    </AccordionContext>
  )
}
function AccordionItem({ id, children }: { id: string; children: ReactNode }) {
  return (
    <ItemContext value={id}>
      <div className="accordion-item">{children}</div>
    </ItemContext>
  )
}
function AccordionHeader({ children }: { children: ReactNode }) {
  const ctx = use(AccordionContext)!
  const id = use(ItemContext)
  const isOpen = ctx.open === id
  return (
    <button className="accordion-header" aria-expanded={isOpen} onClick={() => ctx.toggle(id)}>
      {children} <span aria-hidden>{isOpen ? '▾' : '▸'}</span>
    </button>
  )
}
function AccordionPanel({ children }: { children: ReactNode }) {
  const ctx = use(AccordionContext)!
  const id = use(ItemContext)
  return ctx.open === id ? <div className="accordion-panel">{children}</div> : null
}
// Attach the parts to the parent for a nice `<Accordion.Item>` API.
Accordion.Item = AccordionItem
Accordion.Header = AccordionHeader
Accordion.Panel = AccordionPanel

// ---- Render props -----------------------------------------------------------
function MouseTracker({ render }: { render: (pos: { x: number; y: number }) => ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  return (
    <div
      className="tracker"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setPos({ x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) })
      }}
    >
      {render(pos)}
    </div>
  )
}

// ---- Higher-order component ---------------------------------------------------
function withBorder<P extends object>(Wrapped: ComponentType<P>, color: string) {
  function WithBorder(props: P) {
    return (
      <div style={{ border: `2px dashed ${color}`, padding: 8, borderRadius: 8 }}>
        <Wrapped {...props} />
      </div>
    )
  }
  WithBorder.displayName = `withBorder(${Wrapped.displayName ?? Wrapped.name})`
  return WithBorder
}
function Greeting({ name }: { name: string }) {
  return <p>Hi {name}, I was wrapped by a HOC.</p>
}
const BorderedGreeting = withBorder(Greeting, 'var(--accent)')

// ---- Children utilities / slots ----------------------------------------------
function Stepper({ children }: { children: ReactNode }) {
  const steps = Children.toArray(children)
  const [i, setI] = useState(0)
  return (
    <div className="stack">
      <div className="progress" aria-label={`Step ${i + 1} of ${steps.length}`}>
        <div style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
      </div>
      <div className="card">{steps[i]}</div>
      <div className="row">
        <button disabled={i === 0} onClick={() => setI(i - 1)}>
          Back
        </button>
        <button className="primary" disabled={i === steps.length - 1} onClick={() => setI(i + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}

// ---- Lifting state up ------------------------------------------------------
function TemperatureInput({ scale, value, onChange }: { scale: 'C' | 'F'; value: string; onChange: (v: string) => void }) {
  return (
    <label>
      °{scale} <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
function TemperatureConverter() {
  // The shared state lives in the closest common parent.
  const [temp, setTemp] = useState({ value: '20', scale: 'C' as 'C' | 'F' })
  const n = parseFloat(temp.value)
  const convert = (to: 'C' | 'F') => {
    if (temp.scale === to || Number.isNaN(n)) return temp.value
    return (to === 'F' ? (n * 9) / 5 + 32 : ((n - 32) * 5) / 9).toFixed(1)
  }
  return (
    <div className="row">
      <TemperatureInput scale="C" value={convert('C')} onChange={(value) => setTemp({ value, scale: 'C' })} />
      <TemperatureInput scale="F" value={convert('F')} onChange={(value) => setTemp({ value, scale: 'F' })} />
      {!Number.isNaN(n) && <span>{parseFloat(convert('C')) >= 100 ? '♨️ Boiling' : '💧 Not boiling'}</span>}
    </div>
  )
}

export default function Patterns() {
  return (
    <>
      <PageHeader title="Patterns">Common ways to structure and reuse components.</PageHeader>

      <Demo title="Portal" apis={['createPortal']}>
        <PortalDemo />
      </Demo>

      <Demo title="Compound components" apis={['Context', 'Accordion.Item']} description="Parts share implicit state through context.">
        <Accordion>
          <Accordion.Item id="what">
            <Accordion.Header>What is React?</Accordion.Header>
            <Accordion.Panel>A JavaScript library for building user interfaces from components.</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item id="native">
            <Accordion.Header>Can I build mobile apps?</Accordion.Header>
            <Accordion.Panel>Yes, with React Native. See the Expo app in the mobile folder.</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item id="hooks">
            <Accordion.Header>Do I still need classes?</Accordion.Header>
            <Accordion.Panel>Only for error boundaries. Everything else works with function components and hooks.</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Demo>

      <Demo title="Render props" apis={['render={fn}']} description="Move your pointer or finger over the box.">
        <MouseTracker
          render={({ x, y }) => (
            <>
              <span className="dot" style={{ transform: `translate(${x - 8}px, ${y - 8}px)` }} />
              <code>
                {x}, {y}
              </code>
            </>
          )}
        />
      </Demo>

      <Demo title="Higher-order component" apis={['withBorder(Component)']}>
        <BorderedGreeting name="Ada" />
      </Demo>

      <Demo title="Children API" apis={['Children.toArray']} description="Each child becomes a step of the wizard.">
        <Stepper>
          <p>1️⃣ Install Node.js</p>
          <p>2️⃣ Run npm install</p>
          <p>3️⃣ Run npm run dev</p>
          <p>🎉 You're shipping React!</p>
        </Stepper>
      </Demo>

      <Demo title="Lifting state up" apis={['shared state in parent']}>
        <TemperatureConverter />
      </Demo>
    </>
  )
}
