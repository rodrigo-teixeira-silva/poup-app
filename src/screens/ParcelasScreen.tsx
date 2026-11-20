import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { C, R, num } from '../theme';
import { fmt, parcelaStats } from '../utils';
import Meter from '../components/Meter';
import ParcelaModal from '../components/ParcelaModal';
import type { Parcela } from '../types';

export default function ParcelasScreen() {
  const { state, dispatch } = useStore();
  const [modal, setModal] = useState<{ open: boolean; p: Parcela | null }>({ open: false, p: null });
  const close = () => setModal({ open: false, p: null });

  const list = state.parcelas.map((p) => ({ p, st: parcelaStats(p) }));
  const saldo = list.reduce((s, x) => s + x.st.saldo, 0);
  const totalGeral = list.reduce((s, x) => s + x.st.totalValor, 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <Text style={s.h1}>Parcelamentos</Text>

        <View style={s.hero}>
          <Text style={s.heroLabel}>Ainda a pagar</Text>
          <Text style={s.heroValue}>{fmt(saldo)}</Text>
          <Text style={s.heroSub}>de {fmt(totalGeral)} em compras parceladas</Text>
        </View>

        {list.map(({ p, st }) => {
          const quitado = st.restantes === 0;
          return (
            <Pressable key={p.id} style={s.card} onPress={() => setModal({ open: true, p })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.name}>{p.nome}</Text>
                <Text style={s.name}>{fmt(p.valor)}</Text>
              </View>
              <Text style={s.sub}>
                {quitado ? 'Quitado' : `${st.lancadas} de ${p.total} lançadas · faltam ${st.restantes}`}
              </Text>
              <View style={{ marginVertical: 12 }}>
                <Meter value={st.progresso} color={quitado ? C.pos : C.inkSoft} height={8} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.sub}>Última parcela: {st.ultima}</Text>
                <Text style={[s.sub, { color: C.ink, fontWeight: '700' }]}>{quitado ? '—' : `Saldo ${fmt(st.saldo)}`}</Text>
              </View>
            </Pressable>
          );
        })}

        <Text style={s.note}>
          A Renner não está aqui porque a contagem de parcelas muda entre os meses (há mais de uma compra). Adicione cada compra como um parcelamento separado, se quiser acompanhar.
        </Text>
      </ScrollView>

      <Pressable style={s.fab} onPress={() => setModal({ open: true, p: null })}>
        <Ionicons name="add" size={22} color={C.onInk} />
        <Text style={s.fabText}>Novo parcelamento</Text>
      </Pressable>

      <ParcelaModal
        visible={modal.open}
        parcela={modal.p}
        onClose={close}
        onSave={(parcela) => {
          dispatch({ type: 'saveParcela', parcela });
          close();
        }}
        onDelete={(id) => {
          dispatch({ type: 'deleteParcela', id });
          close();
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '800', color: C.ink, paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  hero: { backgroundColor: C.ink, marginHorizontal: 20, borderRadius: R.lg, padding: 22 },
  heroLabel: { color: C.onInkMuted, fontSize: 15, fontWeight: '600' },
  heroValue: { color: C.onInk, fontSize: 38, fontWeight: '800', marginTop: 4, letterSpacing: -1, ...num },
  heroSub: { color: C.onInkMuted, fontSize: 13, fontWeight: '600', marginTop: 6 },
  card: { backgroundColor: C.surface, marginHorizontal: 20, marginTop: 12, borderRadius: R.lg, padding: 18 },
  name: { color: C.ink, fontSize: 17, fontWeight: '700', ...num },
  sub: { color: C.muted, fontSize: 13, marginTop: 2, ...num },
  note: { color: C.muted, fontSize: 12, marginHorizontal: 24, marginTop: 20, lineHeight: 18 },
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
