import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { C, R, num } from '../theme';
import { MESES, MESES_CURTO, fmt, pct, monthStats, categoryTotals } from '../utils';
import Meter from '../components/Meter';
import ItemModal from '../components/ItemModal';
import MonthModal from '../components/MonthModal';
import type { Item } from '../types';

interface Props {
  month: number;
  setMonth: (m: number) => void;
}

type Filtro = 'todos' | 'pendentes';

export default function MesScreen({ month, setMonth }: Props) {
  const { state, dispatch } = useStore();
  const { config } = state;
  const m = state.months[month];
  const st = monthStats(m, config);
  const cats = categoryTotals(m.items, config.categorias);

  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [itemModal, setItemModal] = useState<{ open: boolean; item: Item | null }>({ open: false, item: null });
  const [monthModal, setMonthModal] = useState(false);
  const chips = useRef<ScrollView>(null);

  useEffect(() => {
    chips.current?.scrollTo({ x: Math.max(0, (month - 3) * 62), animated: true });
  }, [month]);

  const alerta = st.pctGasto > config.alerta;
  const lista = m.items.filter((i) => (filtro === 'pendentes' ? i.status === 'Pendente' : true));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <Text style={s.h1}>{MESES[month - 1]} de 2026</Text>

        <ScrollView ref={chips} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }} style={{ marginBottom: 16 }}>
          {MESES_CURTO.map((n, i) => {
            const on = i + 1 === month;
            return (
              <Pressable key={n} onPress={() => setMonth(i + 1)} style={[s.chip, on && { backgroundColor: C.ink }]}>
                <Text style={[s.chipText, on && { color: C.onInk }]}>{n}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Destaque: quanto sobrou */}
        <View style={s.hero}>
          <Text style={s.heroLabel}>Positivo do mês</Text>
          <Text style={[s.heroValue, st.positivo < 0 && { color: '#FFB4AB' }]}>{fmt(st.positivo)}</Text>

          <View style={{ marginTop: 18 }}>
            <Meter
              value={st.pctGasto}
              color={alerta ? '#FF8A7A' : '#6FD3A5'}
              mark={config.alerta}
              markColor={C.onInk}
              track="rgba(255,255,255,0.15)"
              height={10}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={s.heroSub}>{pct(st.pctGasto)} da renda gasta</Text>
              <Text style={s.heroSub}>alerta em {pct(config.alerta)}</Text>
            </View>
          </View>
        </View>

        <View style={s.stats}>
          <Pressable style={s.stat} onPress={() => setMonthModal(true)}>
            <Text style={s.statLabel}>Renda</Text>
            <Text style={s.statValue}>{fmt(st.renda)}</Text>
            <Text style={s.statHint}>Toque para editar</Text>
          </Pressable>
          <View style={s.stat}>
            <Text style={s.statLabel}>Gastos</Text>
            <Text style={s.statValue}>{fmt(st.gastos)}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statLabel}>Pendente</Text>
            <Text style={[s.statValue, st.pendente > 0 && { color: C.warn }]}>{fmt(st.pendente)}</Text>
          </View>
          <Pressable style={s.stat} onPress={() => setMonthModal(true)}>
            <Text style={s.statLabel}>Caju (à parte)</Text>
            <Text style={s.statValue}>{fmt(st.caju)}</Text>
          </Pressable>
        </View>

        {cats.length > 0 && (
          <View style={s.card}>
            <Text style={s.h2}>Para onde foi o dinheiro</Text>
            {cats.map((c) => (
              <View key={c.cat} style={{ marginTop: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={s.catName}>{c.cat}</Text>
                  <Text style={s.catValue}>
                    {fmt(c.total)} <Text style={{ color: C.muted }}> {pct(c.share)}</Text>
                  </Text>
                </View>
                <Meter value={c.share} color={C.inkSoft} height={6} />
              </View>
            ))}
          </View>
        )}

        <View style={{ paddingHorizontal: 20, marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={s.h2}>Lançamentos</Text>
          <View style={s.filter}>
            {([['todos', 'Todos'], ['pendentes', 'Pendentes']] as [Filtro, string][]).map(([k, l]) => (
              <Pressable key={k} onPress={() => setFiltro(k)} style={[s.filterItem, filtro === k && { backgroundColor: C.ink }]}>
                <Text style={[s.filterText, filtro === k && { color: C.onInk }]}>{l}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[s.card, { paddingVertical: 4, marginTop: 12 }]}>
          {lista.length === 0 && <Text style={s.empty}>{filtro === 'pendentes' ? 'Nada pendente neste mês.' : 'Nenhum gasto lançado. Toque em “Novo gasto”.'}</Text>}
          {lista.map((i, idx) => (
            <Pressable key={i.id} onPress={() => setItemModal({ open: true, item: i })} style={[s.row, idx > 0 && s.rowBorder]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={s.rowTitle} numberOfLines={1}>{i.desc}</Text>
                <Text style={s.rowSub} numberOfLines={1}>
                  {[i.cat || 'Sem categoria', i.parcela && `parcela ${i.parcela}`].filter(Boolean).join(' · ')}
                </Text>
                {i.valorAlt != null && i.valorAlt !== i.valor && <Text style={s.rowAlt}>Valor alt.: {fmt(i.valorAlt)}</Text>}
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={s.rowValue}>{fmt(i.valor)}</Text>
                <Pressable
                  hitSlop={8}
                  onPress={() => dispatch({ type: 'toggleStatus', month, id: i.id })}
                  style={[s.badge, i.status === 'Pago' ? { backgroundColor: C.posBg } : i.status === 'Pendente' ? { backgroundColor: C.warnBg } : { backgroundColor: C.bg }]}
                >
                  <Text style={[s.badgeText, { color: i.status === 'Pago' ? C.pos : i.status === 'Pendente' ? C.warn : C.muted }]}>
                    {i.status || 'Sem status'}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable style={s.fab} onPress={() => setItemModal({ open: true, item: null })}>
        <Ionicons name="add" size={22} color={C.onInk} />
        <Text style={s.fabText}>Novo gasto</Text>
      </Pressable>

      <ItemModal
        visible={itemModal.open}
        item={itemModal.item}
        categorias={config.categorias}
        onClose={() => setItemModal({ open: false, item: null })}
        onSave={(item) => {
          dispatch({ type: 'saveItem', month, item });
          setItemModal({ open: false, item: null });
        }}
        onDelete={(id) => {
          dispatch({ type: 'deleteItem', month, id });
          setItemModal({ open: false, item: null });
        }}
      />
      <MonthModal
        visible={monthModal}
        title={`Renda de ${MESES[month - 1]}`}
        month={m}
        onClose={() => setMonthModal(false)}
        onSave={(patch) => {
          dispatch({ type: 'setMonth', month, patch });
          setMonthModal(false);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '800', color: C.ink, paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  h2: { fontSize: 18, fontWeight: '700', color: C.ink },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: C.surface },
  chipText: { fontWeight: '700', color: C.inkSoft, fontSize: 14 },
  hero: { backgroundColor: C.ink, marginHorizontal: 20, borderRadius: R.lg, padding: 22 },
  heroLabel: { color: C.onInkMuted, fontSize: 15, fontWeight: '600' },
  heroValue: { color: C.onInk, fontSize: 40, fontWeight: '800', marginTop: 4, letterSpacing: -1, ...num },
  heroSub: { color: C.onInkMuted, fontSize: 13, fontWeight: '600' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginTop: 12 },
  stat: { width: '48%', flexGrow: 1, backgroundColor: C.surface, borderRadius: R.md, padding: 14 },
  statLabel: { color: C.muted, fontSize: 13, fontWeight: '600' },
  statValue: { color: C.ink, fontSize: 18, fontWeight: '700', marginTop: 4, ...num },
  statHint: { color: C.muted, fontSize: 11, marginTop: 4 },
  card: { backgroundColor: C.surface, marginHorizontal: 20, marginTop: 20, borderRadius: R.lg, padding: 18 },
  catName: { color: C.ink, fontWeight: '600', fontSize: 15 },
  catValue: { color: C.ink, fontWeight: '700', fontSize: 14, ...num },
  filter: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, padding: 3 },
  filterItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 17 },
  filterText: { fontSize: 13, fontWeight: '700', color: C.muted },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  rowTitle: { color: C.ink, fontSize: 16, fontWeight: '600' },
  rowSub: { color: C.muted, fontSize: 13, marginTop: 2 },
  rowAlt: { color: C.muted, fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  rowValue: { color: C.ink, fontSize: 16, fontWeight: '700', ...num },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  empty: { color: C.muted, textAlign: 'center', paddingVertical: 24 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.ink,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: C.onInk, fontWeight: '700', fontSize: 15 },
});
