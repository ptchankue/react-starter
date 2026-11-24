import { router } from 'expo-router'
import { Switch, Text, View } from 'react-native'
import { Button, P, Row, Screen, Section } from '@/components/ui'
import { useTheme } from '@/theme/ThemeContext'

export default function SettingsModal() {
  const { mode, setMode, colors } = useTheme()
  return (
    <Screen>
      <Section title="Theme" apis={['Context', 'useColorScheme']}>
        <Row>
          {(['system', 'light', 'dark'] as const).map((m) => (
            <Button key={m} title={m} primary={mode === m} onPress={() => setMode(m)} />
          ))}
        </Row>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text }}>Dark mode</Text>
          <Switch
            value={mode === 'dark'}
            onValueChange={(v) => setMode(v ? 'dark' : 'light')}
            trackColor={{ true: colors.accent }}
          />
        </View>
        <P muted>This screen is presented as a modal by the root Stack.</P>
      </Section>
      <Button title="Close" onPress={() => router.back()} />
    </Screen>
  )
}
