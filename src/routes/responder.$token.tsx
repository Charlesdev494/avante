import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PainMap } from "@/components/pain-map";
import { painMapHasContent, toSex, type PainMapValue, type Sex } from "@/lib/pain-map-value";
import { EvaThermometer } from "@/components/eva-thermometer";
import { QuestionnaireRunner } from "@/components/questionnaire-runner";
import { getQuestionnaire, interpretEva } from "@/lib/questionnaires";
import { getDef } from "@/lib/questionnaires-data";
import { buildJourneySummary, type JourneySummary } from "@/lib/journey-summary";
import { Activity, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Sf36Chart, Sf36RadarChart, Sf36DomainSummary } from "@/components/sf36-chart";

export const Route = createFileRoute("/responder/$token")({
  component: RespondPage,
});

interface Assessment {
  id: string;
  patient_id: string;
  questionnaire_type: string;
  day: number;
  scheduled_date: string;
  responded_at: string | null;
  answers: any;
  score: any;
  patient_name: string;
  patient_biological_sex: Sex | null;
}

function RespondPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [a, setA] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [progressCurrent, setProgressCurrent] = useState(1);
  const [progressTotal, setProgressTotal] = useState(1);
  const [lastScore, setLastScore] = useState<any>(null);
  const [lastType, setLastType] = useState<string | null>(null);
  const [summary, setSummary] = useState<JourneySummary | null>(null);

  const [eva, setEva] = useState<number>(5);
  const [formAnswers, setFormAnswers] = useState<Record<string, number>>({});
  const [painMap, setPainMap] = useState<PainMapValue | null>(null);

  const draftKey = `responder-draft:${token}`;

  useEffect(() => {
    if (loading || !a || a.responded_at || done) return;
    try {
      const draft = { eva, painMap, formAnswers, savedAt: Date.now() };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [eva, painMap, formAnswers, loading, a, done, draftKey]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setDone(false);
      setNextToken(null);
      const { data, error } = await supabase.rpc("get_assessment_by_token", { _token: token });
      if (error || !data || (Array.isArray(data) && data.length === 0)) {
        setA(null);
        setLoading(false);
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      const mapped: Assessment = {
        id: row.id,
        patient_id: row.patient_id,
        questionnaire_type: row.questionnaire_type,
        day: row.day,
        scheduled_date: row.scheduled_date,
        responded_at: row.responded_at,
        answers: row.answers,
        score: row.score,
        patient_name: row.patient_name,
        patient_biological_sex: toSex(row.patient_biological_sex),
      };
      setA(mapped);

      let restored = false;
      try {
        const raw = localStorage.getItem(draftKey);
        if (raw && !mapped.responded_at) {
          const d = JSON.parse(raw);
          if (typeof d.eva === "number") setEva(d.eva);
          else setEva(5);
          setPainMap(d.painMap ?? null);
          setFormAnswers(d.formAnswers ?? {});
          const hasContent =
            painMapHasContent(d.painMap) ||
            (d.formAnswers && Object.keys(d.formAnswers).length > 0) ||
            (typeof d.eva === "number" && d.eva !== 5);
          if (hasContent) {
            restored = true;
            toast.success("Continuamos de onde você parou.");
          }
        }
      } catch {
        /* ignore */
      }
      if (!restored) {
        setEva(5);
        setPainMap(null);
        setFormAnswers({});
      }

      const { data: siblings } = await supabase.rpc("get_pending_siblings_by_token", { _token: token });
      const list = (siblings as any[]) ?? [];
      setPendingCount(list.length);
      setNextToken(list[0]?.token ?? null);

      const { data: dayList } = await supabase.rpc("get_day_assessments_by_token", { _token: token });
      const all = (dayList as any[]) ?? [];
      const total = all.length || 1;
      const answeredBefore = all.filter((x) => x.responded_at && x.questionnaire_type !== mapped.questionnaire_type).length;
      setProgressTotal(total);
      setProgressCurrent(Math.min(total, answeredBefore + 1));
      setLoading(false);
    })();
  }, [token, draftKey]);

  if (loading) return <CenterCard>Carregando…</CenterCard>;
  if (!a) return <CenterCard>Link inválido ou expirado.</CenterCard>;

  if (a.responded_at || done) {
    const shownScore = lastScore ?? a.score;
    const shownType = lastType ?? a.questionnaire_type;
    return (
      <CenterCard>
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-3 text-xl font-semibold text-secondary">Obrigado!</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sua resposta foi registrada.</p>
        {shownScore && shownType && shownType !== "pain_map" && shownType !== "sf36" && (
          <div className="mt-4 rounded-lg border bg-muted/40 p-4 text-left">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Resultado (visualização)</div>
            {shownType === "eva" ? (
              <div className="mt-1 text-sm">
                <strong>EVA {shownScore.value}/10</strong> — {shownScore.interpretation}
              </div>
            ) : (
              <div className="mt-1 space-y-1 text-sm">
                <div>
                  <strong>
                    {shownScore.percent !== undefined
                      ? `${shownScore.total}${shownScore.max === 100 ? "" : `/${shownScore.max}`} (${shownScore.percent}%)`
                      : `${shownScore.total}/${shownScore.max}`}
                  </strong>{" "}
                  — {shownScore.interpretation}
                </div>
                {shownScore.subscales && (
                  <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                    {Object.entries(shownScore.subscales).map(([k, v]) => (
                      <li key={k}>
                        {k.replace(/_/g, " ")}: {String(v)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
        {shownType === "sf36" && shownScore?.subscales && (
          <div className="mt-5 space-y-4 text-left">
            <div>
              <h2 className="text-base font-semibold text-secondary">Sua qualidade de vida — SF-36</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Cada ponto é um domínio (0 a 100). A linha pontilhada em <strong>50</strong> é a meta intermediária.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Opção A — Radar</div>
                <Sf36RadarChart series={[{ label: "Agora", subscales: shownScore.subscales }]} height={300} showLegend={false} />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Opção B — Linha</div>
                <Sf36Chart series={[{ label: "Agora", subscales: shownScore.subscales }]} height={300} showLegend={false} />
              </div>
            </div>
            <Sf36DomainSummary subscales={shownScore.subscales} />
          </div>
        )}
        {nextToken ? (
          <div className="mt-5 space-y-2">
            <p className="text-sm">
              {progressTotal > 1
                ? `Você concluiu ${progressCurrent} de ${progressTotal}. Vamos para o próximo?`
                : `Ainda há ${pendingCount} questionário${pendingCount > 1 ? "s" : ""} deste dia para responder.`}
            </p>
            <Button className="w-full" onClick={() => navigate({ to: "/responder/$token", params: { token: nextToken } })}>
              Próximo questionário <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : summary ? (
          <div className="mt-6 space-y-4 text-left">
            <div className="flex items-center gap-2 text-secondary">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">Sua jornada hoje</h2>
            </div>
            <p className="text-sm text-foreground">{summary.intro}</p>
            <div className="space-y-2">
              {summary.items.map((it, i) => {
                const dot =
                  it.tone === "good" ? "bg-emerald-500" : it.tone === "watch" ? "bg-amber-500" : it.tone === "alert" ? "bg-rose-500" : "bg-muted-foreground";
                return (
                  <div key={i} className="flex gap-2 rounded-md border bg-muted/30 p-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
                    <div className="text-sm">
                      <div className="font-medium text-secondary">{it.short}</div>
                      <div className="text-muted-foreground">{it.line}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-foreground">
              {summary.encouragement}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Pode fechar esta página.</p>
        )}
      </CenterCard>
    );
  }

  const meta = getQuestionnaire(a.questionnaire_type);

  async function submit() {
    let answers: any = {};
    let score: any = {};
    if (a!.questionnaire_type === "eva") {
      answers = { value: eva };
      score = { value: eva, interpretation: interpretEva(eva) };
    } else if (a!.questionnaire_type === "pain_map") {
      if (!painMapHasContent(painMap)) {
        return toast.error("Marque ao menos uma região no mapa.");
      }
      answers = painMap;
      score = { recorded: true };
    } else {
      const def = getDef(a!.questionnaire_type);
      if (!def) return toast.error("Este questionário ainda não está disponível.");
      if (Object.keys(formAnswers).length < def.items.length) {
        return toast.error("Responda todas as questões antes de enviar.");
      }
      answers = formAnswers;
      score = def.score(formAnswers);
    }
    const { error } = await supabase.rpc("submit_assessment_by_token", {
      _token: token,
      _answers: answers,
      _score: score,
    });
    if (error) {
      console.error(error);
      return toast.error("Não foi possível salvar. Tente novamente.");
    }

    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
    setLastScore(score);
    setLastType(a!.questionnaire_type);

    const { data: dayList } = await supabase.rpc("get_day_assessments_by_token", { _token: token });
    const all = (dayList as any[]) ?? [];
    const stillPending = all.some(
      (x) => !x.responded_at && x.questionnaire_type !== a!.questionnaire_type,
    );
    if (!stillPending) {
      const answered = all
        .filter((x) => x.responded_at || x.questionnaire_type === a!.questionnaire_type)
        .map((x) =>
          x.questionnaire_type === a!.questionnaire_type
            ? { questionnaire_type: x.questionnaire_type, score, answers }
            : { questionnaire_type: x.questionnaire_type, score: x.score, answers: x.answers },
        );
      setSummary(buildJourneySummary(a!.patient_name ?? "", a!.day, answered));
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <div className="text-sm font-semibold text-secondary">Jornada da Dor</div>
            <div className="text-xs text-muted-foreground">Dr. Charles Oliveira</div>
          </div>
        </header>

        <Card className="space-y-6 p-6">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
              <span>Dia {a.day} · {a.patient_name}</span>
              {progressTotal > 1 && (
                <span className="font-semibold text-primary">
                  Questionário {progressCurrent} de {progressTotal}
                </span>
              )}
            </div>
            {progressTotal > 1 && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${((progressCurrent - 1) / progressTotal) * 100}%` }}
                />
              </div>
            )}
            <h1 className="mt-3 text-xl font-bold text-secondary">{meta?.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{meta?.description}</p>
          </div>

          {a.questionnaire_type === "eva" && (
            <div className="space-y-4">
              <p className="text-sm">De 0 a 10, qual é a intensidade da sua dor neste momento?</p>
              <EvaThermometer value={eva} onChange={setEva} />
            </div>
          )}

          {a.questionnaire_type === "pain_map" && (
            <div className="space-y-3">
              <p className="text-sm">
                Pinte com o dedo as áreas onde sente dor. Use <strong>cores mais escuras para dores mais intensas</strong> e <strong>cores mais claras para dores menos intensas</strong>.
              </p>
              <PainMap
                value={painMap}
                onChange={setPainMap}
                sex={a.patient_biological_sex ?? undefined}
              />
            </div>
          )}

          {getDef(a.questionnaire_type) && (
            <QuestionnaireRunner def={getDef(a.questionnaire_type)!} value={formAnswers} onChange={setFormAnswers} />
          )}

          {!["eva", "pain_map"].includes(a.questionnaire_type) && !getDef(a.questionnaire_type) && (
            <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
              Este questionário ainda não está disponível nesta versão.
            </div>
          )}

          <div className="space-y-2">
            <Button className="w-full" onClick={submit}>Enviar resposta</Button>
            <p className="text-center text-xs text-muted-foreground">
              Suas respostas são salvas automaticamente neste dispositivo. Se for interrompido, basta reabrir o link para continuar.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CenterCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="max-w-md p-8 text-center text-sm text-muted-foreground">{children}</Card>
    </div>
  );
}
