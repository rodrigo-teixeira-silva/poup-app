import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { C, R } from '../theme';
import { parseValor, valorToInput } from '../utils';
import { inputStyle } from '../components/Sheet';
import type { Config } from '../types';

export default function ConfigScreen() {
  const { state, dispatch } = useStore();
  const { config } = state;
  const [renda, setRenda] = useState(valorToInput(config.rendaBase));
  const [alerta, setAlerta] = useState(String(Math.round(config.alerta * 100)));
  const [nova, setNova] = useState('');

  const salvar = (patch: Partial<Config>) => dispatch({ type: 'setConfig', patch });

  const addCat = () => {
    const n = nova.trim();
    if (!n || config.categorias.includes(n)) return;
    salvar({ categorias: [...config.categorias, n] });
    setNova('');
  };

  const removeCat = (c: string) => salvar({ categorias: config.categorias.filter((x) => x !== c) });

  const restaurar = () =>
    Alert.alert('Restaurar dados da planilha?', 'Todos os lançamentos e alterações feitos no app serão substituídos pelos dados originais.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Restaurar',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'reset' });
          setRenda('6000');
          setAlerta('90');
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={s.h1}>Configurações</Text>

      <View style={s.card}>
        <Text style={s.label}>Renda mensal base (R$)</Text>
        <TextInput
          style={inputStyle}
          value={renda}
          onChangeText={setRenda}
          onEndEditing={() => salvar({ rendaBase: parseValor(renda) })}
          keyboardType="decimal-pad"
        />
        <Text style={[s.label, { marginTop: 16 }]}>Alertar quando os gastos passarem de (% da renda)</Text>
        <TextInput
          style={inputStyle}
          value={alerta}
          onChangeText={setAlerta}
          onEndEditing={() => {
            const v = Math.min(100, Math.max(1, parseInt(alerta, 10) || 90));
            setAlerta(String(v));
            salvar({ alerta: v / 100 });
          }}
          keyboardType="number-pad"
        />
      </View>

      <View style={s.card}>
        <Text style={s.h2}>Categorias</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {config.categorias.map((c) => (
            <View key={c} style={s.tag}>
              <Text style={s.tagText}>{c}</Text>
              <Pressable hitSlop={8} onPress={() => removeCat(c)}>
                <Ionicons name="close" size={16} color={C.muted} />
              </Pressable>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <TextInput style={[inputStyle, { flex: 1 }]} value={nova} onChangeText={setNova} placeholder="Nova categoria" placeholderTextColor={C.muted} onSubmitEditing={addCat} />
          <Pressable style={s.addBtn} onPress={addCat}>
            <Ionicons name="add" size={22} color={C.onInk} />
          </Pressable>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.h2}>Dados</Text>
        <Text style={{ color: C.muted, fontSize: 13, marginTop: 6, lineHeight: 19 }}>
          Tudo fica salvo neste aparelho. Os valores iniciais vieram da planilha Compromisso_melhorado.xlsx.
        </Text>
        <Pressable style={s.danger} onPress={restaurar}>
          <Text style={{ color: C.neg, fontWeight: '700', fontSize: 15 }}>Restaurar dados da planilha</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: '800', color: C.ink, paddingHorizontal: 20, marginTop: 8, marginBottom: 14 },
  h2: { fontSize: 18, fontWeight: '700', color: C.ink },
  card: { backgroundColor: C.surface, marginHorizontal: 20, marginTop: 12, borderRadius: R.lg, padding: 18 },
  label: { color: C.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bg, paddingLeft: 12, paddingRight: 8, paddingVertical: 7, borderRadius: 20 },
  tagText: { color: C.inkSoft, fontWeight: '600', fontSize: 14 },
  addBtn: { width: 48, borderRadius: R.sm, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  danger: { marginTop: 14, backgroundColor: C.negBg, borderRadius: R.md, paddingVertical: 13, alignItems: 'center' },
});
