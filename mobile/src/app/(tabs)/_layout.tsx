import Ionicons from '@expo/vector-icons/Ionicons'
import { Link, Tabs } from 'expo-router'
import type { ComponentProps } from 'react'
import { Pressable } from 'react-native'
import { useTheme } from '@/theme/ThemeContext'

type IconName = ComponentProps<typeof Ionicons>['name']

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Basics', icon: 'cube-outline' },
  { name: 'hooks', title: 'Hooks', icon: 'git-branch-outline' },
  { name: 'list', title: 'Lists', icon: 'list-outline' },
  { name: 'gestures', title: 'Gestures', icon: 'hand-left-outline' },
  { name: 'device', title: 'Device', icon: 'phone-portrait-outline' },
]

export default function TabLayout() {
  const { colors } = useTheme()
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textH,
        headerRight: () => (
          <Link href="/modal" asChild>
            <Pressable accessibilityLabel="Settings" hitSlop={12} style={{ marginRight: 16 }}>
              <Ionicons name="settings-outline" size={22} color={colors.textH} />
            </Pressable>
          </Link>
        ),
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} size={size} color={color as string} />,
          }}
        />
      ))}
    </Tabs>
  )
}
