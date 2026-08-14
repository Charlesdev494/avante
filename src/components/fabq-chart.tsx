/**
 * FABQ — Fear-Avoidance Beliefs Questionnaire (gráfico interpretativo)
 *
 * Mostra duas escalas horizontais (estilo "termômetro"):
 *  - FABQ-Phys (atividade física): 0–24
 *  - FABQ-Work (trabalho): 0–42
 *
 * Cada barra exibe:
 *  - gradiente verde→amarelo→vermelho
 *  - marcador da pontuação atual
 *  - linhas de corte clínicas (baixa / moderada / elevada)
 *  - banda interpretativa colorida
 *  - rótulo de interpretação
 *
 * Referências de corte:
 *  - FABQ-Phys: <10 baixa | 10–14 moderada | ≥15 elevada
 *  - FABQ-Work: <20 baixa | 20–24 moderada | ≥25 elevada (≥29 = forte
 *    preditor de afastamento prolongado do trabalho — Fritz & George, 2002)
 */

type SubscaleProps = {
  label: string;
  hint: string;
  score: number;
  max: number;
  lowCut: number; // limite superior da faixa baixa
  highCut: number; // limite inferior da faixa elevada
  strongCut?: number; // marcador adicional opcional (ex: 29 no Work)
  strongCutLabel?: string;
};

function bandFor(score: number, lowCut: number, highCut: number) {
  if (score >= highCut) return { label: "Elevada", color: "var(--brand-red, #dc2626)", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800" };
  if (score >= lowCut) return { label: "Moderada", color: "var(--brand-amber, #f59e0b)", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" };
  return { label: "Baixa", color: "var(--brand-green, #16a34a)", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800" };
}

function SubscaleBar({ label, hint, score, max, lowCut, highCut, strongCut, strongCutLabel }: SubscaleProps) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const lowPct = (lowCut / max) * 100;
  const highPct = (highCut / max) * 100;
  const strongPct = strongCut !== undefined ? (strongCut / max) * 100 : null;
  const band = bandFor(score, lowCut, highCut);

  return (
    <div className={`rounded-lg border ${band.border} ${band.bg} p-3`}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold tabular-nums text-foreground">
            {score}<span className="text-sm font-medium text-muted-foreground">/{max}</span>
          </div>
          <div className={`text-xs font-semibold ${band.text}`}>{band.label}</div>
        </div>
      </div>

      {/* Barra com gradiente */}
      <div className="relative h-6 w-full overflow-visible rounded-full border border-border bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500">
        {/* Linhas de corte */}
        <div
          className="absolute top-0 h-full border-l-2 border-dashed border-white/80"
          style={{ left: `${lowPct}%` }}
          aria-hidden
        />
        <div
          className="absolute top-0 h-full border-l-2 border-dashed border-white/80"
          style={{ left: `${highPct}%` }}
          aria-hidden
        />
        {strongPct !== null && (
          <div
            className="absolute top-0 h-full border-l-2 border-dotted border-rose-900/70"
            style={{ left: `${strongPct}%` }}
            aria-hidden
          />
        )}

        {/* Marcador da pontuação */}
        <div
          className="absolute -top-1.5 h-9 w-1.5 -translate-x-1/2 rounded-full shadow-md"
          style={{ left: `${pct}%`, backgroundColor: "#0B2545" }}
          aria-label={`Pontuação ${score}`}
        />
      </div>

      {/* Escala numérica */}
      <div className="relative mt-1 h-4 text-[10px] text-muted-foreground">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2 font-medium" style={{ left: `${lowPct}%` }}>{lowCut}</span>
        <span className="absolute -translate-x-1/2 font-medium" style={{ left: `${highPct}%` }}>{highCut}</span>
        {strongPct !== null && strongCutLabel && (
          <span className="absolute -translate-x-1/2 font-medium text-rose-700" style={{ left: `${strongPct}%` }}>{strongCutLabel}</span>
        )}
        <span className="absolute right-0">{max}</span>
      </div>

      {/* Legendas das faixas */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span><span className="inline-block h-2 w-2 rounded-sm bg-emerald-400" /> baixa &lt;{lowCut}</span>
        <span><span className="inline-block h-2 w-2 rounded-sm bg-amber-400" /> moderada {lowCut}–{highCut - 1}</span>
        <span><span className="inline-block h-2 w-2 rounded-sm bg-rose-500" /> elevada ≥{highCut}</span>
      </div>
    </div>
  );
}

export function FabqChart({
  phys,
  work,
}: {
  phys: number;
  work: number;
}) {
  const physBand = bandFor(phys, 10, 15);
  const workBand = bandFor(work, 20, 25);

  // Mensagem clínica combinada
  const isHigh = phys >= 15 || work >= 25;
  const isStrongWork = work >= 29;
  const clinicalTip = isStrongWork
    ? "FABQ-Work ≥29 é um forte preditor de afastamento prolongado do trabalho. Considere abordagem cognitivo-comportamental e retorno gradual às atividades laborais."
    : isHigh
    ? "Crenças elevadas de medo-evitação sugerem maior risco de cronificação. Educação em dor, exposição gradual e movimento progressivo costumam ajudar."
    : phys >= 10 || work >= 20
    ? "Crenças moderadas — bom momento para reforçar segurança do movimento e progressão de carga supervisionada."
    : "Crenças baixas de medo-evitação. Mantenha o paciente ativo e engajado nas atividades funcionais.";

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-secondary">FABQ — Crenças de Medo-Evitação</div>
          <div className="text-xs text-muted-foreground">Quanto maior, maior o medo de que o movimento ou o trabalho piorem a dor.</div>
        </div>
      </div>

      <SubscaleBar
        label="FABQ-Phys — Atividade física"
        hint="Itens 2, 3, 4, 5 — pontuação 0–24"
        score={phys}
        max={24}
        lowCut={10}
        highCut={15}
      />

      <SubscaleBar
        label="FABQ-Work — Trabalho"
        hint="Itens 6, 7, 9, 10, 11, 12, 15 — pontuação 0–42 (melhor preditor de retorno laboral)"
        score={work}
        max={42}
        lowCut={20}
        highCut={25}
        strongCut={29}
        strongCutLabel="29*"
      />

      <div className={`rounded-md border p-3 text-xs ${physBand.border} ${physBand.bg}`}>
        <div className="mb-1 font-semibold text-foreground">Interpretação clínica</div>
        <p className="text-muted-foreground">{clinicalTip}</p>
        {work >= 29 && (
          <p className="mt-1 text-[11px] text-rose-700">
            * Corte de 29 pontos no FABQ-Work (Fritz & George, 2002) — alta probabilidade de não retorno ao trabalho em 4 semanas sem intervenção dirigida.
          </p>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          Pontuação total bruta: <span className="font-semibold tabular-nums text-foreground">{phys + work}/66</span> · Phys {phys}/24 ({physBand.label.toLowerCase()}) · Work {work}/42 ({workBand.label.toLowerCase()}).
        </p>
      </div>
    </div>
  );
}
