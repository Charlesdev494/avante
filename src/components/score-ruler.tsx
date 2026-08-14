/**
 * ScoreRuler — régua interpretativa genérica.
 *
 * Mostra uma barra horizontal segmentada com faixas coloridas que representam
 * a interpretação clínica (ex.: leve / moderado / grave). Um marcador escuro
 * indica a pontuação do paciente, e abaixo da barra aparece a leitura clínica
 * correspondente à faixa em que ele caiu.
 *
 * Usada em todos os questionários que não possuem um componente visual próprio,
 * para que paciente e médico tenham uma referência clara do significado da nota.
 */

export type RulerTone = "good" | "watch" | "moderate" | "alert" | "critical";

const TONE_COLOR: Record<RulerTone, string> = {
  good: "#16a34a",      // verde
  watch: "#eab308",     // amarelo
  moderate: "#f59e0b",  // âmbar
  alert: "#ef4444",     // vermelho claro
  critical: "#b91c1c",  // vermelho escuro
};

const TONE_CHIP: Record<RulerTone, string> = {
  good: "bg-emerald-50 text-emerald-800 border-emerald-200",
  watch: "bg-yellow-50 text-yellow-800 border-yellow-200",
  moderate: "bg-amber-50 text-amber-900 border-amber-200",
  alert: "bg-rose-50 text-rose-800 border-rose-200",
  critical: "bg-red-100 text-red-900 border-red-300",
};

export interface Band {
  /** Início da faixa (incluído). */
  from: number;
  /** Fim da faixa (incluído). */
  to: number;
  /** Rótulo curto (ex.: "Leve", "Moderada", "Grave"). */
  label: string;
  /** Tom semântico — define a cor da faixa e do chip de leitura. */
  tone: RulerTone;
  /** Texto adicional para a leitura clínica quando esta faixa for ativa. */
  tip?: string;
}

export interface ScoreRulerProps {
  title: string;
  subtitle?: string;
  score: number;
  max: number;
  min?: number;
  bands: Band[];
  /**
   * Quando true, valores mais altos = melhor (ex.: HOOS, KOOS, WHOQOL).
   * Apenas afeta o texto auxiliar "↑ = melhor / ↓ = melhor".
   */
  higherIsBetter?: boolean;
  /** Unidade exibida após a pontuação (ex.: "%", "/21"). Se ausente, usa /max. */
  unit?: string;
  /** Observação clínica extra exibida sob a leitura. */
  note?: string;
}

function bandFor(score: number, bands: Band[]): Band {
  return bands.find((b) => score >= b.from && score <= b.to) ?? bands[bands.length - 1];
}

export function ScoreRuler({
  title,
  subtitle,
  score,
  max,
  min = 0,
  bands,
  higherIsBetter,
  unit,
  note,
}: ScoreRulerProps) {
  const range = max - min;
  const clamped = Math.max(min, Math.min(max, score));
  const pct = range > 0 ? ((clamped - min) / range) * 100 : 0;
  const band = bandFor(clamped, bands);
  const unitText = unit ?? `/${max}`;

  return (
    <div className="mt-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </div>
          {subtitle && (
            <div className="text-[11px] text-muted-foreground">{subtitle}</div>
          )}
          <div className="mt-0.5 flex items-baseline gap-2">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: TONE_COLOR[band.tone] }}
            >
              {Number.isInteger(clamped) ? clamped : clamped.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">{unitText}</span>
            {higherIsBetter !== undefined && (
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {higherIsBetter ? "↑ = melhor" : "↓ = melhor"}
              </span>
            )}
          </div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TONE_CHIP[band.tone]}`}
        >
          {band.label}
        </span>
      </div>

      {/* Barra segmentada */}
      <div className="relative">
        <div className="flex h-3.5 w-full overflow-hidden rounded-full border">
          {bands.map((b) => {
            const w = ((b.to - b.from + 1) / (range + 1)) * 100;
            const active = b.label === band.label;
            return (
              <div
                key={b.label}
                style={{
                  width: `${w}%`,
                  backgroundColor: TONE_COLOR[b.tone],
                  opacity: active ? 1 : 0.3,
                }}
                aria-label={`${b.label} ${b.from}–${b.to}`}
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
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: TONE_COLOR[band.tone] }}
          >
            <span className="text-[9px] font-bold leading-none text-white tabular-nums">
              {Number.isInteger(clamped) ? clamped : clamped.toFixed(0)}
            </span>
          </div>
        </div>
        {/* Escala */}
        <div className="mt-2 flex justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>{min}</span>
          {bands.slice(0, -1).map((b) => (
            <span key={`tick-${b.to}`}>{b.to}</span>
          ))}
          <span>{max}</span>
        </div>
      </div>

      {/* Legenda das faixas */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {bands.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: TONE_COLOR[b.tone] }}
              aria-hidden
            />
            {b.label} {b.from}–{b.to}
          </span>
        ))}
      </div>

      {/* Leitura clínica */}
      <div
        className="mt-3 rounded-md border-l-4 bg-muted/40 p-3 text-xs text-foreground/80"
        style={{ borderLeftColor: TONE_COLOR[band.tone] }}
      >
        <span className="font-semibold">Leitura clínica: </span>
        {band.tip ?? `Pontuação na faixa "${band.label.toLowerCase()}".`}
        {note && <div className="mt-1 text-foreground/70">{note}</div>}
      </div>
    </div>
  );
}

/**
 * MultiRuler — agrupa várias réguas (uma por subescala) sob um título comum.
 */
export function MultiRuler({
  title,
  description,
  rulers,
}: {
  title: string;
  description?: string;
  rulers: ScoreRulerProps[];
}) {
  return (
    <div className="mt-3 space-y-3 rounded-lg border border-border bg-card p-4">
      <div>
        <div className="text-sm font-semibold text-secondary">{title}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      <div className="space-y-2">
        {rulers.map((r, i) => (
          <ScoreRuler key={i} {...r} />
        ))}
      </div>
    </div>
  );
}
