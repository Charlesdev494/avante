/**
 * GAD-7 — Medidor de gravidade da ansiedade (0–21).
 *
 * Faixas:
 *   0–4   Mínimo                → verde
 *   5–9   Leve                  → amarelo
 *   10–14 Moderado              → âmbar
 *   15–21 Grave                 → vermelho
 *
 * Ponto de corte clínico: ≥ 10 sugere ansiedade clinicamente relevante.
 */

const MAX = 21;

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
    max: 4,
    label: "Mínimo",
    hex: "#10b981",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    tip: "Pode existir ansiedade normal/adaptativa. Pouca repercussão ansiosa — reavaliar conforme contexto.",
  },
  {
    min: 5,
    max: 9,
    label: "Leve",
    hex: "#eab308",
    chip: "bg-yellow-100 text-yellow-800 border-yellow-200",
    tip: "Sintomas iniciais: preocupação, tensão, dificuldade de desligar. Comum em dor persistente, estresse ocupacional e insônia.",
  },
  {
    min: 10,
    max: 14,
    label: "Moderado",
    hex: "#f59e0b",
    chip: "bg-amber-100 text-amber-900 border-amber-200",
    tip: "Acima do ponto de corte (≥ 10). Ansiedade interfere no sono, concentração, tolerância à dor e qualidade de vida — indicar manejo estruturado, regulação, atividade física e psicoterapia.",
  },
  {
    min: 15,
    max: 21,
    label: "Grave",
    hex: "#e11d48",
    chip: "bg-rose-100 text-rose-800 border-rose-200",
    tip: "Ansiedade importante: hipervigilância, crises autonômicas, sensação constante de ameaça, fadiga e somatização. Amplifica a sensibilização central da dor — avaliação especializada e tratamento ativo.",
  },
];

function bandFor(score: number): Band {
  return BANDS.find((b) => score >= b.min && score <= b.max) ?? BANDS[0];
}

export function Gad7Gauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(MAX, score));
  const pct = (clamped / MAX) * 100;
  const band = bandFor(clamped);

  return (
    <div className="mt-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            GAD-7 — Sintomas de ansiedade
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums" style={{ color: band.hex }}>
              {clamped}
            </span>
            <span className="text-sm text-muted-foreground">/ {MAX}</span>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${band.chip}`}>
          {band.label}
        </span>
      </div>

      {/* Barra segmentada */}
      <div className="relative">
        <div className="flex h-4 w-full overflow-hidden rounded-full border">
          {BANDS.map((b) => {
            const width = ((b.max - b.min + 1) / (MAX + 1)) * 100;
            const active = b.label === band.label;
            return (
              <div
                key={b.label}
                className="transition-opacity"
                style={{
                  width: `${width}%`,
                  backgroundColor: b.hex,
                  opacity: active ? 1 : 0.28,
                }}
                aria-label={`${b.label} ${b.min}-${b.max}`}
              />
            );
          })}
        </div>

        {/* Marcador */}
        <div
          className="absolute -top-1 -translate-x-1/2 transition-all"
          style={{ left: `${pct}%` }}
        >
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: band.hex }}
          >
            <span className="text-[10px] font-bold text-white tabular-nums">{clamped}</span>
          </div>
        </div>

        {/* Escala numérica */}
        <div className="mt-2 flex justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>0</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>21</span>
        </div>
      </div>

      {/* Legenda das faixas */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BANDS.map((b) => {
          const active = b.label === band.label;
          return (
            <div
              key={b.label}
              className={`rounded-lg border p-2 transition ${
                active ? "ring-2 ring-offset-1" : "opacity-70"
              }`}
              style={active ? { borderColor: b.hex, boxShadow: `inset 0 0 0 1px ${b.hex}` } : {}}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: b.hex }}
                  aria-hidden
                />
                <span className="text-[11px] font-semibold">{b.label}</span>
              </div>
              <div className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
                {b.min}–{b.max}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leitura clínica */}
      <div
        className="mt-4 rounded-lg border-l-4 bg-muted/40 p-3 text-xs text-foreground/80"
        style={{ borderLeftColor: band.hex }}
      >
        <span className="font-semibold">Leitura clínica: </span>
        {band.tip}
        {clamped >= 10 && (
          <div className="mt-1 text-foreground/70">
            <span className="font-semibold">Ponto de corte ≥ 10</span> — ansiedade clinicamente
            relevante, com impacto funcional significativo.
          </div>
        )}
      </div>
    </div>
  );
}
