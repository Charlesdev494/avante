/**
 * PROMIS-PF — Função Física (Forma Curta 10a)
 *
 * Pontuação bruta: 10–50 (↑ = melhor função).
 *   45–50  Excelente   → emerald
 *   35–44  Boa         → lime
 *   25–34  Moderada    → âmbar
 *   10–24  Baixa       → rose
 *
 * Visual: "medidor de capacidade funcional" — barra com gradiente
 * invertido (vermelho à esquerda → verde à direita), marcador no
 * escore, escala numérica 10–50 e mini-resumo dos blocos
 * "capacidade" (itens 1–5) e "interferência" (itens 6–10).
 */

const MIN = 10;
const MAX = 50;

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
    min: 10,
    max: 24,
    label: "Função baixa",
    hex: "#e11d48",
    chip: "bg-rose-100 text-rose-800 border-rose-200",
    tip: "Limitação importante em atividades cotidianas. Priorizar reabilitação ativa e reavaliar barreiras (dor, medo do movimento, condicionamento).",
  },
  {
    min: 25,
    max: 34,
    label: "Função moderada",
    hex: "#f59e0b",
    chip: "bg-amber-100 text-amber-900 border-amber-200",
    tip: "Capacidade preservada para tarefas leves, mas dificuldades em esforços moderados. Progressão gradual de carga e foco em ganho funcional.",
  },
  {
    min: 35,
    max: 44,
    label: "Função boa",
    hex: "#84cc16",
    chip: "bg-lime-100 text-lime-900 border-lime-200",
    tip: "Boa capacidade funcional global. Manter rotina ativa e prevenir descondicionamento.",
  },
  {
    min: 45,
    max: 50,
    label: "Função excelente",
    hex: "#10b981",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    tip: "Função física preservada/ótima. Reforçar hábitos protetivos (exercício regular, sono, manejo do estresse).",
  },
];

function bandFor(v: number): Band {
  return BANDS.find((b) => v >= b.min && v <= b.max) ?? BANDS[0];
}

export function PromisPfMeter({
  score,
  answers,
  variant = "pf",
}: {
  score: number;
  answers?: Record<string, number>;
  /** "pf" = PROMIS Função Física; "mobility_hip" = adaptação para mobilidade do quadril. */
  variant?: "pf" | "mobility_hip";
}) {
  const clamped = Math.max(MIN, Math.min(MAX, score));
  const pct = ((clamped - MIN) / (MAX - MIN)) * 100;
  const band = bandFor(clamped);

  const isHip = variant === "mobility_hip";
  const title = isHip
    ? "PROMIS Mobility — Quadril"
    : "PROMIS-PF — Função física";
  const capLabel = isHip ? "Capacidade (itens 1–5)" : "Capacidade (itens 1–5)";
  const capHint = isHip
    ? "Caminhar, subir/descer escada, levantar da cadeira, agachar."
    : "Tarefas domésticas, escadas, caminhar, carregar peso, agachar.";
  const limLabel = isHip ? "Limitação (itens 6–10)" : "Interferência (itens 6–10)";
  const limHint = isHip
    ? "Caminhar > 1 km, entrar/sair do carro, pivotar, calçar sapatos, lazer."
    : "Limitação em atividades vigorosas, lazer e esforços moderados.";
  const finalTip = isHip
    ? "O PROMIS Mobility (adaptado para quadril) acompanha a evolução funcional em coxartrose, pré/pós-artroplastia e reabilitação — comparável longitudinalmente no mesmo paciente."
    : "O PROMIS-PF é uma medida genérica de função física — comparável entre diferentes condições clínicas e útil para acompanhar evolução em reabilitação, dor crônica e pós-operatório.";

  // Blocos: capacidade (1–5) e interferência (6–10) — cada um 5–25.
  const sum = (ids: string[]) =>
    ids.reduce((s, id) => s + Number(answers?.[id] ?? 0), 0);
  const capacidade = answers ? sum(["1", "2", "3", "4", "5"]) : null;
  const interferencia = answers ? sum(["6", "7", "8", "9", "10"]) : null;

  return (
    <div className="mt-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: band.hex }}
            >
              {clamped}
            </span>
            <span className="text-sm text-muted-foreground">/ {MAX}</span>
            <span className="text-xs text-muted-foreground">(↑ = melhor)</span>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${band.chip}`}
        >
          {band.label}
        </span>
      </div>

      {/* Medidor com gradiente vermelho → verde e marcador */}
      <div className="relative">
        <div
          className="h-4 w-full overflow-hidden rounded-full border"
          style={{
            background:
              "linear-gradient(90deg, #e11d48 0%, #f59e0b 37%, #84cc16 62%, #10b981 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute -top-1 h-6 w-1.5 -translate-x-1/2 rounded-full border border-white shadow"
          style={{ left: `${pct}%`, backgroundColor: band.hex }}
          aria-label={`Escore ${clamped} de ${MAX}`}
        />
        {/* Linhas de corte em 25, 35, 45 */}
        {[25, 35, 45].map((v) => (
          <div
            key={v}
            className="absolute top-0 h-4 w-px bg-white/70"
            style={{ left: `${((v - MIN) / (MAX - MIN)) * 100}%` }}
            aria-hidden
          />
        ))}
        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>10</span>
          <span>25</span>
          <span>35</span>
          <span>45</span>
          <span>50</span>
        </div>
      </div>

      {/* Subtotais */}
      {answers && capacidade !== null && interferencia !== null && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-muted-foreground">{capLabel}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {capacidade}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                / 25
              </span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {capHint}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-muted-foreground">{limLabel}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {interferencia}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                / 25
              </span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {limHint}
            </div>
          </div>
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
              Soma simples dos 10 itens (cada um 1–5). Todos pontuam na mesma
              direção: <strong>5 = sem dificuldade / sem limitação</strong> e{" "}
              <strong>1 = incapaz</strong>. Escore bruto varia de{" "}
              <span className="tabular-nums">10</span> a{" "}
              <span className="tabular-nums">50</span> — quanto maior, melhor a
              função física.
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
                        {b.min}–{b.max}
                      </td>
                      <td
                        className="py-1"
                        style={active ? { color: b.hex } : undefined}
                      >
                        {b.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground">{finalTip}</p>
        </div>
      </details>
    </div>
  );
}
