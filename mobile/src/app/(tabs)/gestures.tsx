import * as Haptics from 'expo-haptics'
import { useRef, useState } from 'react'
import { Animated, PanResponder, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { Button, P, Row, Screen, Section } from '@/components/ui'
import { useTheme } from '@/theme/ThemeContext'

const cards = [
  { emoji: '⚛️', title: 'Components' },
  { emoji: '🪝', title: 'Hooks' },
  { emoji: '🧭', title: 'Expo Router' },
  { emoji: '📱', title: 'React Native' },
]

function haptic(style: Haptics.ImpactFeedbackStyle) {
  if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {})
}

/** Swipe cards with PanResponder + Animated (built into React Native). */
function SwipeDeck() {
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const [verdicts, setVerdicts] = useState<string[]>([])
  // Animated values must survive re-renders: create them once with a lazy useState.
  const [pan] = useState(() => new Animated.ValueXY())
  const card = cards[index]

  const fling = (direction: 1 | -1) => {
    if (!card) return
    haptic(direction > 0 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light)
    Animated.timing(pan, { toValue: { x: direction * width * 1.2, y: 0 }, duration: 220, useNativeDriver: true }).start(() => {
      setVerdicts((v) => [...v, `${direction > 0 ? '❤️' : '👎'} ${card.title}`])
      setIndex((i) => i + 1)
      pan.setValue({ x: 0, y: 0 })
    })
  }

  // Recreated on each render so the handlers always see the current card.
  const responder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > 120) fling(g.dx > 0 ? 1 : -1)
      else Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start()
    },
  })

  const rotate = pan.x.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-15deg', '0deg', '15deg'] })

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.deck}>
        {card ? (
          <Animated.View
            {...responder.panHandlers}
            style={[styles.card, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }]}
          >
            <Text style={{ fontSize: 64 }}>{card.emoji}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.hint}>swipe me</Text>
          </Animated.View>
        ) : (
          <Button
            title="Start over"
            onPress={() => {
              setIndex(0)
              setVerdicts([])
            }}
          />
        )}
      </View>
      <Row>
        <Button title="👎" disabled={!card} onPress={() => fling(-1)} />
        <Button title="❤️" disabled={!card} onPress={() => fling(1)} />
      </Row>
      <P muted>{verdicts.join(' · ') || 'No votes yet'}</P>
    </View>
  )
}

/** Looping and interpolated animations. */
function PulseDemo() {
  const { colors } = useTheme()
  const [scale] = useState(() => new Animated.Value(1))
  const [running, setRunning] = useState(false)
  const loop = useRef<Animated.CompositeAnimation | null>(null)

  const toggle = () => {
    if (running) {
      loop.current?.stop()
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
    } else {
      loop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.3, duration: 400, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      )
      loop.current.start()
    }
    setRunning((r) => !r)
  }

  return (
    <Row>
      <Animated.View style={[styles.heart, { backgroundColor: colors.accent, transform: [{ scale }] }]} />
      <Button title={running ? 'Stop' : 'Pulse'} onPress={toggle} />
    </Row>
  )
}

function HapticsDemo() {
  return (
    <Row>
      <Button title="Light" onPress={() => haptic(Haptics.ImpactFeedbackStyle.Light)} />
      <Button title="Heavy" onPress={() => haptic(Haptics.ImpactFeedbackStyle.Heavy)} />
      <Button
        title="Success"
        onPress={() => Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
      />
    </Row>
  )
}

export default function GesturesScreen() {
  return (
    <Screen>
      <Section title="Swipe cards" apis={['PanResponder', 'Animated.ValueXY', 'interpolate']}>
        <SwipeDeck />
      </Section>
      <Section title="Animations" apis={['Animated.loop', 'useNativeDriver']}>
        <PulseDemo />
      </Section>
      <Section title="Haptic feedback" apis={['expo-haptics']}>
        <HapticsDemo />
        <P muted>Feel it on a real device (not available on web or most simulators).</P>
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  deck: { height: 260, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 220,
    height: 240,
    borderRadius: 24,
    backgroundColor: '#087ea4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  hint: { color: '#fff', opacity: 0.7, fontSize: 12, letterSpacing: 2 },
  heart: { width: 48, height: 48, borderRadius: 24, marginHorizontal: 12 },
})
