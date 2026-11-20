import React, { useEffect, useState } from 'react';
import { Text, TextInput, Pressable, View } from 'react-native';
import Sheet, { Field, Segmented, Btn, inputStyle } from './Sheet';
import { C, R } from '../theme';
import { parseValor, valorToInput } from '../utils';
import type { Item } from '../types';

interface Form {
  desc: string;
  cat: string;
  parcela: string;
  valor: string;
  status: 'Pago' | 'Pendente';
}

const EMPTY: Form = { desc: '', cat: '', parcela: '', valor: '', status: 'Pendente' };

interface Props {
  visible: boolean;
  item: Item | null;
  categorias: string[];
  onSave: (item: Item) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function ItemModal({ visible, item, categorias, onSave, onDelete, onClose }: Props) {
  const [f, setF] = useState<Form>(EMPTY);

  useEffect(() => {
    if (!visible) return;
    setF(
      item
        ? {
            desc: item.desc,
            cat: item.cat,
            parcela: item.parcela,
            valor: valorToInput(item.valor),
            status: item.status === 'Pago' ? 'Pago' : 'Pendente',
          }
        : EMPTY
    );
  }, [visible, item]);

  const set = <K extends keyof Form>(k: K) => (v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
  const canSave = f.desc.trim().length > 0;

  return (
    <Sheet visible={visible} title={item ? 'Editar gasto' : 'Novo gasto'} onClose={onClose}>
      <Field label="Descrição">
        <TextInput style={inputStyle} value={f.desc} onChangeText={set('desc')} placeholder="Ex.: Energia" placeholderTextColor={C.muted} />
      </Field>

      <Field label="Valor (R$)">
        <TextInput
          style={inputStyle}
          value={f.valor}
          onChangeText={set('valor')}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor={C.muted}
        />
      </Field>

      <Field label="Categoria">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categorias.map((c) => {
            const on = f.cat === c;
            return (
              <Pressable
                key={c}
                onPress={() => set('cat')(on ? '' : c)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: on ? C.ink : C.bg,
                }}
              >
                <Text style={{ color: on ? C.onInk : C.inkSoft, fontWeight: '600', fontSize: 14 }}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      <Field label="Parcela (opcional)">
        <TextInput style={inputStyle} value={f.parcela} onChangeText={set('parcela')} placeholder="Ex.: 3/10" placeholderTextColor={C.muted} />
      </Field>

      <Field label="Status">
        <Segmented
          value={f.status}
          onChange={set('status')}
          options={[
            { label: 'Pendente', value: 'Pendente' },
            { label: 'Pago', value: 'Pago' },
          ]}
        />
      </Field>

      <Btn
        label="Salvar gasto"
        onPress={() =>
          canSave &&
          onSave({
            ...item,
            id: item?.id ?? '',
            desc: f.desc.trim(),
            cat: f.cat,
            parcela: f.parcela,
            valor: parseValor(f.valor),
            status: f.status,
          })
        }
        style={!canSave && { opacity: 0.4 }}
      />
      {item && <Btn kind="danger" label="Excluir gasto" onPress={() => onDelete(item.id)} />}
    </Sheet>
  );
}
