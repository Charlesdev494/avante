/**
 * PHQ-9 — Termômetro de gravidade dos sintomas depressivos.
 *
 * Faixas (0–27):
 *   0–4   Mínimo / ausência              → verde
 *   5–9   Leve                           → amarelo
 *   10–14 Moderado                       → âmbar
 *   15–19 Moderadamente grave            → laranja
 *   20–27 Grave                          → vermelho
 *
 * Ponto de corte clínico mais importante: ≥ 10.
 * Item 9 positivo (qualquer valor > 0) sempre exige avaliação de risco.
 */

const MAX = 27;

type Band = {
  min: number;
  max: number;
  label: string;
  short: string;
  hex: string;
  chip: string;
  tip: string;
};

const BANDS: Band[] = [
  {
    min: 0,
    max: 4,
    label: "Mínimo / ausência",
    short: "Mínimo",
    hex: "#10b981",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    tip: "Sem sintomas depressivos relevantes. Reavaliar periodicamente conforme o contexto clínico.",
  },
  {
    min: 5,
    max: 9,
    label: "Leve",
    short: "Leve",
    hex: "#eab308",
    chip: "bg-yellow-100 text-yellow-800 border-yellow-200",
    tip: "Sintomas leves. Vigilância clínica, psicoeducação e seguimento próximo.",
  },
  {
    min: 10,
    max: 14,
    label: "Moderado",
    short: "Moderado",
    hex: "#f59e0b",
    chip: "bg-amber-100 text-amber-900 border-amber-200",
    tip: "Acima do ponto de corte (≥ 10). Considere intervenção psicoterápica e avaliar farmacoterapia.",
  },
  {
    min: 15,
    max: 19,
    label: "Moderadamente grave",
    short: "Mod. grave",
    hex: "#f97316",
    chip: "bg-orange-100 text-orange-900 border-orange-200",
    tip: "Indicado tratamento ativo: psicoterapia e/ou antidepressivo. Reavaliar em curto prazo.",
  },
  {
    min: 20,
    max: 27,
    label: "Grave",
    short: "Grave",
    hex: "#e11d48",
    chip: "bg-rose-100 text-rose-800 border-rose-200",
    tip: "Depressão grave. Tratamento imediato, combinação de farmacoterapia e psicoterapia; rastrear risco.",
  },
];

function bandFor(score: number): Band {
  return BANDS.find((b) => score >= b.min && score <= b.max) ?? BANDS[0];
}

export function Phq9Thermometer({
  score,
  item9Positive = false,
}: {
  score: number;
  item9Positive?: boolean;
}) {
  const clamped = Math.max(0, Math.min(MAX, score));
  const pct = (clamped / MAX) * 100;
  const band = bandFor(clamped);

  return (
    <div className="mt-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            PHQ-9 — Sintomas depressivos
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
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${band.chip}`}
        >
          {band.label}
        </span>
      </div>

      <div className="flex gap-4">
        {/* Termômetro vertical */}
        <div className="relative flex w-16 shrink-0 flex-col items-center">
          {/* Tubo */}
          <div className="relative h-56 w-6 overflow-hidden rounded-full border bg-muted/40">
            {/* Gradiente de fundo das faixas (de cima=grave até baixo=mínimo) */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "linear-gradient(180deg, #e11d48 0%, #e11d48 25.9%, #f97316 25.9%, #f97316 48.1%, #f59e0b 48.1%, #f59e0b 66.7%, #eab308 66.7%, #eab308 85.2%, #10b981 85.2%, #10b981 100%)",
              }}
              aria-hidden
            />
            {/* Mercúrio (preenche de baixo para cima) */}
            <div
              className="absolute bottom-0 left-0 right-0 transition-all"
              style={{
                height: `${pct}%`,
                background: `linear-gradient(180deg, ${band.hex} 0%, ${band.hex} 100%)`,
                boxShadow: `inset 0 2px 4px rgba(255,255,255,0.4)`,
              }}
              aria-label={`Pontuação ${clamped} de ${MAX}`}
            />
          </div>
          {/* Bulbo */}
          <div
            className="-mt-2 h-10 w-10 rounded-full border shadow-inner"
            style={{
              backgroundColor: band.hex,
              boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.2), 0 0 0 2px white, 0 0 0 3px ${band.hex}40`,
            }}
            aria-hidden
          />
        </div>

        {/* Faixas com marcador */}
        <div className="relative flex-1">
          <div className="relative h-56">
            {BANDS.slice()
              .reverse()
              .map((b, idx, arr) => {
                const top = ((MAX - b.max) / MAX) * 100;
                const height = ((b.max - b.min + (idx === arr.length - 1 ? 0 : 0)) / MAX) * 100;
                const active = b.short === band.short;
                return (
                  <div
                    key={b.short}
                    className={`absolute left-0 right-0 flex items-center gap-2 border-l-2 pl-2 transition ${
                      active ? "" : "opacity-60"
                    }`}
                    style={{
                      top: `${top}%`,
                      height: `${height}%`,
                      borderLeftColor: b.hex,
                    }}
                  >
                    <div className="flex-1">
                      <div
                        className={`text-xs font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {b.label}
                      </div>
                      <div className="text-[10px] tabular-nums text-muted-foreground">
                        {b.min}–{b.max}
                      </div>
                    </div>
                    {active && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: b.hex }}
                      >
                        {clamped}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Dica clínica */}
      <div
        className="mt-4 rounded-lg border-l-4 bg-muted/40 p-3 text-xs text-foreground/80"
        style={{ borderLeftColor: band.hex }}
      >
        <span className="font-semibold">Leitura clínica: </span>
        {band.tip}
        {clamped >= 10 && (
          <div className="mt-1 text-foreground/70">
            <span className="font-semibold">Ponto de corte ≥ 10</span> — relevância clínica significativa.
          </div>
        )}
      </div>

      {item9Positive && (
        <div className="mt-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900">
          <span className="font-bold">⚠ Item 9 positivo:</span> presença de pensamentos de
          autolesão ou de que seria melhor estar morto(a). Avaliar risco de suicídio
          imediatamente e definir plano de segurança.
        </div>
      )}
    </div>
  );
}
