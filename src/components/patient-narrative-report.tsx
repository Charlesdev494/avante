import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Copy, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import {
  generatePatientNarrative,
  type NarrativeReport,
  type NarrativeAssessmentInput,
} from "@/lib/ai-narrative.functions";
import { getQuestionnaire } from "@/lib/questionnaires";
import { supabase } from "@/integrations/supabase/client";

interface Assessment {
  id: string;
  questionnaire_type: string;
  day: number;
  scheduled_date: string;
  responded_at: string | null;
  answers: any;
  score: any;
}

export function PatientNarrativeReport({
  patientName,
  assessments,
}: {
  patientName: string;
  assessments: Assessment[];
}) {
  const generate = useServerFn(generatePatientNarrative);
  const [doctorName, setDoctorName] = useState<string>("");
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (edited) return;
    supabase.auth.getUser().then(({ data }) => {
      setDoctorName(data.user?.email ?? "");
    });
  }, [edited]);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<NarrativeReport | null>(null);

  const answered = assessments.filter((a) => a.responded_at);

  async function run() {
    if (!answered.length) {
      toast.error("Ainda não há questionários respondidos.");
      return;
    }
    setLoading(true);
    try {
      const payload: NarrativeAssessmentInput[] = answered.map((a) => {
        const meta = getQuestionnaire(a.questionnaire_type);
        return {
          day: a.day,
          date: a.scheduled_date,
          type: a.questionnaire_type,
          short: meta?.short ?? a.questionnaire_type.toUpperCase(),
          name: meta?.name ?? a.questionnaire_type,
          score: a.score ?? null,
        };
      });
      const r = await generate({
        data: { patientName, doctorName: doctorName.trim() || "seu médico", assessments: payload },
      });
      setReport(r);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao gerar relato.");
    } finally {
      setLoading(false);
    }
  }

  async function copyReport() {
    if (!report) return;
    const text =
      `${report.greeting}\n\n` +
      report.body.join("\n\n") +
      `\n\nPontos que quero destacar:\n` +
      report.highlights.map((h) => `• ${h}`).join("\n") +
      `\n\n${report.closing}\n\n— ${doctorName}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Relato copiado!");
    } catch {
      window.prompt("Copie o relato:", text);
    }
  }

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-secondary">
              Relato pessoal com IA
            </h2>
            <p className="text-xs text-muted-foreground">
              Uma leitura compacta e empática de todos os questionários respondidos,
              em linguagem acessível e na sua primeira pessoa, para entregar ao paciente.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label htmlFor="doctorName" className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Assinado por
            </Label>
            <div className="relative">
              <Stethoscope className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="doctorName"
                value={doctorName}
                onChange={(e) => { setEdited(true); setDoctorName(e.target.value); }}
                className="h-8 w-56 pl-7 text-sm"
              />
            </div>
          </div>
          <Button size="sm" onClick={run} disabled={loading || !answered.length}>
            {loading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Gerando…
              </>
            ) : report ? (
              "Refazer relato"
            ) : (
              "Gerar relato"
            )}
          </Button>
        </div>
      </div>

      {!answered.length && (
        <p className="mt-3 text-xs text-muted-foreground">
          Ainda não há respostas registradas. Assim que o paciente responder o primeiro questionário,
          você poderá gerar o relato.
        </p>
      )}

      {report && (
        <div className="mt-4 space-y-4 rounded-md border bg-background p-4 text-sm leading-relaxed text-foreground">
          <p className="font-medium">{report.greeting}</p>
          {report.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {report.highlights.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                Pontos que quero destacar
              </div>
              <ul className="list-disc space-y-0.5 pl-5">
                {report.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="italic">{report.closing}</p>
          <p className="text-xs text-muted-foreground">— {doctorName}</p>

          <div className="flex justify-end pt-1">
            <Button size="sm" variant="outline" onClick={copyReport}>
              <Copy className="mr-1 h-4 w-4" /> Copiar para enviar
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Texto gerado por IA com base nos questionários respondidos. Revise antes de enviar ao paciente.
          </p>
        </div>
      )}
    </Card>
  );
}
