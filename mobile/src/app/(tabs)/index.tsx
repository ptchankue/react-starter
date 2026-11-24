import { useState } from 'react'
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { Button, P, Row, Screen, Section } from '@/components/ui'
import { useTheme } from '@/theme/ThemeContext'

function Badge({ label, tone }: { label: string; tone: 'ok' | 'warn' }) {
  const { colors } = useTheme()
  return (
    <Text style={[styles.badge, { color: tone === 'ok' ? colors.success : colors.danger, borderColor: colors.border }]}>
      {label}
    </Text>
  )
}

function Profile({ name, role, online }: { name: string; role: string; online: boolean }) {
  const { colors } = useTheme()
  return (
    <View style={[styles.profile, { borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
        <Text style={{ color: colors.accentContrast, fontWeight: '700' }}>{name.split(' ').map((p) => p[0]).join('')}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: colors.textH, fontWeight: '600' }}>{name}</Text>
        <P muted>{role}</P>
      </View>
      {/* Conditional rendering works exactly like on the web */}
      <Badge label={online ? 'Online' : 'Away'} tone={online ? 'ok' : 'warn'} />
    </View>
  )
}

export default function BasicsScreen() {
  const { colors } = useTheme()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Section title="Same React, native views" apis={['View', 'Text', 'Image', 'StyleSheet']}>
          <P>
            Components, props, state and hooks are identical to React DOM. Only the primitives change: {'<div>'} becomes{' '}
            {'<View>'}, {'<span>'} becomes {'<Text>'}, and CSS becomes StyleSheet objects laid out with Flexbox.
          </P>
          <Image
            source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
            style={{ width: 48, height: 48 }}
            accessibilityLabel="React logo"
          />
        </Section>

        <Section title="Props & conditional rendering" apis={['props', '? :']}>
          <Profile name="Ada Lovelace" role="Engineer" online />
          <Profile name="Alan Turing" role="Researcher" online={false} />
        </Section>

        <Section title="Text input" apis={['TextInput', 'KeyboardAvoidingView']}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            returnKeyType="done"
            style={[styles.input, { color: colors.textH, borderColor: colors.border, backgroundColor: colors.surface2 }]}
          />
          <P>Hello, {name.trim() || 'stranger'} 👋</P>
        </Section>

        <Section title="Pressable & loading state" apis={['Pressable', 'ActivityIndicator']}>
          <Row>
            <Button
              primary
              title={loading ? 'Working…' : 'Do something slow'}
              disabled={loading}
              onPress={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 1500)
              }}
            />
            {loading && <ActivityIndicator color={colors.accent} />}
          </Row>
        </Section>

        <Section title="Platform-specific code" apis={['Platform.OS', 'Platform.select']}>
          <P>
            Running on <Text style={{ fontWeight: '700' }}>{Platform.OS}</Text>{' '}
            {Platform.select({ ios: '🍏', android: '🤖', web: '🌐', default: '📱' })}
          </P>
        </Section>
      </Screen>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderRadius: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badge: { fontSize: 12, fontWeight: '700', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 },
})
