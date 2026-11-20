import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED } from './data/seed';
import type { Action, AppState } from './types';

const KEY = '@compromissos2026:v1';

interface StoreValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  ready: boolean;
}

const Ctx = createContext<StoreValue | null>(null);
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function reducer(state: AppState, a: Action): AppState {
  switch (a.type) {
    case 'load':
      return a.state;
    case 'reset':
      return clone(SEED);
    case 'setConfig':
      return { ...state, config: { ...state.config, ...a.patch } };
    case 'setMonth':
      return { ...state, months: { ...state.months, [a.month]: { ...state.months[a.month], ...a.patch } } };
    case 'saveItem': {
      const m = state.months[a.month];
      const exists = m.items.some((i) => i.id === a.item.id);
      const items = exists
        ? m.items.map((i) => (i.id === a.item.id ? a.item : i))
        : [...m.items, { ...a.item, id: uid() }];
      return { ...state, months: { ...state.months, [a.month]: { ...m, items } } };
    }
    case 'deleteItem': {
      const m = state.months[a.month];
      return { ...state, months: { ...state.months, [a.month]: { ...m, items: m.items.filter((i) => i.id !== a.id) } } };
    }
    case 'toggleStatus': {
      const m = state.months[a.month];
      const items = m.items.map((i) =>
        i.id === a.id ? { ...i, status: i.status === 'Pago' ? ('Pendente' as const) : ('Pago' as const) } : i
      );
      return { ...state, months: { ...state.months, [a.month]: { ...m, items } } };
    }
    case 'saveParcela': {
      const exists = state.parcelas.some((p) => p.id === a.parcela.id);
      const parcelas = exists
        ? state.parcelas.map((p) => (p.id === a.parcela.id ? a.parcela : p))
        : [...state.parcelas, { ...a.parcela, id: uid() }];
      return { ...state, parcelas };
    }
    case 'deleteParcela':
      return { ...state, parcelas: state.parcelas.filter((p) => p.id !== a.id) };
    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, SEED, clone);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) dispatch({ type: 'load', state: JSON.parse(raw) as AppState });
      } catch {
        // sem dados salvos: segue com a planilha original
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  return <Ctx.Provider value={{ state, dispatch, ready }}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore deve ser usado dentro de <StoreProvider>');
  return v;
}
