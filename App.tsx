import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, TextInput, Image, Modal, FlatList, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GAMES_DB } from './src/games-db';
import type { Game } from './src/games-db';
import type { UserGame } from './src/types';

const C = { bg: '#0a0d0a', primary: '#22c55e', card: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', text: '#e5e7eb', muted: '#6b7280', modal: '#111411' };

async function launchGame(game: UserGame) {
  if (game.appScheme) {
    const ok = await Linking.canOpenURL(game.appScheme);
    if (ok) { await Linking.openURL(game.appScheme); return; }
  }
  const ok = await Linking.canOpenURL(game.launchUrl);
  if (ok) await Linking.openURL(game.launchUrl);
  else Alert.alert('Cannot open', game.name);
}

function GameCard({ game, onPress }: { game: UserGame; onPress: () => void }) {
  const [err, setErr] = useState(false);
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      {!err
        ? <Image source={{ uri: game.coverUrl }} style={s.cardImg} onError={() => setErr(true)} resizeMode="cover" />
        : <View style={s.cardFallback}><Text style={s.initials}>{game.name.slice(0,2).toUpperCase()}</Text></View>}
      <View style={s.cardLabel}><Text style={s.cardName} numberOfLines={1}>{game.name}</Text></View>
    </TouchableOpacity>
  );
}

function AddModal({ visible, onClose, onAdd, ids }: { visible: boolean; onClose: () => void; onAdd: (g: Game) => void; ids: string[] }) {
  const [q, setQ] = useState('');
  useEffect(() => { if (!visible) setQ(''); }, [visible]);
  const results = q.trim() === '' ? [] : GAMES_DB.filter(g => g.name.toLowerCase().includes(q.toLowerCase()) && !ids.includes(g.id));
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          <View style={s.mHead}>
            <Text style={s.mTitle}>Add Game</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color={C.muted} /></TouchableOpacity>
          </View>
          <View style={s.searchRow}>
            <Ionicons name="search" size={16} color={C.muted} style={{ marginRight: 8 }} />
            <TextInput style={s.searchInput} placeholder="Search games..." placeholderTextColor={C.muted} value={q} onChangeText={setQ} autoFocus />
          </View>
          {q.trim() === ''
            ? <View style={s.hint}><Text style={s.hintText}>Type to search games</Text></View>
            : results.length === 0
              ? <View style={s.hint}><Text style={s.hintText}>No games found</Text></View>
              : <FlatList data={results} keyExtractor={i => i.id} numColumns={3} contentContainerStyle={{ paddingBottom: 8 }}
                  renderItem={({ item }) => {
                    const [e, setE] = useState(false);
                    return (
                      <TouchableOpacity style={s.rCard} onPress={() => { onAdd(item); onClose(); }} activeOpacity={0.75}>
                        {!e
                          ? <Image source={{ uri: item.coverUrl }} style={s.rImg} onError={() => setE(true)} resizeMode="cover" />
                          : <View style={[s.rImg, s.cardFallback]}><Text style={s.initials}>{item.name.slice(0,2).toUpperCase()}</Text></View>}
                        <Text style={s.rName} numberOfLines={1}>{item.name}</Text>
                      </TouchableOpacity>
                    );
                  }} />}
        </View>
      </View>
    </Modal>
  );
}

export default function App() {
  const insets = useSafeAreaInsets();
  const [games, setGames] = useState<UserGame[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('nexlaunch-v1').then(r => { if (r) setGames(JSON.parse(r)); });
  }, []);

  const save = (g: UserGame[]) => { setGames(g); AsyncStorage.setItem('nexlaunch-v1', JSON.stringify(g)); };
  const add = (g: Game) => { if (!games.find(x => x.id === g.id)) save([...games, g]); };

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <View style={[s.root, { paddingLeft: insets.left, paddingRight: insets.right }]}>
        <View style={s.sidebar}>
          <Text style={s.sidebarLogo}>N</Text>
          <View style={s.sidebarBtn}>
            <Ionicons name="game-controller" size={24} color={C.primary} />
          </View>
        </View>
        <View style={s.divider} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.main} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <Text style={s.title}>NexLaunch</Text>
            <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={s.addBtnText}>Add Game</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.section}>Your Library</Text>

          {games.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="game-controller-outline" size={48} color={C.muted} />
              <Text style={s.emptyTitle}>No games yet</Text>
              <Text style={s.emptySubtitle}>Tap Add Game to get started</Text>
            </View>
          ) : (
            <View style={s.grid}>
              {games.map(g => <GameCard key={g.id} game={g} onPress={() => launchGame(g)} />)}
              <TouchableOpacity style={s.addCard} onPress={() => setShowModal(true)}>
                <Ionicons name="add" size={28} color={C.muted} />
                <Text style={s.addCardText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <AddModal visible={showModal} onClose={() => setShowModal(false)} onAdd={add} ids={games.map(g => g.id)} />
      </View>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },
  sidebar: { width: 64, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', paddingTop: 16, gap: 16 },
  sidebarLogo: { fontSize: 22, fontWeight: '900', color: C.primary },
  sidebarBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center' },
  divider: { width: 1, backgroundColor: C.primary, opacity: 0.4 },
  main: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: C.primary, letterSpacing: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  section: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: 100, height: 148, borderRadius: 10, overflow: 'hidden', backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  cardImg: { width: '100%', height: '100%' },
  cardFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,197,94,0.1)' },
  initials: { fontSize: 22, fontWeight: '800', color: C.primary },
  cardLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 6, backgroundColor: 'rgba(0,0,0,0.8)' },
  cardName: { fontSize: 10, color: '#fff', fontWeight: '600' },
  addCard: { width: 100, height: 148, borderRadius: 10, borderWidth: 2, borderColor: C.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addCardText: { fontSize: 11, color: C.muted },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.muted },
  emptySubtitle: { fontSize: 13, color: C.muted },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '88%', maxHeight: '80%', backgroundColor: C.modal, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 },
  mHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  mTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  hint: { alignItems: 'center', paddingVertical: 24 },
  hintText: { color: C.muted, fontSize: 14 },
  rCard: { flex: 1, margin: 4, borderRadius: 8, overflow: 'hidden', backgroundColor: C.card, aspectRatio: 9/14 },
  rImg: { width: '100%', height: '100%' },
  rName: { position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: 9, color: '#fff', fontWeight: '600', padding: 4, backgroundColor: 'rgba(0,0,0,0.8)' },
});
