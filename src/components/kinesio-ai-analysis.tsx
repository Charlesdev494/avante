import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Loader2, AlertTriangle, ShieldAlert, Lightbulb, Quote } from "lucide-react";
import { toast } from "sonner";
import {
  analyzeKinesiophobia,
  type KinesioAnalysis,
  type TskItemAnswer,
} from "@/lib/ai-kinesio.functions";
import { TSK_DEF } from "@/lib/questionnaires-data";

interface Props {
  patientName: string;
  tskScore: { total: number; max: number; interpretation: string } | null;
  tskAnswers: Record<string, number> | null;
  context?: {
    evaCurrent?: number | null;
    pcsTotal?: number | null;
    odiPercent?: number | null;
    hadsAnsiedade?: number | null;
    hadsDepressao?: number | null;
    sf36Vitalidade?: number | null;
    sf36SaudeMental?: number | null;
  };
}

const TSK_REVERSE = new Set(["4", "8", "12", "16"]);

export function KinesioAiAnalysis({ patientName, tskScore, tskAnswers, context }: Props) {
  const analyze = useServerFn(analyzeKinesiophobia);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KinesioAnalysis | null>(null);

  if (!tskScore || !tskAnswers) return null;

  async function run() {
    if (!tskScore || !tskAnswers) return;
    setLoading(true);
    try {
      const answers: TskItemAnswer[] = TSK_DEF.items.map((item) => {
        const raw = tskAnswers[item.id] ?? 0;
        const reversed = TSK_REVERSE.has(item.id);
        const adjusted = reversed ? 5 - raw : raw;
        const opt = item.options.find((o) => o.value === raw);
        return {
          id: item.id,
          prompt: item.prompt,
          value: adjusted,
          optionLabel: opt?.label ?? `${raw}`,
          reversed,
        };
      });
      const r = await analyze({
        data: {
          patientName,
          tskTotal: tskScore.total,
          tskMax: tskScore.max,
          tskInterpretation: tskScore.interpretation,
          answers,
          context,
        },
      });
      setResult(r);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao gerar análise.");
    } finally {
      setLoading(false);
    }
  }

  const riskTone =
    result?.risk === "alto"
      ? "border-rose-300 bg-rose-50 text-rose-900"
      : result?.risk === "moderado"
        ? "border-amber-300 bg-amber-50 text-amber-900"
        : "border-emerald-300 bg-emerald-50 text-emerald-900";

  return (
    <Card className="mt-3 space-y-3 border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-secondary">
            Análise IA — Previsão de barreiras ao movimento
          </span>
        </div>
        <Button size="sm" onClick={run} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analisando…
            </>
          ) : result ? (
            "Refazer análise"
          ) : (
            "Analisar com IA"
          )}
        </Button>
      </div>

      {!result && !loading && (
        <p className="text-xs text-muted-foreground">
          Baseada no TSK-17 e no Fear-Avoidance Model (Vlaeyen), graded exposure e educação em
          neurociência da dor. Apoio à decisão — não substitui sua avaliação clínica.
        </p>
      )}

      {result && (
        <div className="space-y-4 text-sm">
          <div className={`rounded-md border p-3 ${riskTone}`}>
            <div className="text-xs font-bold uppercase tracking-wide">
              Risco de dificuldade para mobilizar: {result.risk}
            </div>
            <p className="mt-1 text-sm">{result.riskRationale}</p>
          </div>

          {result.barriers.length > 0 && (
            <div>
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                <AlertTriangle className="h-3.5 w-3.5" /> Barreiras prováveis
              </div>
              <ul className="list-disc space-y-1 pl-5 text-foreground">
                {result.barriers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {result.redFlags.length > 0 && (
            <div>
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
                <ShieldAlert className="h-3.5 w-3.5" /> Sinais de alerta
              </div>
              <ul className="list-disc space-y-1 pl-5 text-foreground">
                {result.redFlags.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {result.strategy.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                <Lightbulb className="h-3.5 w-3.5" /> Estratégia de intervenção
              </div>
              <ol className="space-y-2">
                {result.strategy.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-md border bg-background p-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Fase {i + 1} · {s.phase}
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-secondary">{s.goal}</div>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-foreground">
                      {s.actions.map((a, j) => (
                        <li key={j}>{a}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result.patientLanguage && (
            <div className="rounded-md border border-primary/30 bg-background p-3">
              <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <Quote className="h-3.5 w-3.5" /> Frase para abrir conversa
              </div>
              <p className="text-sm italic text-foreground">"{result.patientLanguage}"</p>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            Apoio à decisão clínica gerado por IA. Sempre revise antes de aplicar.
          </p>
        </div>
      )}
    </Card>
  );
}
