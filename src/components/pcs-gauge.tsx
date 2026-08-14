/**
 * PCS — Gauge de severidade da Catastrofização da Dor.
 *
 * Faixas (0–52):
 *   0–10  Muito baixo / mínimo        → verde
 *   11–20 Leve                        → âmbar claro
 *   21–30 Moderado                    → laranja
 *   31–52 Elevado / clinicamente rel. → vermelho
 *
 * Mostra uma barra com gradiente, marcadores das faixas e um "alfinete"
 * indicando onde o paciente está. Inclui leitura por extenso e dica clínica.
 */

const MAX = 52;

type Band = {
  min: number;
  max: number;
  label: string;
  short: string;
  color: string; // tailwind classes for chip
  hex: string; // gradient stop / pin color
  tip: string;
};

const BANDS: Band[] = [
  {
    min: 0,
    max: 10,
    label: "Muito baixo / mínimo",
    short: "Mínimo",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    hex: "#10b981",
    tip: "Padrão de pensamento adaptativo. Reforçar estratégias ativas e autoeficácia.",
  },
  {
    min: 11,
    max: 20,
    label: "Leve",
    short: "Leve",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    hex: "#f59e0b",
    tip: "Sinais discretos de ruminação. Educação em dor e exposição gradual ao movimento.",
  },
  {
    min: 21,
    max: 30,
    label: "Moderado",
    short: "Moderado",
    color: "bg-orange-100 text-orange-900 border-orange-200",
    hex: "#f97316",
    tip: "Catastrofização relevante. Considere abordagem cognitivo-comportamental associada.",
  },
  {
    min: 31,
    max: 52,
    label: "Elevado / clinicamente relevante",
    short: "Elevado",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    hex: "#e11d48",
    tip: "Alto risco de cronificação e pior prognóstico. Encaminhamento psicológico recomendado.",
  },
];

function bandFor(score: number): Band {
  return BANDS.find((b) => score >= b.min && score <= b.max) ?? BANDS[0];
}

export function PcsGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(MAX, score));
  const pct = (clamped / MAX) * 100;
  const band = bandFor(clamped);

  return (
    <div className="mt-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            PCS — Catastrofização da dor
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: band.hex }}
            >
              {clamped}
            </span>
            <span className="text-sm text-muted-foreground">/ {MAX}</span>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${band.color}`}
        >
          {band.label}
        </span>
      </div>

      {/* Barra com gradiente */}
      <div className="relative">
        <div
          className="h-4 w-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #10b981 0%, #10b981 19.2%, #f59e0b 19.2%, #f59e0b 38.5%, #f97316 38.5%, #f97316 57.7%, #e11d48 57.7%, #e11d48 100%)",
          }}
          aria-hidden
        />

        {/* Marcador do paciente */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pct}%` }}
        >
          <div
            className="h-7 w-7 rounded-full border-[3px] border-white shadow-lg ring-2"
            style={{
              backgroundColor: band.hex,
              boxShadow: `0 0 0 2px ${band.hex}`,
            }}
            aria-label={`Paciente: ${clamped} de ${MAX}`}
          />
        </div>

        {/* Linhas guias entre faixas */}
        {[10, 20, 30].map((tick) => (
          <div
            key={tick}
            className="absolute top-0 h-4 w-px bg-white/70"
            style={{ left: `${(tick / MAX) * 100}%` }}
            aria-hidden
          />
        ))}
      </div>

      {/* Escala numérica */}
      <div className="relative mt-1 h-4 text-[10px] text-muted-foreground">
        {[0, 10, 20, 30, 52].map((tick) => (
          <span
            key={tick}
            className="absolute -translate-x-1/2 tabular-nums"
            style={{ left: `${(tick / MAX) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      </div>

      {/* Legenda das faixas */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BANDS.map((b) => {
          const active = b.short === band.short;
          return (
            <div
              key={b.short}
              className={`rounded-lg border p-2 text-xs transition ${
                active
                  ? "border-foreground/20 bg-muted/60 shadow-sm"
                  : "border-border opacity-70"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: b.hex }}
                />
                <span className="font-semibold text-foreground">{b.short}</span>
              </div>
              <div className="mt-0.5 tabular-nums text-muted-foreground">
                {b.min}–{b.max}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dica clínica da faixa atual */}
      <div
        className="mt-3 rounded-lg border-l-4 bg-muted/40 p-3 text-xs text-foreground/80"
        style={{ borderLeftColor: band.hex }}
      >
        <span className="font-semibold">Leitura clínica: </span>
        {band.tip}
      </div>
    </div>
  );
}
