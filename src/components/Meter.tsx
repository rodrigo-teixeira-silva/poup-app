import React from 'react';
import { View } from 'react-native';
import { C } from '../theme';

// Barra de progresso.
interface Props {
  value: number;
  color: string;
  /** Posição (0–1) de um traço, usado para o limite de alerta. */
  mark?: number;
  height?: number;
  track?: string;
  markColor?: string;
}

export default function Meter({ value, color, mark, height = 8, track = C.line, markColor }: Props) {
  const w = Math.max(0, Math.min(1, value || 0)) * 100;
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'visible' }}>
      <View style={{ width: `${w}%`, height, borderRadius: height, backgroundColor: color }} />
      {mark != null && (
        <View
          style={{
            position: 'absolute',
            left: `${Math.min(1, mark) * 100}%`,
            top: -3,
            width: 2,
            height: height + 6,
            marginLeft: -1,
            backgroundColor: markColor || C.ink,
            borderRadius: 1,
          }}
        />
      )}
    </View>
  );
}
