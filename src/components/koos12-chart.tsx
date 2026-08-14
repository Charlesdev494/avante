/**
 * KOOS-12 — gráfico interpretativo das 3 subescalas (Dor, Função, QV).
 *
 * Cada subescala vai de 0 a 100, onde 100 = sem problemas.
 * Mostra:
 *   - barra horizontal por subescala (Dor / Função / Qualidade de vida)
 *   - barra do total (média das 3)
 *   - leitura clínica para cada faixa
 *
 * Referência das faixas: equivalente ao HOOS (Roos & Lohmander, 2003) —
 * <40 grave · 40–69 moderado · ≥70 função preservada.
 */
import { MultiRuler, type ScoreRulerProps } from "@/components/score-ruler";
import { HOOS_BANDS } from "@/components/score-bands";

export interface Koos12Subscales {
  dor?: number;
  funcao?: number;
  qualidade_vida?: number;
}

export function Koos12Chart({
  total,
  subscales,
}: {
  total: number;
  subscales: Koos12Subscales;
}) {
  const rulers: ScoreRulerProps[] = [
    {
      title: "Dor",
      subtitle: "Itens 1–4",
      score: Math.round(subscales.dor ?? 0),
      max: 100,
      bands: HOOS_BANDS,
      higherIsBetter: true,
      unit: "/100",
    },
    {
      title: "Função",
      subtitle: "Itens 5–8",
      score: Math.round(subscales.funcao ?? 0),
      max: 100,
      bands: HOOS_BANDS,
      higherIsBetter: true,
      unit: "/100",
    },
    {
      title: "Qualidade de vida",
      subtitle: "Itens 9–12",
      score: Math.round(subscales.qualidade_vida ?? 0),
      max: 100,
      bands: HOOS_BANDS,
      higherIsBetter: true,
      unit: "/100",
    },
    {
      title: "KOOS-12 total",
      subtitle: "Média das 3 subescalas",
      score: Math.round(total),
      max: 100,
      bands: HOOS_BANDS,
      higherIsBetter: true,
      unit: "/100",
    },
  ];

  return (
    <MultiRuler
      title="KOOS-12 — Joelho (Dor · Função · QV)"
      description="Quanto MAIOR, melhor o joelho. Acompanha o impacto da lesão / osteoartrite e a resposta ao tratamento."
      rulers={rulers}
    />
  );
}
