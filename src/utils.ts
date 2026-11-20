import type {
  CategoryRow,
  Config,
  Item,
  MonthData,
  MonthStats,
  Parcela,
  ParcelaStats,
} from "./types";

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
export const MESES_CURTO = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

// R$ 1.234,56 (sem depender de Intl, que varia entre aparelhos)
export function fmt(v: number | null | undefined): string {
  const n = Number(v) || 0;
  const neg = n < 0;
  const [int, dec] = Math.abs(n).toFixed(2).split(".");
  return `${neg ? "−" : ""}R$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec}`;
}

export const pct = (v: number | null | undefined): string =>
  `${Math.round((v || 0) * 100)}%`;

export function parseValor(s: string): number {
  const n = parseFloat(String(s).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function valorToInput(v?: number): string {
  return v ? String(v).replace(".", ",") : "";
}

// Equivalentes às fórmulas das abas mensais
export function monthStats(
  m: MonthData | undefined,
  config: Config,
): MonthStats {
  const items = m?.items ?? [];
  const renda = config.rendaBase + (m?.rendaExtra ?? 0);
  const gastos = items.reduce((s, i) => s + i.valor, 0);
  const pendente = items
    .filter((i) => i.status === "Pendente")
    .reduce((s, i) => s + i.valor, 0);
  return {
    renda,
    gastos,
    positivo: renda - gastos,
    pendente,
    caju: m?.caju ?? 0,
    pctGasto: renda ? gastos / renda : 0,
  };
}

// Equivalente ao bloco "Categoria / Total / % dos gastos"
export function categoryTotals(
  items: Item[],
  categorias: string[],
): CategoryRow[] {
  const total = items.reduce((s, i) => s + i.valor, 0);
  const map: Record<string, number> = {};
  categorias.forEach((c) => (map[c] = 0));
  let sem = 0;
  items.forEach((i) => {
    if (i.cat && i.cat in map) map[i.cat] += i.valor;
    else sem += i.valor;
  });
  const rows = categorias.map((c) => ({ cat: c, total: map[c] }));
  if (sem > 0) rows.push({ cat: "Sem categoria", total: sem });
  return rows
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((r) => ({ ...r, share: total ? r.total / total : 0 }));
}

// Equivalente à aba "Parcelas"
export function parcelaStats(
  p: Parcela,
  today: Date = new Date(),
): ParcelaStats {
  const [y0, m0] = p.inicio.split("-").map(Number);
  const passados =
    (today.getFullYear() - y0) * 12 + (today.getMonth() + 1) - m0 + 1;
  const lancadas = Math.max(0, Math.min(p.total, passados));
  const restantes = p.total - lancadas;
  const fim = new Date(y0, m0 - 1 + p.total - 1, 1);
  return {
    lancadas,
    restantes,
    saldo: restantes * p.valor,
    totalValor: p.valor * p.total,
    ultima: `${MESES_CURTO[fim.getMonth()]}/${fim.getFullYear()}`,
    progresso: p.total ? lancadas / p.total : 0,
  };
}
