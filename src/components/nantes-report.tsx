import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

interface Props {
  answers: Record<string, number>;
  score: {
    total: number;
    max: number;
    interpretation: string;
    subscales: {
      essenciais: number;
      complementares: number;
      exclusoes: number;
      associados: number;
    };
  };
}

const ITEMS = {
  essenciais: [
    { id: "E1", label: "Dor no território do nervo pudendo (do ânus ao pênis/clitóris)", expected: "sim" as const },
    { id: "E2", label: "Dor predominantemente desencadeada pela posição sentada", expected: "sim" as const },
    { id: "E3", label: "A dor desperta o paciente durante a noite", expected: "nao" as const },
    { id: "E4", label: "Apresenta déficit sensitivo objetivo ao exame", expected: "nao" as const },
    { id: "E5", label: "Alívio com bloqueio anestésico do nervo pudendo", expected: "sim" as const },
  ],
  complementares: [
    { id: "C1", label: "Caráter neuropático (queimação, choque, fisgada, dormência)" },
    { id: "C2", label: "Alodínia ou hiperpatia na região" },
    { id: "C3", label: "Sensação de corpo estranho retal/vaginal" },
    { id: "C4", label: "Piora ao longo do dia" },
    { id: "C5", label: "Dor predominantemente unilateral" },
    { id: "C6", label: "Dor desencadeada/agravada pela defecação" },
    { id: "C7", label: "Sensibilidade exquisita à palpação da espinha isquiática" },
    { id: "C8", label: "Alterações neurofisiológicas" },
  ],
  exclusoes: [
    { id: "X1", label: "Dor exclusivamente coccígea, glútea, púbica ou hipogástrica" },
    { id: "X2", label: "Prurido como sintoma predominante" },
    { id: "X3", label: "Dor exclusivamente paroxística" },
    { id: "X4", label: "Alterações de imagem que expliquem a dor" },
  ],
  associados: [
    { id: "A1", label: "Dor glútea ao sentar (lesão proximal do pudendo)" },
    { id: "A2", label: "Dor referida no território ciático" },
    { id: "A3", label: "Dor suprapúbica" },
    { id: "A4", label: "Polaciúria e/ou dor ao enchimento vesical" },
  ],
};

function Row({
  item,
  value,
  expected,
}: {
  item: { id: string; label: string; expected?: "sim" | "nao" };
  value: number;
  expected: "sim" | "nao" | "neutro";
}) {
  const isYes = value === 1;
  // Cada item pode sobrescrever a expectativa (E3 e E4 são reversos: "Não" é o esperado).
  const exp = item.expected ?? expected;
  let tone = "text-muted-foreground";
  if (exp === "sim") tone = isYes ? "text-emerald-700" : "text-muted-foreground";
  else if (exp === "nao") tone = isYes ? "text-muted-foreground" : "text-emerald-700";
  else tone = isYes ? "text-destructive" : "text-muted-foreground"; // exclusões
  const met = exp === "sim" ? isYes : exp === "nao" ? !isYes : false;
  const Icon = met || (exp === "neutro" && isYes) ? (exp === "neutro" ? XCircle : CheckCircle2) : XCircle;
  return (
    <li className={`flex items-start gap-2 text-sm ${tone}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        <span className="font-medium">{item.id}.</span> {item.label}
        <span className="ml-1 font-semibold">{isYes ? "— Sim" : "— Não"}</span>
      </span>
    </li>
  );
}

export function NantesReport({ answers, score }: Props) {
  const { essenciais, complementares, exclusoes, associados } = score.subscales;
  const diagnosticOk = essenciais === 5 && exclusoes === 0;
  const diagnosticBlocked = exclusoes > 0;

  return (
    <Card className="mt-3 space-y-4 border-secondary/20 bg-muted/30 p-4">
      {/* Conclusão clínica */}
      <div
        className={`flex items-start gap-3 rounded-md border p-3 ${
          diagnosticOk
            ? "border-emerald-300 bg-emerald-50"
            : diagnosticBlocked
              ? "border-destructive/40 bg-destructive/5"
              : "border-amber-300 bg-amber-50"
        }`}
      >
        {diagnosticOk ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
        ) : diagnosticBlocked ? (
          <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
        )}
        <div className="text-sm">
          <div className="font-semibold text-secondary">Leitura clínica</div>
          <p className="mt-1 text-secondary">{score.interpretation}</p>
        </div>
      </div>

      {/* Resumo numérico */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Essenciais" value={`${essenciais}/5`} good={essenciais === 5} />
        <Stat label="Complementares" value={`${complementares}/8`} neutral />
        <Stat label="Exclusão" value={`${exclusoes}/4`} bad={exclusoes > 0} />
        <Stat label="Associados" value={`${associados}/4`} neutral />
      </div>

      {/* Itens marcados */}
      <Section
        title="Critérios essenciais (todos devem ser SIM)"
        helper={`${essenciais} de 5 presentes`}
        items={ITEMS.essenciais.map((i) => ({ ...i, v: answers[i.id] ?? 0 }))}
        expected="sim"
      />
      <Section
        title="Critérios complementares (reforçam o diagnóstico)"
        helper={`${complementares} de 8 presentes`}
        items={ITEMS.complementares.map((i) => ({ ...i, v: answers[i.id] ?? 0 }))}
        expected="sim"
      />
      <Section
        title="Critérios de exclusão (se SIM, afastam o diagnóstico)"
        helper={exclusoes > 0 ? `${exclusoes} presente(s) — atenção` : "Nenhum presente"}
        items={ITEMS.exclusoes.map((i) => ({ ...i, v: answers[i.id] ?? 0 }))}
        expected="neutro"
      />
      <Section
        title="Critérios associados (sugerem diagnóstico concomitante)"
        helper={`${associados} de 4 presentes`}
        items={ITEMS.associados.map((i) => ({ ...i, v: answers[i.id] ?? 0 }))}
        expected="neutro"
      />

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Referência: Labat JJ et al. <em>Diagnostic criteria for pudendal neuralgia (Nantes criteria)</em>. Neurourol Urodyn 2008;27(4):306–10.
      </p>
    </Card>
  );
}

function Stat({ label, value, good, bad, neutral }: { label: string; value: string; good?: boolean; bad?: boolean; neutral?: boolean }) {
  const color = good ? "text-emerald-700" : bad ? "text-destructive" : "text-secondary";
  return (
    <div className="rounded-md border bg-background p-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  );
}

function Section({
  title,
  helper,
  items,
  expected,
}: {
  title: string;
  helper: string;
  items: { id: string; label: string; v: number; expected?: "sim" | "nao" }[];
  expected: "sim" | "nao" | "neutro";
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-secondary">{title}</h4>
        <span className="text-xs text-muted-foreground">{helper}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <Row key={i.id} item={i} value={i.v} expected={expected} />
        ))}
      </ul>
    </div>
  );
}
