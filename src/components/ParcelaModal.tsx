import React, { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import Sheet, { Field, Btn, inputStyle } from './Sheet';
import { C } from '../theme';
import { parseValor, valorToInput } from '../utils';
import type { Parcela } from '../types';

interface Form {
  nome: string;
  valor: string;
  total: string;
  inicio: string;
}

const EMPTY: Form = { nome: '', valor: '', total: '', inicio: '' };

interface Props {
  visible: boolean;
  parcela: Parcela | null;
  onSave: (p: Parcela) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function ParcelaModal({ visible, parcela, onSave, onDelete, onClose }: Props) {
  const [f, setF] = useState<Form>(EMPTY);

  useEffect(() => {
    if (!visible) return;
    setF(
      parcela
        ? { nome: parcela.nome, valor: valorToInput(parcela.valor), total: String(parcela.total), inicio: parcela.inicio }
        : EMPTY
    );
  }, [visible, parcela]);

  const set = (k: keyof Form) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const okInicio = /^\d{4}-(0[1-9]|1[0-2])$/.test(f.inicio);
  const can = f.nome.trim() && parseInt(f.total, 10) > 0 && okInicio;

  return (
    <Sheet visible={visible} title={parcela ? 'Editar parcelamento' : 'Novo parcelamento'} onClose={onClose}>
      <Field label="Item">
        <TextInput style={inputStyle} value={f.nome} onChangeText={set('nome')} placeholder="Ex.: TV" placeholderTextColor={C.muted} />
      </Field>
      <Field label="Valor da parcela (R$)">
        <TextInput style={inputStyle} value={f.valor} onChangeText={set('valor')} keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={C.muted} />
      </Field>
      <Field label="Número de parcelas">
        <TextInput style={inputStyle} value={f.total} onChangeText={set('total')} keyboardType="number-pad" placeholder="10" placeholderTextColor={C.muted} />
      </Field>
      <Field label="1ª parcela (AAAA-MM)">
        <TextInput style={inputStyle} value={f.inicio} onChangeText={set('inicio')} placeholder="2026-01" placeholderTextColor={C.muted} autoCapitalize="none" />
      </Field>
      <Btn
        label="Salvar"
        style={!can && { opacity: 0.4 }}
        onPress={() =>
          can &&
          onSave({
            id: parcela?.id ?? '',
            nome: f.nome.trim(),
            valor: parseValor(f.valor),
            total: parseInt(f.total, 10),
            inicio: f.inicio,
          })
        }
      />
      {parcela && <Btn kind="danger" label="Excluir parcelamento" onPress={() => onDelete(parcela.id)} />}
    </Sheet>
  );
}
