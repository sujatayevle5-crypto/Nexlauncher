import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  FlatList,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GAMES_DB } from './src/games-db';
import type { Game } from './src/games-db';
import type { UserGame, GameGoal } from './src/types';

// ─── Colors ────────────────────────────────────────────────────────────────
const C = {
  bg: '#0a0d0a',
  sidebar: 'rgba(0,0,0,0.7)',
  divider: '#22c55e',
  primary: '#22c55e',
  secondary: '#ef4444',
  card: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.1)',
  text: '#e5e7eb',
  muted: '#6b7280',
  modal: '#111411',
};

// ─── Storage ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'nexlaunch-v1';

async function loadState(): Promise<{ games: UserGame[]; goals: GameGoal[] }> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { games: [], goals: [] };
}

async function saveState(state: { games: UserGame[]; goals: GameGoal[] }) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ─── Launch ─────────────────────────────────────────────────────────────────
async function launchGame(game: UserGame) {
  if (game.appScheme) {
    const canOpen = await Linking.canOpenURL(game.appScheme);
    if (canOpen) {
      await Linking.openURL(game.appScheme);
      return;
    }
  }
  const canOpenWeb = await Linking.canOpenURL(game.launchUrl);
  if (canOpenWeb) {
    await Linking.openURL(game.launchUrl);
  } else {
    Alert.alert('Cannot open', `Could not launch ${game.name}.`);
  }
}

// ─── GameCard ────────────────────────────────────────────────────────────────
function GameCard({ game, onPress }: { game: UserGame; onPress: () => void }) {
  const [imgError, setImgError] = useState(false);
  const initials = game.name.slice(0, 2).toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {!imgError ? (
        <Image
          source={{ uri: game.coverUrl }}
          style={styles.cardImg}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.cardFallback}>
          <Text style={styles.cardInitials}>{initials}</Text>
        </View>
      )}
      <View style={styles.cardLabel}>
        <Text style={styles.cardName} numberOfLines={1}>{game.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── GoalCard ────────────────────────────────────────────────────────────────
function GoalCard({
  game,
  goal,
  onSave,
}: {
  game: UserGame;
  goal: string;
  onSave: (gameId: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(goal);

  return (
    <View style={styles.goalCard}>
      <Text style={styles.goalGame} numberOfLines={1}>{game.name}</Text>
      {editing ? (
        <TextInput
          style={styles.goalInput}
          value={text}
          onChangeText={setText}
          onBlur={() => {
            setEditing(false);
            onSave(game.id, text);
          }}
          placeholder="Set a goal..."
          placeholderTextColor={C.muted}
          multiline
          autoFocus
        />
      ) : (
        <TouchableOpacity onPress={() => setEditing(true)} style={{ flex: 1 }}>
          <Text style={[styles.goalText, !text && { color: C.muted }]}>
            {text || 'Set a goal...'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── AddGameModal ────────────────────────────────────────────────────────────
function AddGameModal({
  visible,
  onClose,
  onAdd,
  existingIds,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (game: Game) => void;
  existingIds: string[];
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const results =
    query.trim().length === 0
      ? []
      : GAMES_DB.filter(
          (g) =>
            g.name.toLowerCase().includes(query.toLowerCase()) &&
            !existingIds.includes(g.id),
        );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Game</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={C.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={C.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search games..."
              placeholderTextColor={C.muted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>

          {query.trim().length === 0 ? (
            <View style={styles.emptySearch}>
              <Ionicons name="search-outline" size={40} color={C.muted} />
              <Text style={styles.emptySearchText}>Type to search games</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>No games found</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              numColumns={4}
              contentContainerStyle={{ paddingBottom: 16 }}
              renderItem={({ item }) => {
                const [err, setErr] = useState(false);
                return (
                  <TouchableOpacity
                    style={styles.resultCard}
                    onPress={() => { onAdd(item); onClose(); }}
                    activeOpacity={0.75}
                  >
                    {!err ? (
                      <Image
                        source={{ uri: item.coverUrl }}
                        style={styles.resultImg}
                        onError={() => setErr(true)}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.resultImg, styles.resultFallback]}>
                        <Text style={styles.cardInitials}>{item.name.slice(0, 2).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.resultLabel}>
                      <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const insets = useSafeAreaInsets();
  const [games, setGames] = useState<UserGame[]>([]);
  const [goals, setGoals] = useState<GameGoal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadState().then((s) => {
      setGames(s.games);
      setGoals(s.goals);
      setLoaded(true);
    });
  }, []);

  const persist = (g: UserGame[], gl: GameGoal[]) => {
    setGames(g);
    setGoals(gl);
    saveState({ games: g, goals: gl });
  };

  const handleAdd = (game: Game) => {
    if (games.find((g) => g.id === game.id)) return;
    persist([...games, game], goals);
  };

  const handleGoal = (gameId: string, text: string) => {
    const existing = goals.findIndex((g) => g.gameId === gameId);
    let updated = [...goals];
    if (text.trim() === '') {
      updated = updated.filter((g) => g.gameId !== gameId);
    } else if (existing >= 0) {
      updated[existing] = { gameId, goal: text };
    } else {
      updated.push({ gameId, goal: text });
    }
    persist(games, updated);
  };

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <View style={[styles.root, { paddingLeft: insets.left, paddingRight: insets.right }]}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.tabBtn}>
            <Ionicons name="game-controller" size={26} color={C.primary} />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Main */}
        <ScrollView style={styles.main} contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>NexLaunch</Text>
            <View style={styles.devicePill}>
              <Text style={styles.deviceModel}>{Platform.OS === 'android' ? 'Android' : Platform.OS === 'ios' ? 'iOS' : 'Device'}</Text>
              <Text style={styles.deviceFps}>~60 FPS</Text>
            </View>
          </View>

          {/* Library */}
          <Text style={styles.sectionTitle}>Your Library</Text>
          {games.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="game-controller-outline" size={48} color={C.muted} />
              <Text style={styles.emptyTitle}>No games yet</Text>
              <Text style={styles.emptySubtitle}>Search and add your first game below</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addBtnText}>Add Game</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {games.map((g) => (
                <GameCard key={g.id} game={g} onPress={() => launchGame(g)} />
              ))}
              <TouchableOpacity style={styles.addCard} onPress={() => setShowModal(true)}>
                <Ionicons name="add" size={32} color={C.muted} />
                <Text style={styles.addCardText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Goals */}
          {games.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Goals</Text>
              <View style={styles.goalsRow}>
                {games.map((g) => (
                  <GoalCard
                    key={g.id}
                    game={g}
                    goal={goals.find((gl) => gl.gameId === g.id)?.goal ?? ''}
                    onSave={handleGoal}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <AddGameModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          existingIds={games.map((g) => g.id)}
        />
      </View>
    </SafeAreaProvider>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },
  sidebar: {
    width: 64,
    backgroundColor: C.sidebar,
    alignItems: 'center',
    paddingTop: 20,
  },
  tabBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { width: 1, backgroundColor: C.primary, opacity: 0.5 },
  main: { flex: 1 },
  mainContent: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 26, fontWeight: '900', color: C.primary, letterSpacing: 1 },
  devicePill: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deviceModel: { fontSize: 12, color: C.text, fontWeight: '600' },
  deviceFps: { fontSize: 11, color: C.muted },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: 110,
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  cardImg: { width: '100%', height: '100%' },
  cardFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  cardInitials: { fontSize: 24, fontWeight: '800', color: C.primary },
  cardLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  cardName: { fontSize: 11, color: '#fff', fontWeight: '600' },
  addCard: {
    width: 110,
    height: 160,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.cardBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addCardText: { fontSize: 11, color: C.muted },

  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.muted },
  emptySubtitle: { fontSize: 13, color: C.muted, marginBottom: 8 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  goalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalCard: {
    width: 130,
    minHeight: 90,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 10,
    padding: 10,
  },
  goalGame: { fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: '600' },
  goalText: { fontSize: 12, color: C.text, flex: 1 },
  goalInput: { fontSize: 12, color: C.text, flex: 1, padding: 0 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: C.modal,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 16,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  emptySearch: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  emptySearchText: { color: C.muted, fontSize: 14 },
  resultCard: {
    flex: 1,
    margin: 4,
    aspectRatio: 9 / 14,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: C.card,
  },
  resultImg: { width: '100%', height: '100%' },
  resultFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,197,94,0.15)' },
  resultLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  resultName: { fontSize: 10, color: '#fff', fontWeight: '600' },
});
