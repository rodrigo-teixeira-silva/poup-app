export type TabKey = 'inicio' | 'resumo' | 'mes' | 'parcelas' | 'config';

export type Status = 'Pago' | 'Pendente' | '';

export interface Item {
  id: string;
  desc: string;
  cat: string;
  parcela: string;
  valor: number;
  status: Status;
  /** Segunda coluna de valores de Setembro/Outubro na planilha original. */
  valorAlt?: number;
}

export interface MonthData {
  rendaExtra: number;
  caju: number;
  items: Item[];
}

export interface Parcela {
  id: string;
  nome: string;
  valor: number;
  total: number;
  /** Mês da 1ª parcela no formato AAAA-MM. */
  inicio: string;
}

export interface Config {
  rendaBase: number;
  /** Fração da renda (0.9 = 90%). */
  alerta: number;
  categorias: string[];
}

export interface AppState {
  config: Config;
  /** Chave = número do mês (1–12). */
  months: Record<number, MonthData>;
  parcelas: Parcela[];
}

export interface MonthStats {
  renda: number;
  gastos: number;
  positivo: number;
  pendente: number;
  caju: number;
  pctGasto: number;
}

export interface CategoryRow {
  cat: string;
  total: number;
  share: number;
}

export interface ParcelaStats {
  lancadas: number;
  restantes: number;
  saldo: number;
  totalValor: number;
  ultima: string;
  progresso: number;
}

export type Action =
  | { type: 'load'; state: AppState }
  | { type: 'reset' }
  | { type: 'setConfig'; patch: Partial<Config> }
  | { type: 'setMonth'; month: number; patch: Partial<Omit<MonthData, 'items'>> }
  | { type: 'saveItem'; month: number; item: Item }
  | { type: 'deleteItem'; month: number; id: string }
  | { type: 'toggleStatus'; month: number; id: string }
  | { type: 'saveParcela'; parcela: Parcela }
  | { type: 'deleteParcela'; id: string };
