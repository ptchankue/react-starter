import type { ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View, type PressableProps } from 'react-native'
import { useTheme } from '@/theme/ThemeContext'

/** Screen wrapper: scrollable, themed, with consistent padding. */
export function Screen({ children }: { children: ReactNode }) {
  const { colors } = useTheme()
  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  )
}

export function Section({ title, apis, children }: { title: string; apis?: string[]; children: ReactNode }) {
  const { colors } = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textH }]}>{title}</Text>
      {apis && (
        <View style={styles.tags}>
          {apis.map((a) => (
            <Text key={a} style={[styles.tag, { color: colors.accent, backgroundColor: colors.surface2 }]}>
              {a}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.body}>{children}</View>
    </View>
  )
}

export function P({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const { colors } = useTheme()
  return <Text style={{ color: muted ? colors.muted : colors.text, fontSize: 15, lineHeight: 22 }}>{children}</Text>
}

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string
  primary?: boolean
}

export function Button({ title, primary, disabled, style, ...rest }: ButtonProps) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      // Pressable gives you the pressed state for feedback styles.
      style={(state) => [
        styles.button,
        {
          backgroundColor: primary ? colors.accent : colors.surface,
          borderColor: primary ? colors.accent : colors.border,
          opacity: disabled ? 0.5 : state.pressed ? 0.7 : 1,
          transform: [{ scale: state.pressed ? 0.97 : 1 }],
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      <Text style={{ color: primary ? colors.accentContrast : colors.textH, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  )
}

export function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 16, paddingBottom: 48 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 16 },
  title: { fontSize: 17, fontWeight: '700' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { fontSize: 12, fontFamily: 'monospace', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  body: { marginTop: 12, gap: 10 },
  button: { minHeight: 44, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
})
