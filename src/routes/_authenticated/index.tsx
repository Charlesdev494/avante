import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClinicLayout } from "@/components/clinic-layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowRight, Plus, Users, ClipboardList, AlertCircle, Trash2, Loader2 } from "lucide-react";
import avanteCapa from "@/assets/avante-capa.png";
import { getPublicAppOrigin } from "@/lib/public-url";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});

interface Stats {
  totalPatients: number;
  totalAssessments: number;
  pending: number;
}

interface PendingItem {
  id: string;
  patient_name: string;
  questionnaire_type: string;
  day: number;
  scheduled_date: string;
  token: string;
}

function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    totalAssessments: 0,
    pending: 0,
  });
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const deleting = deletingIds.size > 0;

  async function loadData() {
    const today = new Date().toISOString().slice(0, 10);
    const [{ count: pCount }, { count: aCount }, { data: pendData }] = await Promise.all([
      supabase.from("patients").select("*", { count: "exact", head: true }),
      supabase.from("assessments").select("*", { count: "exact", head: true }),
      supabase
        .from("assessments")
        .select("id, day, scheduled_date, questionnaire_type, token, patient_id, patients(name)")
        .lte("scheduled_date", today)
        .is("responded_at", null)
        .order("scheduled_date", { ascending: true })
        .limit(20),
    ]);

    const pendingMapped =
      (pendData ?? []).map((r: any) => ({
        id: r.id,
        patient_name: r.patients?.name ?? "—",
        questionnaire_type: r.questionnaire_type,
        day: r.day,
        scheduled_date: r.scheduled_date,
        token: r.token,
      })) ?? [];

    setStats({
      totalPatients: pCount ?? 0,
      totalAssessments: aCount ?? 0,
      pending: pendingMapped.length,
    });
    setPending(pendingMapped);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === pending.length) setSelected(new Set());
    else setSelected(new Set(pending.map((p) => p.id)));
  }

  async function deleteIds(ids: string[]) {
    if (ids.length === 0) return;
    setDeletingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
    const { error } = await supabase.from("assessments").delete().in("id", ids);
    setDeletingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    if (error) {
      console.error(error);
      toast.error("Não foi possível excluir pendências. Tente novamente.");
      return;
    }
    toast.success(
      ids.length === 1
        ? "Pendência removida"
        : `${ids.length} pendências removidas`,
    );
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    await loadData();
  }

  const allSelected = pending.length > 0 && selected.size === pending.length;

  return (
    <ClinicLayout>
      <section className="mb-10 grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <h1 className="text-3xl font-bold text-secondary sm:text-4xl">
            Avante Questionários
          </h1>
          <p className="mt-2 text-sm font-medium text-primary">
            Audição ativa · Visualização diagnóstica · Ações intervencionistas ·
            Números e questionários · Terapias integradas · Evolução monitorada
          </p>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Dor não mensurada é dor mal gerenciada. Acompanhe a jornada dos seus pacientes
            em D0, D30 e D90 com questionários validados.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate({ to: "/pacientes/novo" })}>
              <Plus className="mr-1 h-4 w-4" /> Novo paciente
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/pacientes" })}>
              <Users className="mr-1 h-4 w-4" /> Ver pacientes
            </Button>
          </div>
        </div>
        <img
          src={avanteCapa}
          alt="Capa Avante Questionários"
          width={240}
          height={360}
          className="hidden w-48 rounded-xl shadow-lg md:block lg:w-60"
        />
      </section>

      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Pacientes</div>
          <div className="mt-1 text-3xl font-semibold text-secondary">{stats.totalPatients}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Avaliações</div>
          <div className="mt-1 text-3xl font-semibold text-secondary">
            {stats.totalAssessments}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Pendentes hoje
          </div>
          <div className="mt-1 text-3xl font-semibold text-primary">{stats.pending}</div>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-secondary">Pendências</h2>
          </div>
          {pending.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todas"
                />
                Selecionar todas
              </label>
              <ConfirmDelete
                count={selected.size}
                disabled={selected.size === 0 || deleting}
                onConfirm={() => deleteIds(Array.from(selected))}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={selected.size === 0 || deleting}
                  >
                    {deleting && selected.size > 0 ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-1 h-4 w-4" />
                    )}
                    Excluir{selected.size > 0 ? ` (${selected.size})` : ""}
                  </Button>
                }
              />
            </div>
          )}
        </div>
        <Card className="divide-y">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
          ) : pending.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Nenhum questionário pendente hoje.
            </div>
          ) : (
            pending.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selected.has(p.id)}
                    onCheckedChange={() => toggleOne(p.id)}
                    className="mt-1"
                    aria-label={`Selecionar pendência de ${p.patient_name}`}
                  />
                  <div>
                    <div className="font-medium text-secondary">{p.patient_name}</div>
                    <div className="text-xs text-muted-foreground">
                      D{p.day} · {p.questionnaire_type.toUpperCase()} · agendado em{" "}
                      {new Date(p.scheduled_date).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <CopyLinkButton token={p.token} />
                  <Link to="/responder/$token" params={{ token: p.token }}>
                    <Button size="sm" variant="ghost">
                      Abrir <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                  <ConfirmDelete
                    count={1}
                    disabled={deleting}
                    onConfirm={() => deleteIds([p.id])}
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deletingIds.has(p.id)}
                        aria-label="Excluir pendência"
                      >
                        {deletingIds.has(p.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    }
                  />
                </div>
              </div>
            ))
          )}
        </Card>
        <p className="mt-3 text-xs text-muted-foreground">
          <ClipboardList className="mr-1 inline h-3 w-3" />
          Envie o link ao paciente por WhatsApp ou email. Ele verá apenas o questionário do
          dia.
        </p>
      </section>
    </ClinicLayout>
  );
}

function ConfirmDelete({
  count,
  trigger,
  onConfirm,
  disabled,
}: {
  count: number;
  trigger: React.ReactNode;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Excluir {count > 1 ? `${count} pendências` : "esta pendência"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. A(s) avaliação(ões) pendente(s) serão removidas
            permanentemente e o link enviado ao paciente deixará de funcionar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        const url = `${getPublicAppOrigin()}/responder/${token}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copiado!" : "Copiar link"}
    </Button>
  );
}
