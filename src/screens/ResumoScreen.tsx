import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useStore } from '../store';
import { C, R, num } from '../theme';
import { MESES, fmt, pct, monthStats, parcelaStats } from '../utils';
import Meter from '../components/Meter';

interface Props {
  onOpenMonth: (m: number) => void;
}

export default function ResumoScreen({ onOpenMonth }: Props) {
  const { state } = useStore();
  const { config, parcelas } = state;

  const rows = MESES.map((nome, i) => ({ nome, n: i + 1, ...monthStats(state.months[i + 1], config) }));
  const total = rows.reduce(
    (a, r) => ({ renda: a.renda + r.renda, gastos: a.gastos + r.gastos, positivo: a.positivo + r.positivo, pendente: a.pendente + r.pendente, caju: a.caju + r.caju }),
    { renda: 0, gastos: 0, positivo: 0, pendente: 0, caju: 0 }
  );
  const maiorGasto = rows.reduce((a, b) => (b.gastos > a.gastos ? b : a));
  const menorPositivo = rows.reduce((a, b) => (b.positivo < a.positivo ? b : a));
  const saldoParcelas = parcelas.reduce((s, p) => s + parcelaStats(p).saldo, 0);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={s.h1}>Resumo de 2026</Text>

      <View style={s.hero}>
        <Text style={s.heroLabel}>Positivo no ano</Text>
        <Text style={[s.heroValue, total.positivo < 0 && { color: '#FFB4AB' }]}>{fmt(total.positivo)}</Text>
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 24 }}>
          <View>
            <Text style={s.heroSub}>Renda</Text>
            <Text style={s.heroSubValue}>{fmt(total.renda)}</Text>
          </View>
          <View>
            <Text style={s.heroSub}>Gastos</Text>
            <Text style={s.heroSubValue}>{fmt(total.gastos)}</Text>
          </View>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.h2}>Mês a mês</Text>
        <Text style={s.hint}>Toque em um mês para ver os lançamentos. O traço marca o limite de alerta.</Text>
        {rows.map((r, idx) => {
          const alerta = r.pctGasto > config.alerta;
          return (
            <Pressable key={r.n} onPress={() => onOpenMonth(r.n)} style={[s.row, idx > 0 && s.rowBorder]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={s.rowName}>{r.nome}</Text>
                <Text style={[s.rowPos, { color: r.positivo < 0 ? C.neg : C.pos }]}>{fmt(r.positivo)}</Text>
              </View>
              <Meter value={r.pctGasto} mark={config.alerta} color={alerta ? C.neg : C.pos} height={6} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={s.rowSub}>
                  gastou {fmt(r.gastos)} · {pct(r.pctGasto)}
                </Text>
                {r.pendente > 0 && <Text style={[s.rowSub, { color: C.warn, fontWeight: '700' }]}>pendente {fmt(r.pendente)}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={s.card}>
        <Text style={s.h2}>Destaques</Text>
        <Destaque label="Mês de maior gasto" main={maiorGasto.nome} sub={fmt(maiorGasto.gastos)} />
        <Destaque label="Mês com menor positivo" main={menorPositivo.nome} sub={fmt(menorPositivo.positivo)} />
        <Destaque label="Parcelas ainda a pagar" main={fmt(saldoParcelas)} />
        <Destaque label="Pendente no ano" main={fmt(total.pendente)} />
        <Destaque label="Caju no ano (à parte)" main={fmt(total.caju)} last />
      </View>
    </ScrollView>
  );
}

interface DestaqueProps {
  label: string;
  main: string;
  sub?: string;
  last?: boolean;
}

const Destaque = ({ label, main, sub, last }: DestaqueProps) => (
  <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line }]}>
    <Text style={{ color: C.muted, fontSize: 14, fontWeight: '600', flex: 1 }}>{label}</Text>
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ color: C.ink, fontWeight: '700', fontSize: 16, ...num }}>{main}</Text>
      {sub && <Text style={{ color: C.muted, fontSize: 12, ...num }}>{sub}</Text>}
    </View>
  </View>
);

const s = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '800', color: C.ink, paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  h2: { fontSize: 18, fontWeight: '700', color: C.ink },
  hint: { color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 6 },
  hero: { backgroundColor: C.ink, marginHorizontal: 20, borderRadius: R.lg, padding: 22 },
  heroLabel: { color: C.onInkMuted, fontSize: 15, fontWeight: '600' },
  heroValue: { color: C.onInk, fontSize: 38, fontWeight: '800', marginTop: 4, letterSpacing: -1, ...num },
  heroSub: { color: C.onInkMuted, fontSize: 13, fontWeight: '600' },
  heroSubValue: { color: C.onInk, fontSize: 17, fontWeight: '700', marginTop: 2, ...num },
  card: { backgroundColor: C.surface, marginHorizontal: 20, marginTop: 16, borderRadius: R.lg, padding: 18 },
  row: { paddingVertical: 14 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  rowName: { color: C.ink, fontSize: 16, fontWeight: '600' },
  rowPos: { fontSize: 16, fontWeight: '700', ...num },
  rowSub: { color: C.muted, fontSize: 12, ...num },
});
