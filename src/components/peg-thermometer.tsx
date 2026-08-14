/**
 * PEG — Pain, Enjoyment, General activity.
 *
 * Pontuação: média dos 3 itens (0–10).
 *   0.0 – 3.9  Impacto leve            → verde
 *   4.0 – 6.9  Impacto moderado        → âmbar
 *   7.0 – 10   Impacto grave           → vermelho
 *
 * Mostra a média num termômetro horizontal e as 3 subescalas
 * (intensidade da dor, prazer de viver, atividade geral) em mini-barras.
 */

const MAX = 10;

type Band = {
  min: number;
  max: number;
  label: string;
  hex: string;
  chip: string;
  tip: string;
};

const BANDS: Band[] = [
  {
    min: 0,
    max: 3.9,
    label: "Impacto leve",
    hex: "#10b981",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    tip: "Dor com pouca interferência no dia a dia. Manter plano atual e reavaliar periodicamente.",
  },
  {
    min: 4,
    max: 6.9,
    label: "Impacto moderado",
    hex: "#f59e0b",
    chip: "bg-amber-100 text-amber-900 border-amber-200",
    tip: "Interferência funcional relevante. Reforçar intervenções ativas (movimento, sono, manejo emocional) e considerar ajuste terapêutico.",
  },
  {
    min: 7,
    max: 10,
    label: "Impacto importante/severo",
    hex: "#e11d48",
    chip: "bg-rose-100 text-rose-800 border-rose-200",
    tip: "Dor com forte impacto em prazer e atividades. Indicar abordagem multimodal e reavaliar em curto prazo.",
  },
];

function bandFor(v: number): Band {
  return BANDS.find((b) => v >= b.min && v <= b.max) ?? BANDS[0];
}

const SUB_LABELS: Record<string, string> = {
  intensidade: "Intensidade da dor",
  prazer: "Prazer de viver",
  atividade: "Atividades em geral",
};

export function PegThermometer({
  score,
  subscales,
}: {
  score: number;
  subscales?: Record<string, number>;
}) {
  const clamped = Math.max(0, Math.min(MAX, score));
  const pct = (clamped / MAX) * 100;
  const band = bandFor(clamped);

  return (
    <div className="mt-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            PEG — Impacto da dor (média)
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: band.hex }}
            >
              {clamped.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/ {MAX}</span>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${band.chip}`}
        >
          {band.label}
        </span>
      </div>

      {/* Barra com gradiente e marcador */}
      <div className="relative">
        <div
          className="h-4 w-full overflow-hidden rounded-full border"
          style={{
            background:
              "linear-gradient(90deg, #10b981 0%, #10b981 39%, #f59e0b 40%, #f59e0b 69%, #e11d48 70%, #e11d48 100%)",
          }}
          aria-hidden
        />
        {/* Marcador */}
        <div
          className="absolute -top-1 h-6 w-1.5 -translate-x-1/2 rounded-full border border-white shadow"
          style={{ left: `${pct}%`, backgroundColor: band.hex }}
          aria-label={`Média ${clamped.toFixed(1)} de ${MAX}`}
        />
        {/* Linhas de corte */}
        {[4, 7].map((v) => (
          <div
            key={v}
            className="absolute top-0 h-4 w-px bg-white/70"
            style={{ left: `${(v / MAX) * 100}%` }}
            aria-hidden
          />
        ))}
        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>0</span>
          <span>4</span>
          <span>7</span>
          <span>10</span>
        </div>
      </div>

      {/* Subescalas */}
      {subscales && (
        <div className="mt-4 space-y-2">
          {(["intensidade", "prazer", "atividade"] as const).map((key) => {
            const v = Number(subscales[key] ?? 0);
            const sBand = bandFor(v);
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-xs text-muted-foreground">
                  {SUB_LABELS[key]}
                </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(v / MAX) * 100}%`,
                      backgroundColor: sBand.hex,
                    }}
                  />
                </div>
                <span
                  className="w-8 text-right text-xs font-semibold tabular-nums"
                  style={{ color: sBand.hex }}
                >
                  {v}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Dica clínica */}
      <div
        className="mt-4 rounded-lg border-l-4 bg-muted/40 p-3 text-xs text-foreground/80"
        style={{ borderLeftColor: band.hex }}
      >
        <span className="font-semibold">Leitura clínica: </span>
        {band.tip}
      </div>

      {/* Como é calculado + tabela de interpretação */}
      <details className="mt-3 rounded-lg border bg-muted/20 p-3 text-xs">
        <summary className="cursor-pointer font-semibold text-foreground/80">
          Como é calculado e interpretado
        </summary>
        <div className="mt-2 space-y-3 text-foreground/80">
          <div>
            <div className="mb-1 font-semibold">Cálculo</div>
            <p>
              Soma dos 3 itens dividida por 3 (média 0–10).{" "}
              {subscales && (
                <span className="text-muted-foreground">
                  Ex.: ({Number(subscales.intensidade ?? 0)} +{" "}
                  {Number(subscales.prazer ?? 0)} +{" "}
                  {Number(subscales.atividade ?? 0)}) ÷ 3 ={" "}
                  <span className="font-semibold text-foreground">
                    {clamped.toFixed(1)}
                  </span>
                </span>
              )}
            </p>
          </div>
          <div>
            <div className="mb-1 font-semibold">Faixas de interpretação</div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-1 pr-3 font-medium">Score</th>
                  <th className="py-1 font-medium">Interpretação</th>
                </tr>
              </thead>
              <tbody>
                {BANDS.map((b) => {
                  const active = b.label === band.label;
                  return (
                    <tr
                      key={b.label}
                      className={`border-t ${active ? "font-semibold" : ""}`}
                    >
                      <td className="py-1 pr-3 tabular-nums">
                        <span
                          className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                          style={{ backgroundColor: b.hex }}
                        />
                        {b.min}–{b.max === 3.9 ? 3 : b.max === 6.9 ? 6 : 10}
                      </td>
                      <td className="py-1" style={active ? { color: b.hex } : undefined}>
                        {b.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground">
            O PEG muda o foco de <em>“quanto dói?”</em> para{" "}
            <em>“quanto a dor está interferindo na vida?”</em> — por isso é útil
            no acompanhamento longitudinal da dor crônica.
          </p>
        </div>
      </details>
    </div>
  );
}
