import React, { useEffect, useState } from 'react';
import { Text, TextInput } from 'react-native';
import Sheet, { Field, Btn, inputStyle } from './Sheet';
import { C } from '../theme';
import { parseValor, valorToInput } from '../utils';
import type { MonthData } from '../types';

interface Props {
  visible: boolean;
  title: string;
  month?: MonthData;
  onSave: (patch: Pick<MonthData, 'rendaExtra' | 'caju'>) => void;
  onClose: () => void;
}

export default function MonthModal({ visible, title, month, onSave, onClose }: Props) {
  const [extra, setExtra] = useState('');
  const [caju, setCaju] = useState('');

  useEffect(() => {
    if (visible) {
      setExtra(valorToInput(month?.rendaExtra));
      setCaju(valorToInput(month?.caju));
    }
  }, [visible, month]);

  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <Field label="Renda extra (Unip e outras)">
        <TextInput style={inputStyle} value={extra} onChangeText={setExtra} keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={C.muted} />
      </Field>
      <Field label="Caju (vale-alimentação, fora do cálculo)">
        <TextInput style={inputStyle} value={caju} onChangeText={setCaju} keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={C.muted} />
      </Field>
      <Btn label="Salvar" onPress={() => onSave({ rendaExtra: parseValor(extra), caju: parseValor(caju) })} />
    </Sheet>
  );
}
