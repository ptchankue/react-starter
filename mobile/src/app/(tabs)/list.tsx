import { Link } from 'expo-router'
import { memo, useCallback, useDeferredValue, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native'
import { fetchUsers, type User } from '@/data'
import { useTheme } from '@/theme/ThemeContext'

// memo: rows only re-render when their props change — important for long lists.
const UserRow = memo(function UserRow({ user }: { user: User }) {
  const { colors } = useTheme()
  return (
    // Link + asChild turns any pressable into a navigation link (dynamic route /user/[id]).
    <Link href={{ pathname: '/user/[id]', params: { id: user.id, name: user.name } }} asChild>
      <Pressable style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.surface2 : colors.surface }]}>
        <Text style={styles.emoji}>{user.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textH, fontWeight: '600' }}>
            #{user.id} {user.name}
          </Text>
          <Text style={{ color: colors.muted }}>
            {user.role} · {user.city}
          </Text>
        </View>
        <Text style={{ color: colors.muted }}>›</Text>
      </Pressable>
    </Link>
  )
})

export default function ListScreen() {
  const { colors } = useTheme()
  const [items, setItems] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    fetchUsers(0).then(setItems)
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || deferredQuery) return
    setLoadingMore(true)
    const next = await fetchUsers(page + 1)
    setItems((prev) => [...prev, ...next])
    setPage((p) => p + 1)
    setLoadingMore(false)
  }, [loadingMore, page, deferredQuery])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setItems(await fetchUsers(0))
    setPage(0)
    setRefreshing(false)
  }, [])

  const visible = deferredQuery
    ? items.filter((u) => u.name.toLowerCase().includes(deferredQuery.toLowerCase()))
    : items

  return (
    // FlatList virtualizes: only rows near the viewport are rendered.
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={visible}
      keyExtractor={(u) => String(u.id)}
      renderItem={({ item }) => <UserRow user={item} />}
      ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />}
      ListHeaderComponent={
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search loaded users…"
          placeholderTextColor={colors.muted}
          clearButtonMode="while-editing"
          style={[styles.search, { color: colors.textH, backgroundColor: colors.surface2 }]}
        />
      }
      ListEmptyComponent={
        items.length === 0 ? (
          <ActivityIndicator style={{ marginTop: 32 }} color={colors.accent} />
        ) : (
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 32 }}>No matches</Text>
        )
      }
      ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} color={colors.accent} /> : undefined}
      onEndReached={loadMore} // infinite scroll
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
      keyboardDismissMode="on-drag"
    />
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  emoji: { fontSize: 28 },
  search: { margin: 12, minHeight: 44, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 },
})
