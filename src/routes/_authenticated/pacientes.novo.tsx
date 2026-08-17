import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ClinicLayout } from "@/components/clinic-layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { QUESTIONNAIRES, type QuestionnaireType } from "@/lib/questionnaires";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pacientes/novo")({
  component: NewPatientPage,
});

function NewPatientPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  // Sexo biológico, não gênero: o que define quais vistas anatômicas o Mapa da
  // Dor mostra (corpo inteiro e posição ginecológica).
  const [biologicalSex, setBiologicalSex] = useState<"female" | "male" | "">("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [d0Date, setD0Date] = useState(new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState<QuestionnaireType[]>(["eva", "pain_map"]);
  const [days, setDays] = useState<number[]>([0, 30, 90]);
  const [saving, setSaving] = useState(false);

  const toggleQ = (id: QuestionnaireType) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleDay = (d: number) =>
    setDays((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d].sort((a, b) => a - b)));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Informe o nome do paciente.");
    if (!biologicalSex) return toast.error("Informe o sexo biológico do paciente.");
    if (selected.length === 0) return toast.error("Selecione ao menos um questionário.");
    if (days.length === 0) return toast.error("Selecione ao menos um dia (0, 30 ou 90).");

    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const doctorLabel = userData.user?.email ?? "Médico";
    const { data: patient, error } = await supabase
      .from("patients")
      .insert({
        name: name.trim(),
        biological_sex: biologicalSex,
        birth_date: birthDate || null,
        phone: phone || null,
        email: email.trim() || null,
        notes: notes || null,
        doctor_name: doctorLabel,
      })
      .select()
      .single();

    if (error || !patient) {
      console.error(error);
      setSaving(false);
      return toast.error("Não foi possível salvar o paciente. Tente novamente.");
    }

    const base = new Date(d0Date);
    const rows = days.flatMap((day) =>
      selected.map((qType) => {
        const date = new Date(base);
        date.setDate(date.getDate() + day);
        return {
          patient_id: patient.id,
          questionnaire_type: qType,
          day,
          scheduled_date: date.toISOString().slice(0, 10),
        };
      }),
    );

    const { error: aErr } = await supabase.from("assessments").insert(rows);
    setSaving(false);
    if (aErr) return toast.error("Erro ao criar avaliações: " + aErr.message);

    toast.success("Paciente cadastrado!");
    navigate({ to: "/pacientes/$id", params: { id: patient.id } });
  }

  return (
    <ClinicLayout>
      <h1 className="mb-6 text-2xl font-bold text-secondary">Novo paciente</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-4 p-6">
          <h2 className="text-base font-semibold text-secondary">Dados do paciente</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio-sex">Sexo biológico *</Label>
              <div className="flex gap-2" id="bio-sex">
                {(
                  [
                    ["female", "Feminino"],
                    ["male", "Masculino"],
                  ] as const
                ).map(([valor, rotulo]) => (
                  <Button
                    key={valor}
                    type="button"
                    variant={biologicalSex === valor ? "default" : "outline"}
                    onClick={() => setBiologicalSex(valor)}
                    className="flex-1"
                  >
                    {rotulo}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Define as vistas do Mapa da Dor (corpo e região pélvica).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth">Data de nascimento</Label>
              <Input
                id="birth"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 91234-5678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="paciente@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d0">Data da consulta (D0) *</Label>
              <Input
                id="d0"
                type="date"
                value={d0Date}
                onChange={(e) => setD0Date(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações clínicas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-base font-semibold text-secondary">Dias de acompanhamento</h2>
          <p className="text-sm text-muted-foreground">
            Por padrão D0 (consulta), D30 e D90. Desmarque o que não quiser.
          </p>
          <div className="flex flex-wrap gap-4">
            {[0, 30, 90].map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={days.includes(d)}
                  onCheckedChange={() => toggleDay(d)}
                />
                <span className="font-medium">D{d}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-base font-semibold text-secondary">Questionários</h2>
          <p className="text-sm text-muted-foreground">
            Selecione os instrumentos a aplicar em cada data acima.
          </p>
          {(["available", "construction"] as const).map((group) => {
            const items = QUESTIONNAIRES.filter((q) =>
              group === "available" ? !q.hidden : q.hidden,
            );
            if (items.length === 0) return null;
            return (
              <div key={group} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group === "available" ? "Disponíveis" : "Em construção"}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((q) => {
                    const locked = q.hidden;
                    return (
                      <label
                        key={q.id}
                        className={
                          "flex items-start gap-3 rounded-md border p-3 transition-colors " +
                          (locked
                            ? "cursor-not-allowed bg-muted/40 opacity-60"
                            : "cursor-pointer hover:bg-muted/30")
                        }
                        title={
                          locked
                            ? "Em construção — em breve disponível para uso"
                            : undefined
                        }
                      >
                        <Checkbox
                          checked={!locked && selected.includes(q.id)}
                          disabled={locked}
                          onCheckedChange={() => !locked && toggleQ(q.id)}
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-secondary">
                            <span className={locked ? "line-through decoration-muted-foreground/60" : ""}>
                              {q.name}
                            </span>
                            {q.clinicianOnly && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                                Uso médico
                              </span>
                            )}
                            {locked && (
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                                Em construção
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{q.description}</div>
                          {q.indication && (
                            <div className="mt-1 rounded border-l-2 border-primary/30 bg-primary/5 px-2 py-1 text-[11px] leading-snug text-secondary/80">
                              <span className="font-semibold uppercase tracking-wide text-[10px] text-primary">
                                Indicação
                              </span>{" "}
                              {q.indication}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando…" : "Cadastrar paciente"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/pacientes" })}>
            Cancelar
          </Button>
        </div>
      </form>
    </ClinicLayout>
  );
}
