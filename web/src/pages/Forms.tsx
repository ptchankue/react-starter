import { useActionState, useOptimistic, useRef, useState, startTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { saveName } from '../api/fakeApi'
import { Demo, PageHeader } from '../components/Demo'
import { validate, type SignUp } from '../lib/validation'

// ---- Controlled form with validation ---------------------------------------
function ControlledForm() {
  const [values, setValues] = useState<SignUp>({ email: '', password: '', plan: 'free', terms: false })
  const [touched, setTouched] = useState<Partial<Record<keyof SignUp, boolean>>>({})
  const [submitted, setSubmitted] = useState<SignUp | null>(null)
  const errors = validate(values) // derived, recomputed every render
  const valid = Object.keys(errors).length === 0

  const update = <K extends keyof SignUp>(key: K, value: SignUp[K]) => setValues((v) => ({ ...v, [key]: value }))
  const showError = (k: keyof SignUp) => touched[k] && errors[k]

  return (
    <form
      className="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setTouched({ email: true, password: true, terms: true })
        if (valid) setSubmitted(values)
      }}
    >
      <label>
        Email
        <input
          type="email"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          aria-invalid={!!showError('email')}
        />
        {showError('email') && <small className="error-text">{errors.email}</small>}
      </label>
      <label>
        Password
        <input
          type="password"
          value={values.password}
          onChange={(e) => update('password', e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          aria-invalid={!!showError('password')}
        />
        <meter min={0} max={12} low={6} high={10} optimum={12} value={Math.min(values.password.length, 12)} />
        {showError('password') && <small className="error-text">{errors.password}</small>}
      </label>
      <fieldset className="row">
        <legend>Plan</legend>
        {(['free', 'pro'] as const).map((p) => (
          <label key={p}>
            <input type="radio" name="plan" checked={values.plan === p} onChange={() => update('plan', p)} /> {p}
          </label>
        ))}
      </fieldset>
      <label className="row">
        <input type="checkbox" checked={values.terms} onChange={(e) => update('terms', e.target.checked)} /> I accept the
        terms
      </label>
      {showError('terms') && <small className="error-text">{errors.terms}</small>}
      <button type="submit" className="primary">
        Sign up
      </button>
      {submitted && <pre className="code">{JSON.stringify({ ...submitted, password: '••••' }, null, 2)}</pre>}
    </form>
  )
}

// ---- Uncontrolled form + FormData ------------------------------------------
function UncontrolledForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [result, setResult] = useState<Record<string, FormDataEntryValue>>()
  return (
    <form
      ref={formRef}
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        setResult(Object.fromEntries(new FormData(e.currentTarget)))
      }}
    >
      <input name="city" defaultValue="Paris" aria-label="City" />
      <select name="color" defaultValue="blue" aria-label="Color">
        <option>red</option>
        <option>green</option>
        <option>blue</option>
      </select>
      <input type="range" name="volume" min={0} max={10} defaultValue={5} aria-label="Volume" />
      <div className="row">
        <button type="submit">Read FormData</button>
        <button type="button" onClick={() => formRef.current?.reset()}>
          Reset
        </button>
      </div>
      {result && <pre className="code">{JSON.stringify(result, null, 2)}</pre>}
    </form>
  )
}

// ---- React 19 actions: useActionState + useFormStatus ------------------------
function SubmitButton() {
  // Reads the status of the parent <form> — no prop drilling needed.
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="primary" disabled={pending}>
      {pending ? 'Saving…' : 'Save'}
    </button>
  )
}

type SaveState = { ok: boolean; message: string; name?: string } | null

async function saveAction(_prev: SaveState, formData: FormData): Promise<SaveState> {
  try {
    const name = await saveName(String(formData.get('name') ?? ''))
    return { ok: true, message: `Saved "${name}"`, name }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}

function ActionForm() {
  const [state, formAction, isPending] = useActionState(saveAction, null)
  return (
    <form action={formAction} className="form">
      <input name="name" placeholder='Your name (try "error")' defaultValue={state?.name ?? ''} required aria-label="Name" />
      <SubmitButton />
      {isPending && <small className="muted">Server action in flight…</small>}
      {state && (
        <div className={`alert ${state.ok ? 'success' : 'error'}`} role="status">
          {state.message}
        </div>
      )}
    </form>
  )
}

// ---- useOptimistic ------------------------------------------------------------
interface Message {
  id: string
  text: string
  sending?: boolean
}

function OptimisticChat() {
  const [messages, setMessages] = useState<Message[]>([{ id: '1', text: 'Welcome! Messages appear instantly.' }])
  const [optimistic, addOptimistic] = useOptimistic(messages, (state, text: string) => [
    ...state,
    { id: `tmp-${state.length}`, text, sending: true },
  ])
  const [error, setError] = useState('')

  async function send(formData: FormData) {
    const text = String(formData.get('text') ?? '').trim()
    if (!text) return
    setError('')
    addOptimistic(text) // shown immediately, rolled back automatically on failure
    try {
      const saved = await saveName(text)
      startTransition(() => setMessages((m) => [...m, { id: crypto.randomUUID(), text: saved }]))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="stack">
      <ul className="chat">
        {optimistic.map((m) => (
          <li key={m.id} className={m.sending ? 'sending' : ''}>
            {m.text} {m.sending && <small>sending…</small>}
          </li>
        ))}
      </ul>
      <form action={send} className="row">
        <input name="text" placeholder='Say something (or "error")' aria-label="Message" />
        <button type="submit">Send</button>
      </form>
      {error && <div className="alert error">Rolled back: {error}</div>}
    </div>
  )
}

export default function Forms() {
  return (
    <>
      <PageHeader title="Forms & Actions">From classic controlled inputs to React 19 form actions.</PageHeader>

      <Demo
        title="Controlled form with validation"
        apis={['value + onChange', 'derived errors', 'onBlur touched']}
        description="React state is the single source of truth for every input."
      >
        <ControlledForm />
      </Demo>

      <Demo title="Uncontrolled form" apis={['defaultValue', 'FormData', 'ref']} description="The DOM keeps the values; read them on submit.">
        <UncontrolledForm />
      </Demo>

      <Demo
        title="Form actions"
        apis={['<form action>', 'useActionState', 'useFormStatus']}
        description="Pass an async function to `action`. React tracks pending state, and the form resets automatically."
      >
        <ActionForm />
      </Demo>

      <Demo title="Optimistic updates" apis={['useOptimistic', 'startTransition']}>
        <OptimisticChat />
      </Demo>
    </>
  )
}
