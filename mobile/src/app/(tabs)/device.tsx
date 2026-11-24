import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import { useEffect, useState } from 'react'
import { Alert, Appearance, Dimensions, PixelRatio, Platform, Share, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, P, Row, Screen, Section } from '@/components/ui'
import { useTheme } from '@/theme/ThemeContext'

function InfoTable({ rows }: { rows: [string, string][] }) {
  const { colors } = useTheme()
  return (
    <View style={{ gap: 6 }}>
      {rows.map(([k, v]) => (
        <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <Text style={{ color: colors.muted }}>{k}</Text>
          <Text style={{ color: colors.textH, fontWeight: '500', flexShrink: 1, textAlign: 'right' }}>{v}</Text>
        </View>
      ))}
    </View>
  )
}

export default function DeviceScreen() {
  const { width, height, fontScale } = useWindowDimensions() // updates on rotation
  const insets = useSafeAreaInsets()
  const { scheme } = useTheme()
  const [osScheme, setOsScheme] = useState(Appearance.getColorScheme())

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setOsScheme(colorScheme))
    return () => sub.remove()
  }, [])

  // Deep links: reactshowcase://user/3 opens the user screen via Expo Router.
  const url = Linking.useURL()

  return (
    <Screen>
      <Section title="Screen & platform" apis={['useWindowDimensions', 'PixelRatio', 'Platform']}>
        <InfoTable
          rows={[
            ['Platform', `${Platform.OS} ${Platform.Version ?? ''}`],
            ['Window', `${Math.round(width)} × ${Math.round(height)} (${width > height ? 'landscape' : 'portrait'})`],
            ['Screen', `${Math.round(Dimensions.get('screen').width)} × ${Math.round(Dimensions.get('screen').height)}`],
            ['Pixel ratio', String(PixelRatio.get())],
            ['Font scale', fontScale.toFixed(2)],
            ['Safe area', `top ${insets.top} · bottom ${insets.bottom}`],
            ['OS color scheme', String(osScheme)],
            ['App theme', scheme],
            ['App version', Constants.expoConfig?.version ?? '—'],
          ]}
        />
      </Section>

      <Section title="Native dialogs & sharing" apis={['Alert', 'Share']}>
        <Row>
          <Button
            title="Show alert"
            onPress={() =>
              Alert.alert('Delete item?', 'This is a native alert dialog.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Deleted') },
              ])
            }
          />
          <Button
            primary
            title="Share"
            onPress={() => Share.share({ message: 'Check out this React Native showcase!' }).catch(() => {})}
          />
        </Row>
      </Section>

      <Section title="Linking" apis={['expo-linking', 'deep links']}>
        <Row>
          <Button title="Open react.dev" onPress={() => Linking.openURL('https://react.dev')} />
          <Button title="Call" onPress={() => Linking.openURL('tel:+15555550100').catch(() => Alert.alert('Not supported'))} />
        </Row>
        <P muted>Deep link into this app: {Linking.createURL('user/3')}</P>
        {url && <P muted>Opened with: {url}</P>}
      </Section>
    </Screen>
  )
}
