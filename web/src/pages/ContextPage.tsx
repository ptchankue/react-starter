import { createContext, use, useMemo, useReducer, useState, type Dispatch, type ReactNode } from 'react'
import { Demo, PageHeader } from '../components/Demo'
import { useTheme } from '../context/ThemeContext'

// ---- A cart store: Context + useReducer ------------------------------------
interface CartItem {
  id: number
  name: string
  price: number
  qty: number
}
type CartAction =
  | { type: 'add'; item: Omit<CartItem, 'qty'> }
  | { type: 'decrement'; id: number }
  | { type: 'clear' }

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = state.find((i) => i.id === action.item.id)
      return existing
        ? state.map((i) => (i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...state, { ...action.item, qty: 1 }]
    }
    case 'decrement':
      return state.flatMap((i) => (i.id !== action.id ? [i] : i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []))
    case 'clear':
      return []
  }
}

// Split state and dispatch into two contexts so components that only
// dispatch never re-render when the cart changes.
const CartStateContext = createContext<CartItem[]>([])
const CartDispatchContext = createContext<Dispatch<CartAction>>(() => {})

function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, [])
  return (
    <CartStateContext value={items}>
      <CartDispatchContext value={dispatch}>{children}</CartDispatchContext>
    </CartStateContext>
  )
}

const catalog = [
  { id: 1, name: '☕ Coffee', price: 3.5 },
  { id: 2, name: '🥐 Croissant', price: 2.2 },
  { id: 3, name: '🧃 Juice', price: 4 },
]

function Catalog() {
  const dispatch = use(CartDispatchContext)
  return (
    <ul className="list">
      {catalog.map((p) => (
        <li key={p.id}>
          <span>
            {p.name} <span className="muted">${p.price.toFixed(2)}</span>
          </span>
          <button onClick={() => dispatch({ type: 'add', item: p })}>Add to cart</button>
        </li>
      ))}
    </ul>
  )
}

function CartBadge() {
  const items = use(CartStateContext)
  const count = items.reduce((n, i) => n + i.qty, 0)
  return <span className="badge info">🛒 {count}</span>
}

function CartSummary() {
  const items = use(CartStateContext)
  const dispatch = use(CartDispatchContext)
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])
  if (items.length === 0) return <p className="muted">Your cart is empty.</p>
  return (
    <div className="stack">
      <ul className="list">
        {items.map((i) => (
          <li key={i.id}>
            <span>
              {i.name} × {i.qty}
            </span>
            <button onClick={() => dispatch({ type: 'decrement', id: i.id })}>−</button>
          </li>
        ))}
      </ul>
      <div className="row space-between">
        <strong>Total: ${total.toFixed(2)}</strong>
        <button onClick={() => dispatch({ type: 'clear' })}>Clear</button>
      </div>
    </div>
  )
}

// ---- Theme context consumer --------------------------------------------------
function ThemeReadout() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="row">
      Current theme: <strong>{theme}</strong>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle from deep in the tree</button>
    </div>
  )
}

// ---- Conditional `use` -----------------------------------------------------
const GreetingContext = createContext('Hello')
function MaybeGreeting({ show }: { show: boolean }) {
  if (!show) return <p className="muted">Hidden — the context was never read.</p>
  // Unlike useContext, `use` may be called after an early return or inside conditions.
  const greeting = use(GreetingContext)
  return <p>{greeting}, world!</p>
}

export default function ContextPage() {
  const [show, setShow] = useState(true)
  const [lang, setLang] = useState('Hello')
  return (
    <>
      <PageHeader title="Context">Pass data deep into the tree without threading props through every level.</PageHeader>

      <Demo title="App-wide theme" apis={['createContext', 'use', 'Provider']} description="The same context drives the theme switch in the top bar.">
        <ThemeReadout />
      </Demo>

      <Demo
        title="Shopping cart store"
        apis={['Context + useReducer', 'split contexts']}
        description="A tiny global store without any library. The badge, catalog and summary are siblings that never pass props to each other."
      >
        <CartProvider>
          <div className="row space-between">
            <h4>Menu</h4>
            <CartBadge />
          </div>
          <Catalog />
          <h4>Cart</h4>
          <CartSummary />
        </CartProvider>
      </Demo>

      <Demo title="Nested providers & conditional use()" apis={['use', 'nearest provider wins']}>
        <div className="row">
          <label>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> show
          </label>
          <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Greeting">
            <option>Hello</option>
            <option>Bonjour</option>
            <option>Hola</option>
            <option>Hallo</option>
          </select>
        </div>
        <GreetingContext value={lang}>
          <MaybeGreeting show={show} />
          <GreetingContext value="👋 Overridden by an inner provider">
            <MaybeGreeting show={show} />
          </GreetingContext>
        </GreetingContext>
      </Demo>
    </>
  )
}
