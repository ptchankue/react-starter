import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Demo, PageHeader } from '../components/Demo'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

// ---- PWA install ----------------------------------------------------------
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function InstallApp() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const standalone = useMediaQuery('(display-mode: standalone)')
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault() // keep the event so we can show our own button
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (standalone) return <div className="alert success">✅ Running as an installed app.</div>
  if (deferred)
    return (
      <button
        className="primary"
        onClick={async () => {
          await deferred.prompt()
          await deferred.userChoice
          setDeferred(null)
        }}
      >
        📲 Install this app
      </button>
    )
  return (
    <p className="muted">
      {isIOS
        ? 'On iPhone/iPad: tap Share → “Add to Home Screen”.'
        : 'Install is offered on a production build (npm run build && npm run preview) in Chrome, Edge or Android.'}
    </p>
  )
}

// ---- Swipe gestures with pointer events -----------------------------------
const cards = [
  { emoji: '⚛️', title: 'Components' },
  { emoji: '🪝', title: 'Hooks' },
  { emoji: '⏳', title: 'Suspense' },
  { emoji: '🌐', title: 'Context' },
  { emoji: '📱', title: 'React Native' },
]

function SwipeCards() {
  const [index, setIndex] = useState(0)
  const [dx, setDx] = useState(0)
  const [verdicts, setVerdicts] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const startX = useRef<number | null>(null)

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    if (startX.current !== null) setDx(e.clientX - startX.current)
  }
  const decide = (like: boolean) => {
    navigator.vibrate?.(like ? 20 : [10, 40, 10])
    setVerdicts((v) => [...v, `${like ? '❤️' : '👎'} ${cards[index].title}`])
    setIndex((i) => i + 1)
    setDx(0)
  }
  const onUp = () => {
    startX.current = null
    setDragging(false)
    if (Math.abs(dx) > 100) decide(dx > 0)
    else setDx(0)
  }

  const card = cards[index]
  return (
    <div className="stack">
      <div className="swipe-area">
        {card ? (
          <div
            className="swipe-card"
            style={{
              transform: `translateX(${dx}px) rotate(${dx / 15}deg)`,
              transition: dragging ? 'none' : 'transform .25s',
            }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <span className="swipe-emoji">{card.emoji}</span>
            <strong>{card.title}</strong>
            <span className="swipe-hint">{dx > 40 ? 'LIKE' : dx < -40 ? 'NOPE' : 'swipe me'}</span>
          </div>
        ) : (
          <button
            onClick={() => {
              setIndex(0)
              setVerdicts([])
            }}
          >
            Start over
          </button>
        )}
      </div>
      <div className="row">
        <button disabled={!card} onClick={() => decide(false)}>
          👎
        </button>
        <button disabled={!card} onClick={() => decide(true)}>
          ❤️
        </button>
        <span className="muted">{verdicts.join(' · ')}</span>
      </div>
    </div>
  )
}

// ---- Device APIs ------------------------------------------------------------
function Geolocation() {
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'done' | 'error'; text?: string }>({ status: 'idle' })
  if (!('geolocation' in navigator)) return <p className="muted">Geolocation is not supported.</p>
  return (
    <div className="row">
      <button
        disabled={state.status === 'loading'}
        onClick={() => {
          setState({ status: 'loading' })
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              setState({
                status: 'done',
                text: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (±${Math.round(pos.coords.accuracy)}m)`,
              }),
            (err) => setState({ status: 'error', text: err.message }),
            { timeout: 10_000 },
          )
        }}
      >
        📍 Where am I?
      </button>
      {state.status === 'loading' && <span className="muted">Locating…</span>}
      {state.text && <code>{state.text}</code>}
    </div>
  )
}

function ShareAndVibrate() {
  const [msg, setMsg] = useState('')
  const canShare = typeof navigator.share === 'function'
  const canVibrate = typeof navigator.vibrate === 'function'
  return (
    <div className="stack">
      <div className="row">
        <button
          disabled={!canShare}
          onClick={() =>
            navigator
              .share({ title: 'React Showcase', text: 'A tour of React features', url: location.href })
              .then(() => setMsg('Shared!'))
              .catch((e: Error) => setMsg(e.message))
          }
        >
          🔗 Share
        </button>
        <button disabled={!canVibrate} onClick={() => navigator.vibrate([100, 50, 100, 50, 300])}>
          📳 Vibrate
        </button>
        <button
          onClick={() =>
            navigator.clipboard
              .writeText(location.href)
              .then(() => setMsg('Link copied to clipboard'))
              .catch(() => setMsg('Clipboard unavailable'))
          }
        >
          📋 Copy link
        </button>
      </div>
      {(!canShare || !canVibrate) && (
        <p className="muted">Some buttons are disabled because this browser doesn't support them. Try on a phone.</p>
      )}
      {msg && <p>{msg}</p>}
    </div>
  )
}

function Environment() {
  const online = useOnlineStatus()
  const portrait = useMediaQuery('(orientation: portrait)')
  const touch = useMediaQuery('(pointer: coarse)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const dark = useMediaQuery('(prefers-color-scheme: dark)')
  const rows: [string, boolean, string, string][] = [
    ['Network', online, 'Online', 'Offline'],
    ['Orientation', portrait, 'Portrait', 'Landscape'],
    ['Pointer', touch, 'Touch', 'Mouse / trackpad'],
    ['Motion', reducedMotion, 'Reduced', 'Full'],
    ['OS color scheme', dark, 'Dark', 'Light'],
  ]
  return (
    <dl className="details">
      {rows.map(([label, value, yes, no]) => (
        <div key={label} className="contents">
          <dt>{label}</dt>
          <dd>{value ? yes : no}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function Mobile() {
  return (
    <>
      <PageHeader title="Mobile & PWA">
        This web app is a Progressive Web App: installable, works offline and uses device features. For a fully native app,
        see the React Native (Expo) project in <code>mobile/</code>.
      </PageHeader>

      <Demo title="Install as an app" apis={['vite-plugin-pwa', 'beforeinstallprompt', 'service worker']}>
        <InstallApp />
      </Demo>

      <Demo title="Responsive environment" apis={['useSyncExternalStore', 'matchMedia']} description="Rotate your phone or toggle airplane mode.">
        <Environment />
      </Demo>

      <Demo title="Swipe gestures" apis={['Pointer events', 'setPointerCapture', 'navigator.vibrate']} description="Drag the card left or right with a finger or mouse.">
        <SwipeCards />
      </Demo>

      <Demo title="Geolocation" apis={['navigator.geolocation']}>
        <Geolocation />
      </Demo>

      <Demo title="Share, vibrate, clipboard" apis={['navigator.share', 'navigator.vibrate', 'navigator.clipboard']}>
        <ShareAndVibrate />
      </Demo>
    </>
  )
}
