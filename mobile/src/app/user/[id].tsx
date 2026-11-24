import { Stack, useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'
import { P, Screen, Section } from '@/components/ui'
import { users } from '@/data'
import { useTheme } from '@/theme/ThemeContext'

/** Dynamic route: /user/3 → useLocalSearchParams() returns { id: '3' }. */
export default function UserScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>()
  const { colors } = useTheme()
  const user = users[(Number(id) - 1) % users.length]

  return (
    <Screen>
      {/* Screens can configure their own header */}
      <Stack.Screen options={{ title: name ?? `User ${id}` }} />
      <View style={{ alignItems: 'center', gap: 8, paddingVertical: 16 }}>
        <Text style={{ fontSize: 64 }}>{user?.emoji ?? '❓'}</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textH }}>{user?.name ?? 'Unknown'}</Text>
        <P muted>
          {user?.role} · {user?.city}
        </P>
      </View>
      <Section title="Route params" apis={['useLocalSearchParams', 'Stack.Screen options']}>
        <P>{JSON.stringify({ id, name })}</P>
      </Section>
    </Screen>
  )
}
