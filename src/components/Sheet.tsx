import React from 'react';
import type { ReactNode } from 'react';
import { Modal, View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { C, R } from '../theme';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Sheet({ visible, title, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.wrap}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.grab} />
          <Text style={s.title}>{title}</Text>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={s.label}>{label}</Text>
    {children}
  </View>
);

interface SegmentedProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
  <View style={s.seg}>
    {options.map((o) => {
      const on = o.value === value;
      return (
        <Pressable key={o.value} onPress={() => onChange(o.value)} style={[s.segItem, on && s.segOn]}>
          <Text style={[s.segText, on && { color: C.onInk }]}>{o.label}</Text>
        </Pressable>
      );
    })}
  </View>
  );
}

interface BtnProps {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'danger' | 'ghost';
  style?: StyleProp<ViewStyle>;
}

export const Btn = ({ label, onPress, kind = 'primary', style }: BtnProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      s.btn,
      kind === 'primary' && { backgroundColor: C.ink },
      kind === 'danger' && { backgroundColor: C.negBg },
      kind === 'ghost' && { backgroundColor: 'transparent' },
      pressed && { opacity: 0.8 },
      style,
    ]}
  >
    <Text style={[s.btnText, kind === 'primary' && { color: C.onInk }, kind === 'danger' && { color: C.neg }]}>{label}</Text>
  </Pressable>
);

export const inputStyle: TextStyle = {
  backgroundColor: C.bg,
  borderRadius: R.sm,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 16,
  color: C.ink,
};

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16,33,28,0.45)' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: R.lg,
    borderTopRightRadius: R.lg,
    padding: 20,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 16 },
  label: { fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: '600' },
  seg: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: R.sm, padding: 3 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: R.sm - 2 },
  segOn: { backgroundColor: C.ink },
  segText: { fontSize: 14, fontWeight: '600', color: C.muted },
  btn: { borderRadius: R.md, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnText: { fontSize: 16, fontWeight: '700', color: C.ink },
});
