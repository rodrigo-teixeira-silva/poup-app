import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { C, R, num } from '../theme';
import { MESES, fmt, pct, monthStats } from '../utils';
import Meter from '../components/Meter';
import type { TabKey } from '../types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ACOES: { label: string; icon: IconName; tab: TabKey }[] = [
  { label: 'Novo gasto', icon: 'add', tab: 'mes' },
  { label: 'Pendentes', icon: 'time-outline', tab: 'mes' },
  { label: 'Parcelas', icon: 'layers-outline', tab: 'parcelas' },
  { label: 'Categorias', icon: 'pie-chart-outline', tab: 'mes' },
];

interface Props {
  month: number;
  onNavigate: (tab: TabKey) => void;
}

export default function HomeScreen({ month, onNavigate }: Props) {
  const { state } = useStore();
  const { config } = state;
  const m = state.months[month];
  const st = monthStats(m, config);
  const alerta = st.pctGasto > config.alerta;
  const pendentes = m.items.filter((i) => i.status === 'Pendente');
  const recentes = [...m.items].reverse().slice(0, 3);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={s.header}>
        <View style={s.topRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={s.logo}>
              <Text style={s.logoText}>P</Text>
            </View>
            <View>
              <Text style={s.brand}>Poup</Text>
              <Text style={s.sub}>Olá! {MESES[month - 1]} de 2026</Text>
            </View>
          </View>
          <Pressable accessibilityLabel="Notificações" style={s.bell}>
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={[s.sub, { marginTop: 26, fontSize: 15 }]}>Positivo do mês</Text>
        <Text style={[s.balance, st.positivo < 0 && { color: '#FFB4AB' }]}>{fmt(st.positivo)}</Text>

        <View style={{ marginTop: 14 }}>
          <Meter
            value={st.pctGasto}
            color={alerta ? '#FF8A7A' : '#6FD3A5'}
            mark={config.alerta}
            markColor="#FFFFFF"
            track="rgba(255,255,255,0.18)"
            height={8}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={s.small}>{pct(st.pctGasto)} da renda gasta</Text>
            <Text style={s.small}>alerta em {pct(config.alerta)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <View style={s.mini}>
            <Text style={s.small}>Renda</Text>
            <Text style={s.miniValue}>{fmt(st.renda)}</Text>
          </View>
          <View style={s.mini}>
            <Text style={s.small}>Gastos</Text>
            <Text style={s.miniValue}>{fmt(st.gastos)}</Text>
          </View>
        </View>
      </View>

      <View style={s.actions}>
        {ACOES.map((a) => (
          <Pressable key={a.label} style={s.action} onPress={() => onNavigate(a.tab)}>
            <View style={s.actionIcon}>
              <Ionicons name={a.icon} size={24} color={C.ink} />
            </View>
            <Text style={s.actionLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      {pendentes.length > 0 && (
        <Pressable style={s.banner} onPress={() => onNavigate('mes')}>
          <Text style={s.bannerText}>
            {pendentes.length} {pendentes.length === 1 ? 'lançamento pendente' : 'lançamentos pendentes'}
          </Text>
          <Text style={s.bannerValue}>{fmt(st.pendente)}</Text>
        </Pressable>
      )}

      <View style={s.listHead}>
        <Text style={s.h2}>Últimos lançamentos</Text>
        <Pressable hitSlop={10} onPress={() => onNavigate('mes')}>
          <Text style={s.link}>Ver todos</Text>
        </Pressable>
      </View>

      <View style={s.card}>
        {recentes.length === 0 && <Text style={s.empty}>Nenhum gasto lançado neste mês.</Text>}
        {recentes.map((i, idx) => (
          <View key={i.id} style={[s.row, idx > 0 && s.rowBorder]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={s.rowTitle} numberOfLines={1}>{i.desc}</Text>
              <Text style={s.rowSub} numberOfLines={1}>
                {[i.cat || 'Sem categoria', i.parcela && `parcela ${i.parcela}`].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={s.rowValue}>{fmt(i.valor)}</Text>
              <View style={[s.badge, { backgroundColor: i.status === 'Pago' ? C.posBg : i.status === 'Pendente' ? C.warnBg : C.bg }]}>
                <Text style={[s.badgeText, { color: i.status === 'Pago' ? C.pos : i.status === 'Pendente' ? C.warn : C.muted }]}>
                  {i.status || 'Sem status'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: C.ink, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 56 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: C.ink, fontSize: 26, fontWeight: '800' },
  brand: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: C.onInkMuted, fontSize: 13, fontWeight: '600' },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  balance: { color: '#FFFFFF', fontSize: 38, fontWeight: '800', letterSpacing: -1, marginTop: 2, ...num },
  small: { color: C.onInkMuted, fontSize: 12, fontWeight: '600' },
  mini: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: R.md, padding: 12 },
  miniValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 3, ...num },
  actions: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -34,
    backgroundColor: C.surface,
    borderRadius: R.lg,
    paddingVertical: 16,
    paddingHorizontal: 8,
    elevation: 6,
    shadowColor: C.ink,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  action: { flex: 1, alignItems: 'center', gap: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#E3EAFF', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: C.ink, fontSize: 12, fontWeight: '700' },
  banner: { marginHorizontal: 20, marginTop: 12, backgroundColor: C.warnBg, borderRadius: R.md, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerText: { color: '#5C3A00', fontSize: 14, fontWeight: '600' },
  bannerValue: { color: '#5C3A00', fontSize: 15, fontWeight: '800', ...num },
  listHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20 },
  h2: { fontSize: 17, fontWeight: '700', color: C.ink },
  link: { color: C.ink, fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: C.surface, marginHorizontal: 20, marginTop: 10, borderRadius: R.lg, paddingHorizontal: 16, paddingVertical: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
  rowTitle: { color: C.ink, fontSize: 15, fontWeight: '600' },
  rowSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  rowValue: { color: C.ink, fontSize: 15, fontWeight: '700', ...num },
  badge: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: { color: C.muted, textAlign: 'center', paddingVertical: 24 },
});
