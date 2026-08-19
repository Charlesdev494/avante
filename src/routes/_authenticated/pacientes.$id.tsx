import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClinicLayout } from "@/components/clinic-layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PainMap } from "@/components/pain-map";
import type { PainMapValue, Sex } from "@/lib/pain-map-value";
import { getQuestionnaire, interpretEva, QUESTIONNAIRES, type QuestionnaireType } from "@/lib/questionnaires";
import { ArrowLeft, Copy, Mail, MessageCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getPublicAppOrigin } from "@/lib/public-url";
import { Sf36Chart, Sf36RadarChart, Sf36DomainSummary, type Sf36Series } from "@/components/sf36-chart";
import { KinesioAiAnalysis } from "@/components/kinesio-ai-analysis";
import { NantesReport } from "@/components/nantes-report";
import { PcsGauge } from "@/components/pcs-gauge";
import { Phq9Thermometer } from "@/components/phq9-thermometer";
import { Gad7Gauge } from "@/components/gad7-gauge";
import { PegThermometer } from "@/components/peg-thermometer";
import { PromisPfMeter } from "@/components/promis-pf-meter";
import { FabqChart } from "@/components/fabq-chart";
import { ScoreRuler, MultiRuler } from "@/components/score-ruler";
import {
  NDI_BANDS,
  ODI_BANDS,
  SPADI_BANDS,
  RMDQ_BANDS,
  DN4_BANDS,
  HADS_BANDS,
  HOOS_BANDS,
  FIQR_BANDS,
  PPS_BANDS,
  KPS_BANDS,
  ISI_BANDS,
  WHOQOL_BANDS,
  PPDI_BANDS,
} from "@/components/score-bands";
import { Koos12Chart } from "@/components/koos12-chart";
import { PatientNarrativeReport } from "@/components/patient-narrative-report";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/pacientes/$id")({
  component: PatientDetailPage,
});

interface Patient {
  id: string;
  name: string;
  biological_sex: Sex | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

interface Assessment {
  id: string;
  questionnaire_type: string;
  day: number;
  scheduled_date: string;
  responded_at: string | null;
  token: string;
  answers: any;
  score: any;
}

function PatientDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: a }] = await Promise.all([
        supabase.from("patients").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("assessments")
          .select("*")
          .eq("patient_id", id)
          .order("day", { ascending: true })
          .order("scheduled_date", { ascending: true }),
      ]);
      setPatient(p as any);
      setAssessments((a as any) ?? []);
      setLoading(false);
    })();
  }, [id, reloadKey]);

  if (loading) {
    return (
      <ClinicLayout>
        <p className="text-muted-foreground">Carregando…</p>
      </ClinicLayout>
    );
  }
  if (!patient) {
    return (
      <ClinicLayout>
        <p>Paciente não encontrado.</p>
      </ClinicLayout>
    );
  }

  // EVA evolution chart data — uma nota única por dia (mais recente), ordenada por dia
  const evaByDay = new Map<number, number>();
  assessments
    .filter((x) => x.questionnaire_type === "eva" && x.score?.value !== undefined)
    .forEach((x) => {
      // sobrescreve mantendo o último registrado para aquele dia
      evaByDay.set(x.day, x.score.value as number);
    });
  const evaSeries = Array.from(evaByDay.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([day, value]) => ({ day: `D${day}`, EVA: value }));

  // Group by day
  const byDay = new Map<number, Assessment[]>();
  assessments.forEach((a) => {
    if (!byDay.has(a.day)) byDay.set(a.day, []);
    byDay.get(a.day)!.push(a);
  });
  const sortedDays = Array.from(byDay.keys()).sort((a, b) => a - b);

  // Pain map evolution
  const painMaps = sortedDays
    .map((d) => {
      const pm = byDay.get(d)!.find((x) => x.questionnaire_type === "pain_map" && x.answers);
      return pm ? { day: d, answers: pm.answers, responded: !!pm.responded_at } : null;
    })
    .filter(Boolean) as { day: number; answers: PainMapValue; responded: boolean }[];

  async function setBiologicalSex(valor: Sex) {
    const { error } = await supabase
      .from("patients")
      .update({ biological_sex: valor })
      .eq("id", id);
    if (error) {
      console.error(error);
      return toast.error("Não foi possível salvar o sexo biológico.");
    }
    setPatient((p) => (p ? { ...p, biological_sex: valor } : p));
    toast.success("Sexo biológico registrado.");
  }

  async function deletePatient() {
    if (!confirm("Mover este paciente para a Lixeira? Você poderá restaurá-lo depois.")) return;
    const { error } = await supabase
      .from("patients")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { console.error(error); return toast.error("Não foi possível excluir. Tente novamente."); }
    toast.success("Paciente movido para a Lixeira.");
    navigate({ to: "/pacientes" });
  }

  return (
    <ClinicLayout>
      <Link to="/pacientes" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Pacientes
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary">{patient.name}</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {patient.phone || "sem telefone"}
            {patient.email && <> · {patient.email}</>}
            {patient.birth_date && (
              <> · nasc. {new Date(patient.birth_date).toLocaleDateString("pt-BR")}</>
            )}
            {patient.biological_sex && (
              <> · {patient.biological_sex === "female" ? "feminino" : "masculino"}</>
            )}
          </div>
          {/* Paciente cadastrado antes do campo existir fica sem sexo, e sem ele o
              Mapa da Dor não sabe qual anatomia usar. Preenchimento aqui, na ficha. */}
          {!patient.biological_sex && (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
              <span className="text-xs text-amber-900">
                Sexo biológico não informado — o Mapa da Dor precisa dele para escolher as vistas.
              </span>
              {(
                [
                  ["female", "Feminino"],
                  ["male", "Masculino"],
                ] as const
              ).map(([valor, rotulo]) => (
                <Button
                  key={valor}
                  size="sm"
                  variant="outline"
                  onClick={() => setBiologicalSex(valor)}
                >
                  {rotulo}
                </Button>
              ))}
            </div>
          )}
          {patient.notes && (
            <p className="mt-2 max-w-xl text-sm">{patient.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          <AddAssessmentDialog
            patientId={id}
            existingAssessments={assessments}
            onAdded={() => setReloadKey((k) => k + 1)}
          />
          <Button variant="outline" size="sm" onClick={deletePatient}>
            <Trash2 className="mr-1 h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      <PatientNarrativeReport patientName={patient.name} assessments={assessments} />

      {evaSeries.length >= 1 && (
        <Card className="mb-6 p-5">
          <h2 className="mb-1 text-sm font-semibold text-secondary">Evolução da EVA</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            {evaSeries.length === 1
              ? "Registre uma nova avaliação em outro dia (D30, D90…) para ver a linha do tempo da dor."
              : "Linha do tempo da intensidade da dor — quanto menor, melhor."}
          </p>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={evaSeries} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                <Tooltip formatter={(v: number) => [`${v}/10`, "EVA"]} />
                <Line
                  type="monotone"
                  dataKey="EVA"
                  stroke="var(--brand-teal)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {(() => {
        const sf36Series: Sf36Series[] = assessments
          .filter((x) => x.questionnaire_type === "sf36" && x.score?.subscales)
          .sort((a, b) => a.day - b.day)
          .map((x) => ({ label: `D${x.day}`, subscales: x.score.subscales }));
        if (!sf36Series.length) return null;
        const latest = sf36Series[sf36Series.length - 1];
        return (
          <Card className="mb-6 p-5">
            <h2 className="mb-1 text-sm font-semibold text-secondary">
              SF-36 — Qualidade de vida por domínio
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Comparando duas visualizações para você escolher a melhor. Em ambas, a referência tracejada em 50 = meta intermediária.
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Opção A — Radar (octógono)
                </div>
                <Sf36RadarChart series={sf36Series} />
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Opção B — Linha sequencial
                </div>
                <Sf36Chart series={sf36Series} />
              </div>
            </div>
            <div className="mt-4">
              <Sf36DomainSummary subscales={latest.subscales} />
            </div>
          </Card>
        );
      })()}


      {painMaps.length > 0 && (
        <Card className="mb-6 p-5">
          <h2 className="text-sm font-semibold text-secondary">Mapa da Dor — evolução</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Clique em qualquer desenho para ampliar.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {painMaps.map((pm) => (
              <div key={pm.day} className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">D{pm.day}</div>
                <PainMap
                  value={pm.answers}
                  readOnly
                  sex={patient?.biological_sex ?? undefined}
                  caption={`D${pm.day}`}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      <h2 className="mb-3 text-sm font-semibold text-secondary">Questionários</h2>
      <div className="space-y-4">
        {sortedDays.map((d) => {
          const dayItems = byDay.get(d)!;
          const firstPending = dayItems.find((x) => !x.responded_at) ?? dayItems[0];
          const dayUrl = `${getPublicAppOrigin()}/responder/${firstPending.token}`;
          const pendingCount = dayItems.filter((x) => !x.responded_at).length;
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          const isFuture = dayItems[0].scheduled_date > todayStr && pendingCount > 0;
          return (
            <Card
              key={d}
              className={`p-5 transition-all ${isFuture ? "bg-muted/70 opacity-40 grayscale hover:opacity-100 hover:grayscale-0" : ""}`}
              aria-label={isFuture ? "Questionário agendado para data futura" : undefined}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-secondary">
                    Dia {d}
                    {isFuture && (
                      <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Agendado
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Previsto: {new Date(dayItems[0].scheduled_date).toLocaleDateString("pt-BR")}
                    {" · "}{dayItems.length} questionário{dayItems.length > 1 ? "s" : ""}
                    {pendingCount > 0 && <> · {pendingCount} pendente{pendingCount > 1 ? "s" : ""}</>}
                  </div>
                </div>
                {pendingCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(dayUrl);
                          toast.success("Link único do dia copiado!", { description: dayUrl });
                        } catch {
                          window.prompt("Copie o link único do dia:", dayUrl);
                        }
                      }}
                    >
                      <Copy className="mr-1 h-4 w-4" /> Copiar link (D{d})
                    </Button>
                    {patient.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const digits = patient.phone!.replace(/\D/g, "");
                          const msg = `Olá ${patient.name.split(" ")[0]}, segue o link da sua avaliação (D${d}): ${dayUrl}`;
                          window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`, "_blank");
                        }}
                      >
                        <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
                      </Button>
                    )}
                    {patient.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const subject = `Sua avaliação (D${d})`;
                          const body = `Olá ${patient.name.split(" ")[0]},\n\nSegue o link da sua avaliação (D${d}):\n${dayUrl}\n\nObrigado!`;
                          window.location.href = `mailto:${patient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        }}
                      >
                        <Mail className="mr-1 h-4 w-4" /> E-mail
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="divide-y">
                {dayItems.map((a) => (
                  <AssessmentRow
                    key={a.id}
                    a={a}
                    allAssessments={assessments}
                    patientName={patient.name}
                    onChange={() => setReloadKey((k) => k + 1)}
                  />
                ))}
              </div>
            </Card>
          );
        })}
        {sortedDays.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum questionário cadastrado ainda.</p>
        )}
      </div>
    </ClinicLayout>
  );
}

function AssessmentRow({ a, allAssessments, patientName, onChange }: { a: Assessment; allAssessments: Assessment[]; patientName: string; onChange: () => void }) {
  const meta = getQuestionnaire(a.questionnaire_type);
  const url = `${getPublicAppOrigin()}/responder/${a.token}`;
  const isAvailable = ["eva", "pain_map", "pcs", "odi", "ndi", "spadi", "sf36", "tsk", "rmdq", "dn4", "hads", "hoos", "koos12", "fiqr", "pps", "kps", "nantes", "phq9", "gad7", "peg", "promis_pf", "promis_mobility_hip", "fabq", "ppdi"].includes(a.questionnaire_type);

  let scoreText = "Pendente";
  if (a.responded_at) {
    if (a.questionnaire_type === "eva" && a.score?.value !== undefined) {
      scoreText = `EVA ${a.score.value} — ${interpretEva(a.score.value)}`;
    } else if (a.questionnaire_type === "pain_map") {
      scoreText = "Mapa registrado";
    } else if (a.questionnaire_type === "phq9" && a.score) {
      // PHQ-9 sempre em pontuação absoluta (0–27), sem percentual.
      scoreText = `${a.score.total}/${a.score.max} — ${a.score.interpretation}`;
    } else if (a.questionnaire_type === "gad7" && a.score) {
      // GAD-7 sempre em pontuação absoluta (0–21), sem percentual.
      scoreText = `${a.score.total}/${a.score.max} — ${a.score.interpretation}`;
    } else if (a.questionnaire_type === "peg" && a.score) {
      // PEG: média 0–10 dos 3 itens.
      scoreText = `Média ${Number(a.score.total).toFixed(1)}/${a.score.max} — ${a.score.interpretation}`;
    } else if ((a.questionnaire_type === "promis_pf" || a.questionnaire_type === "promis_mobility_hip") && a.score) {
      // PROMIS: pontuação bruta 10–50 (↑ = melhor), sem percentual.
      scoreText = `${a.score.total}/${a.score.max} — ${a.score.interpretation}`;
    } else if (a.questionnaire_type === "fabq" && a.score) {
      const sub = a.score.subscales as { atividade_fisica?: number; trabalho?: number } | undefined;
      scoreText = `Phys ${sub?.atividade_fisica ?? 0}/24 · Work ${sub?.trabalho ?? 0}/42 — ${a.score.interpretation}`;
    } else if (["pcs", "odi", "ndi", "spadi", "sf36", "tsk", "rmdq", "dn4", "hads", "hoos", "koos12", "fiqr", "pps", "kps", "nantes", "isi", "whoqol_bref", "ppdi"].includes(a.questionnaire_type) && a.score) {
      const pct = a.score.percent !== undefined ? ` (${a.score.percent}%)` : "";
      scoreText = `${a.score.total}/${a.score.max}${pct} — ${a.score.interpretation}`;
    } else {
      scoreText = "Respondido";
    }
  }

  // Contexto multiquestionário do mesmo dia, usado pela análise IA da cinesiofobia
  const sameDay = allAssessments.filter((x) => x.day === a.day && x.responded_at);
  const findScore = (type: string) => sameDay.find((x) => x.questionnaire_type === type)?.score;
  const evaScore = findScore("eva");
  const pcsScore = findScore("pcs");
  const odiScore = findScore("odi");
  const hadsScore = findScore("hads");
  const sf36Score = findScore("sf36");
  const aiContext = {
    evaCurrent: evaScore?.value ?? null,
    pcsTotal: pcsScore?.total ?? null,
    odiPercent: odiScore?.percent ?? null,
    hadsAnsiedade: hadsScore?.subscales?.ansiedade ?? null,
    hadsDepressao: hadsScore?.subscales?.depressao ?? null,
    sf36Vitalidade: sf36Score?.subscales?.vitalidade ?? null,
    sf36SaudeMental: sf36Score?.subscales?.saude_mental ?? null,
  };

  return (
    <div className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-secondary">
          {meta?.short ?? a.questionnaire_type.toUpperCase()}{" "}
          {!isAvailable && (
            <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              em breve
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {scoreText}
          {a.responded_at && (
            <> · respondido em {new Date(a.responded_at).toLocaleString("pt-BR")}</>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              toast.success("Link copiado!", { description: url });
            } catch {
              window.prompt("Copie o link:", url);
            }
          }}
        >
          <Copy className="mr-1 h-4 w-4" /> Link
        </Button>
        <Link to="/responder/$token" params={{ token: a.token }}>
          <Button size="sm" variant="ghost">
            Abrir
          </Button>
        </Link>
        {a.responded_at && (
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              if (!confirm(`Re-responder "${meta?.short ?? a.questionnaire_type.toUpperCase()}" de D${a.day}?\n\nA resposta atual será apagada para você simular novamente. Útil para testar a evolução nos gráficos.`)) return;
              const { error } = await supabase
                .from("assessments")
                .update({ responded_at: null, answers: null, score: null })
                .eq("id", a.id);
              if (error) { console.error(error); return toast.error("Não foi possível atualizar. Tente novamente."); }
              toast.success("Pronto — abra o link para responder de novo.");
              onChange();
            }}
          >
            Re-responder
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={async () => {
            const label = meta?.short ?? a.questionnaire_type.toUpperCase();
            // Questionários do mesmo tipo em dias futuros que AINDA NÃO foram respondidos.
            // Os já respondidos (em qualquer dia) ficam preservados como histórico.
            const subsequentPending = allAssessments.filter(
              (x) =>
                x.id !== a.id &&
                x.questionnaire_type === a.questionnaire_type &&
                x.day > a.day &&
                !x.responded_at,
            );
            const subsequentNote =
              subsequentPending.length > 0
                ? `\n\nTambém será removido das avaliações seguintes ainda pendentes: ${subsequentPending
                    .map((x) => `D${x.day}`)
                    .join(", ")}.`
                : "";
            const respondido = a.responded_at
              ? ` Esta resposta foi registrada em ${new Date(a.responded_at).toLocaleString("pt-BR")} e será perdida.`
              : "";
            if (
              !confirm(
                `Excluir o questionário "${label}" do Dia ${a.day}?${respondido}${subsequentNote}\n\nQuestionários já respondidos em outros dias ficam preservados. Esta ação não pode ser desfeita.`,
              )
            )
              return;
            const idsToDelete = [a.id, ...subsequentPending.map((x) => x.id)];
            const { error } = await supabase
              .from("assessments")
              .delete()
              .in("id", idsToDelete);
            if (error) { console.error(error); return toast.error("Não foi possível excluir. Tente novamente."); }
            toast.success(
              subsequentPending.length > 0
                ? `Questionário excluído de D${a.day} e de ${subsequentPending.map((x) => `D${x.day}`).join(", ")}.`
                : "Questionário excluído.",
            );
            onChange();
          }}
        >
          <Trash2 className="mr-1 h-4 w-4" /> Excluir
        </Button>
        </div>
      </div>
      {a.questionnaire_type === "tsk" && a.responded_at && a.score && a.answers && (
        <KinesioAiAnalysis
          patientName={patientName}
          tskScore={a.score}
          tskAnswers={a.answers}
          context={aiContext}
        />
      )}
      {a.questionnaire_type === "nantes" && a.responded_at && a.score && a.answers && (
        <NantesReport answers={a.answers} score={a.score} />
      )}
      {a.questionnaire_type === "pcs" && a.responded_at && typeof a.score?.total === "number" && (
        <PcsGauge score={a.score.total} />
      )}
      {a.questionnaire_type === "phq9" && a.responded_at && typeof a.score?.total === "number" && (
        <Phq9Thermometer
          score={a.score.total}
          item9Positive={Number(a.answers?.["9"] ?? 0) > 0}
        />
      )}
      {a.questionnaire_type === "gad7" && a.responded_at && typeof a.score?.total === "number" && (
        <Gad7Gauge score={a.score.total} />
      )}
      {a.questionnaire_type === "peg" && a.responded_at && typeof a.score?.total === "number" && (
        <PegThermometer
          score={a.score.total}
          subscales={a.score.subscales as Record<string, number> | undefined}
        />
      )}
      {a.questionnaire_type === "promis_pf" && a.responded_at && typeof a.score?.total === "number" && (
        <PromisPfMeter
          score={a.score.total}
          answers={a.answers as Record<string, number> | undefined}
          variant="pf"
        />
      )}
      {a.questionnaire_type === "promis_mobility_hip" && a.responded_at && typeof a.score?.total === "number" && (
        <PromisPfMeter
          score={a.score.total}
          answers={a.answers as Record<string, number> | undefined}
          variant="mobility_hip"
        />
      )}
      {a.questionnaire_type === "fabq" && a.responded_at && a.score?.subscales && (
        <FabqChart
          phys={Number((a.score.subscales as { atividade_fisica?: number }).atividade_fisica ?? 0)}
          work={Number((a.score.subscales as { trabalho?: number }).trabalho ?? 0)}
        />
      )}
      {a.questionnaire_type === "ndi" && a.responded_at && typeof a.score?.percent === "number" && (
        <ScoreRuler
          title="NDI — Incapacidade cervical"
          subtitle="Percentual de incapacidade gerado pela dor no pescoço"
          score={a.score.percent}
          max={100}
          bands={NDI_BANDS}
          unit="%"
        />
      )}
      {a.questionnaire_type === "odi" && a.responded_at && typeof a.score?.percent === "number" && (
        <ScoreRuler
          title="Oswestry (ODI) — Incapacidade lombar"
          subtitle="Percentual do impacto da dor lombar no dia a dia"
          score={a.score.percent}
          max={100}
          bands={ODI_BANDS}
          unit="%"
        />
      )}
      {a.questionnaire_type === "spadi" && a.responded_at && typeof a.score?.total === "number" && (
        <MultiRuler
          title="SPADI — Dor e função do ombro"
          description="Quanto MENOR, melhor o ombro."
          rulers={[
            {
              title: "Dor",
              subtitle: "Subescala de dor (5 itens)",
              score: Number((a.score.subscales as { dor?: number } | undefined)?.dor ?? 0),
              max: 100,
              bands: SPADI_BANDS,
              unit: "%",
            },
            {
              title: "Função",
              subtitle: "Subescala de função (8 itens)",
              score: Number((a.score.subscales as { funcao?: number } | undefined)?.funcao ?? 0),
              max: 100,
              bands: SPADI_BANDS,
              unit: "%",
            },
            {
              title: "Total SPADI",
              subtitle: "Média de dor e função",
              score: a.score.total,
              max: 100,
              bands: SPADI_BANDS,
              unit: "%",
            },
          ]}
        />
      )}
      {a.questionnaire_type === "rmdq" && a.responded_at && typeof a.score?.total === "number" && (
        <ScoreRuler
          title="Roland-Morris (RMDQ)"
          subtitle="Nº de frases marcadas (0–24) — quanto menor, melhor."
          score={a.score.total}
          max={24}
          bands={RMDQ_BANDS}
          unit="/24"
        />
      )}
      {a.questionnaire_type === "dn4" && a.responded_at && typeof a.score?.total === "number" && (
        <ScoreRuler
          title="DN4 — Triagem de dor neuropática"
          subtitle="Pontuação ≥ 4 sugere componente neuropático."
          score={a.score.total}
          max={10}
          bands={DN4_BANDS}
          unit="/10"
        />
      )}
      {a.questionnaire_type === "hads" && a.responded_at && a.score?.subscales && (
        <MultiRuler
          title="HADS — Ansiedade e Depressão"
          description="Cada subescala vai de 0 a 21. ≥ 8 = sintomas possíveis; ≥ 11 = sintomas prováveis."
          rulers={[
            {
              title: "Ansiedade",
              subtitle: "Itens ímpares (1, 3, 5, 7, 9, 11, 13)",
              score: Number((a.score.subscales as { ansiedade?: number }).ansiedade ?? 0),
              max: 21,
              bands: HADS_BANDS,
              unit: "/21",
            },
            {
              title: "Depressão",
              subtitle: "Itens pares (2, 4, 6, 8, 10, 12, 14)",
              score: Number((a.score.subscales as { depressao?: number }).depressao ?? 0),
              max: 21,
              bands: HADS_BANDS,
              unit: "/21",
            },
          ]}
        />
      )}
      {a.questionnaire_type === "hoos" && a.responded_at && a.score?.subscales && (
        <MultiRuler
          title="HOOS — Quadril (5 subescalas)"
          description="Quanto MAIOR, melhor o quadril (0 = problemas extremos · 100 = sem problemas)."
          rulers={[
            { title: "Sintomas", score: Number((a.score.subscales as any).sintomas ?? 0), max: 100, bands: HOOS_BANDS, higherIsBetter: true, unit: "/100" },
            { title: "Dor", score: Number((a.score.subscales as any).dor ?? 0), max: 100, bands: HOOS_BANDS, higherIsBetter: true, unit: "/100" },
            { title: "AVD — Atividades de vida diária", score: Number((a.score.subscales as any).avd ?? 0), max: 100, bands: HOOS_BANDS, higherIsBetter: true, unit: "/100" },
            { title: "Esporte / Lazer", score: Number((a.score.subscales as any).esporte ?? 0), max: 100, bands: HOOS_BANDS, higherIsBetter: true, unit: "/100" },
            { title: "Qualidade de vida", score: Number((a.score.subscales as any).qualidade_vida ?? 0), max: 100, bands: HOOS_BANDS, higherIsBetter: true, unit: "/100" },
            { title: "HOOS total", subtitle: "Média das 5 subescalas", score: a.score.total, max: 100, bands: HOOS_BANDS, higherIsBetter: true, unit: "/100" },
          ]}
        />
      )}
      {a.questionnaire_type === "koos12" && a.responded_at && a.score?.subscales && (
        <Koos12Chart
          total={a.score.total}
          subscales={a.score.subscales as { dor?: number; funcao?: number; qualidade_vida?: number }}
        />
      )}
      {a.questionnaire_type === "fiqr" && a.responded_at && typeof a.score?.total === "number" && (
        <ScoreRuler
          title="FIQR — Impacto da fibromialgia"
          subtitle="0 = sem impacto · 100 = impacto máximo."
          score={Number(a.score.total)}
          max={100}
          bands={FIQR_BANDS}
          unit="/100"
        />
      )}
      {a.questionnaire_type === "pps" && a.responded_at && typeof a.score?.total === "number" && (
        <ScoreRuler
          title="PPS — Palliative Performance Scale (v2)"
          subtitle="0 = óbito · 100 = funcionalidade normal."
          score={a.score.total}
          max={100}
          bands={PPS_BANDS}
          higherIsBetter
          unit="/100"
        />
      )}
      {a.questionnaire_type === "kps" && a.responded_at && typeof a.score?.total === "number" && (
        <ScoreRuler
          title="Karnofsky Performance Status"
          subtitle="0 = óbito · 100 = atividade normal sem queixas."
          score={a.score.total}
          max={100}
          bands={KPS_BANDS}
          higherIsBetter
          unit="/100"
        />
      )}
      {a.questionnaire_type === "isi" && a.responded_at && typeof a.score?.total === "number" && (
        <ScoreRuler
          title="ISI — Índice de Gravidade da Insônia"
          subtitle="≥ 15 indica insônia clínica."
          score={a.score.total}
          max={28}
          bands={ISI_BANDS}
          unit="/28"
        />
      )}
      {a.questionnaire_type === "whoqol_bref" && a.responded_at && a.score?.subscales && (
        <MultiRuler
          title="WHOQOL-BREF — Qualidade de vida"
          description="Quanto MAIOR, melhor a QV (escala 0–100 da OMS)."
          rulers={[
            { title: "Físico", score: Number((a.score.subscales as any).fisico ?? 0), max: 100, bands: WHOQOL_BANDS, higherIsBetter: true, unit: "/100" },
            { title: "Psicológico", score: Number((a.score.subscales as any).psicologico ?? 0), max: 100, bands: WHOQOL_BANDS, higherIsBetter: true, unit: "/100" },
            { title: "Social", score: Number((a.score.subscales as any).social ?? 0), max: 100, bands: WHOQOL_BANDS, higherIsBetter: true, unit: "/100" },
            { title: "Ambiente", score: Number((a.score.subscales as any).ambiente ?? 0), max: 100, bands: WHOQOL_BANDS, higherIsBetter: true, unit: "/100" },
            { title: "Geral", subtitle: "Itens 1 e 2 (autoavaliação global)", score: Number((a.score.subscales as any).geral ?? 0), max: 100, bands: WHOQOL_BANDS, higherIsBetter: true, unit: "/100" },
            { title: "WHOQOL total", subtitle: "Média dos 4 domínios", score: a.score.total, max: 100, bands: WHOQOL_BANDS, higherIsBetter: true, unit: "/100" },
          ]}
        />
      )}
      {a.questionnaire_type === "ppdi" && a.responded_at && typeof a.score?.total === "number" && (
        <ScoreRuler
          title="PPDI — Incapacidade por dor (pediátrico)"
          subtitle="0 = sem impacto · 48 = incapacidade máxima."
          score={a.score.total}
          max={48}
          bands={PPDI_BANDS}
          unit="/48"
          note="Acompanhe ao longo do tratamento: queda ≥ 8 pontos costuma indicar melhora clinicamente relevante."
        />
      )}
    </div>
  );
}

function AddAssessmentDialog({
  patientId,
  existingAssessments,
  onAdded,
}: {
  patientId: string;
  existingAssessments: Assessment[];
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<QuestionnaireType>("eva");
  const [day, setDay] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Dias futuros (>= dia escolhido) já existentes na jornada do paciente.
  // Ao adicionar um novo questionário, ele é replicado nesses dias também,
  // para que apareça nas avaliações subsequentes.
  const futureDays = Array.from(
    new Set(
      existingAssessments
        .filter((a) => a.day > day)
        .map((a) => a.day),
    ),
  ).sort((a, b) => a - b);

  async function add() {
    const baseDate = new Date(date + "T00:00:00");
    const candidates = [
      { patient_id: patientId, questionnaire_type: type, day, scheduled_date: date },
      ...futureDays.map((d) => {
        const sibling = existingAssessments.find((a) => a.day === d);
        const scheduled =
          sibling?.scheduled_date ??
          new Date(baseDate.getTime() + (d - day) * 86400000)
            .toISOString()
            .slice(0, 10);
        return {
          patient_id: patientId,
          questionnaire_type: type,
          day: d,
          scheduled_date: scheduled,
        };
      }),
    ];
    // Filtra dias que já têm esse tipo (evita violar a constraint única).
    const existsKey = new Set(
      existingAssessments
        .filter((a) => a.questionnaire_type === type)
        .map((a) => a.day),
    );
    const rows = candidates.filter((r) => !existsKey.has(r.day));
    const skipped = candidates.length - rows.length;
    if (rows.length === 0) {
      toast.info("Este questionário já existe nos dias selecionados.");
      setOpen(false);
      return;
    }
    const { error } = await supabase.from("assessments").insert(rows);
    if (error) { console.error(error); return toast.error("Não foi possível salvar. Tente novamente."); }
    const addedDays = rows.map((r) => `D${r.day}`).join(", ");
    toast.success(
      skipped > 0
        ? `Adicionado em ${addedDays}. ${skipped} já existia(m).`
        : rows.length > 1
          ? `Questionário adicionado em ${addedDays}.`
          : "Questionário adicionado.",
    );
    setOpen(false);
    onAdded();
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" /> Adicionar questionário
      </Button>
    );
  }
  return (
    <Card className="absolute right-4 z-10 mt-2 w-72 space-y-3 p-4 shadow-lg">
      <div>
        <label className="text-xs font-medium">Questionário</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as QuestionnaireType)}
          className="mt-1 w-full rounded-md border bg-background p-2 text-sm"
        >
          <optgroup label="Disponíveis">
            {QUESTIONNAIRES.filter((q) => !q.hidden).map((q) => (
              <option key={q.id} value={q.id}>
                {q.short} — {q.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Em construção">
            {QUESTIONNAIRES.filter((q) => q.hidden).map((q) => (
              <option key={q.id} value={q.id} disabled>
                {q.short} — {q.name}
              </option>
            ))}
          </optgroup>
        </select>
        {(() => {
          const meta = getQuestionnaire(type);
          if (!meta?.indication) return null;
          return (
            <div className="mt-2 rounded border-l-2 border-primary/30 bg-primary/5 px-2 py-1.5 text-[11px] leading-snug text-secondary/80">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                Indicação
              </div>
              {meta.indication}
            </div>
          );
        })()}
      </div>

      <div>
        <label className="text-xs font-medium">Dia da jornada</label>
        <select
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          className="mt-1 w-full rounded-md border bg-background p-2 text-sm"
        >
          {[0, 30, 60, 90, 180].map((d) => (
            <option key={d} value={d}>
              D{d}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium">Data prevista</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background p-2 text-sm"
        />
      </div>
      {futureDays.length > 0 && (
        <div className="rounded-md bg-primary/10 px-3 py-2 text-xs text-primary">
          Também será criado nas avaliações seguintes: {futureDays.map((d) => `D${d}`).join(", ")}.
        </div>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={add}>
          Adicionar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
