import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Button, P, Row, Screen, Section } from '@/components/ui'
import { usePersistentState } from '@/hooks/usePersistentState'
import { useTheme } from '@/theme/ThemeContext'

interface Todo {
  id: string
  text: string
  done: boolean
}
type Action = { type: 'add'; text: string } | { type: 'toggle'; id: string } | { type: 'remove'; id: string }

function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add':
      return [...state, { id: String(Date.now()), text: action.text, done: false }]
    case 'toggle':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
    case 'remove':
      return state.filter((t) => t.id !== action.id)
  }
}

function Counter() {
  const { colors } = useTheme()
  const [count, setCount] = useState(0)
  return (
    <Row>
      <Button title="−" onPress={() => setCount((c) => c - 1)} />
      <Text style={{ fontSize: 28, fontWeight: '700', minWidth: 48, textAlign: 'center', color: colors.textH }}>{count}</Text>
      <Button title="+" onPress={() => setCount((c) => c + 1)} />
      <Button title="Reset" onPress={() => setCount(0)} />
    </Row>
  )
}

function Stopwatch() {
  const { colors } = useTheme()
  const [running, setRunning] = useState(false)
  const [ms, setMs] = useState(0)
  const startRef = useRef(0)

  useEffect(() => {
    if (!running) return
    startRef.current = Date.now() - ms
    const id = setInterval(() => setMs(Date.now() - startRef.current), 50)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  return (
    <Row>
      <Text style={{ fontSize: 28, fontVariant: ['tabular-nums'], color: colors.textH }}>{(ms / 1000).toFixed(2)}s</Text>
      <Button primary title={running ? 'Pause' : 'Start'} onPress={() => setRunning((r) => !r)} />
      <Button title="Reset" disabled={running} onPress={() => setMs(0)} />
    </Row>
  )
}

/** useEffect subscribing to a native event source. */
function AppStateWatcher() {
  const [log, setLog] = useState<string[]>([String(AppState.currentState)])
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setLog((l) => [...l.slice(-4), s]))
    return () => sub.remove()
  }, [])
  return <P>App state history: {log.join(' → ')} (background the app and come back)</P>
}

function Todos() {
  const { colors } = useTheme()
  const [saved, setSaved, loaded] = usePersistentState<Todo[]>('todos', [])
  // Wait for storage before mounting the list, so the reducer starts with saved data.
  if (!loaded) return <ActivityIndicator color={colors.accent} />
  return <TodoList initial={saved} onChange={setSaved} />
}

function TodoList({ initial, onChange }: { initial: Todo[]; onChange: (todos: Todo[]) => void }) {
  const { colors } = useTheme()
  const [todos, dispatch] = useReducer(reducer, initial)
  const [text, setText] = useState('')

  useEffect(() => onChange(todos), [todos, onChange])

  const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos])

  const add = () => {
    if (!text.trim()) return
    dispatch({ type: 'add', text: text.trim() })
    setText('')
  }

  return (
    <View style={{ gap: 8 }}>
      <Row>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          placeholder="New todo"
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          style={[styles.input, { color: colors.textH, borderColor: colors.border, backgroundColor: colors.surface2 }]}
        />
        <Button primary title="Add" onPress={add} />
      </Row>
      {todos.map((t) => (
        <Pressable
          key={t.id}
          onPress={() => dispatch({ type: 'toggle', id: t.id })}
          onLongPress={() => dispatch({ type: 'remove', id: t.id })}
          style={[styles.todo, { borderColor: colors.border }]}
        >
          <Text style={{ color: t.done ? colors.muted : colors.textH, textDecorationLine: t.done ? 'line-through' : 'none' }}>
            {t.done ? '✅' : '⬜️'} {t.text}
          </Text>
        </Pressable>
      ))}
      <P muted>{remaining} left · tap to toggle, long-press to delete · saved with AsyncStorage</P>
    </View>
  )
}

export default function HooksScreen() {
  return (
    <Screen>
      <Section title="useState" apis={['useState']}>
        <Counter />
      </Section>
      <Section title="useEffect + useRef" apis={['useEffect', 'cleanup', 'useRef']}>
        <Stopwatch />
        <AppStateWatcher />
      </Section>
      <Section title="useReducer + persistence" apis={['useReducer', 'useMemo', 'AsyncStorage', 'custom hook']}>
        <Todos />
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  input: { flex: 1, minWidth: 160, minHeight: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 },
  todo: { padding: 12, borderWidth: 1, borderRadius: 10 },
})
