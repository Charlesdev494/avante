import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClinicLayout } from "@/components/clinic-layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pacientes/")({
  component: PatientsList,
});

interface Patient {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
  deleted_at: string | null;
}

function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const query = supabase
        .from("patients")
        .select("id, name, phone, created_at, deleted_at")
        .order("created_at", { ascending: false });
      const { data } = showTrash
        ? await query.not("deleted_at", "is", null)
        : await query.is("deleted_at", null);
      setPatients((data as Patient[]) ?? []);
      setLoading(false);
    })();
  }, [showTrash, reload]);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()),
  );

  async function restore(id: string) {
    const { error } = await supabase
      .from("patients")
      .update({ deleted_at: null })
      .eq("id", id);
    if (error) { console.error(error); return toast.error("Não foi possível restaurar. Tente novamente."); }
    toast.success("Paciente restaurado.");
    setReload((k) => k + 1);
  }

  async function purge(id: string) {
    if (!confirm("Apagar definitivamente este paciente e seus questionários? Esta ação não pode ser desfeita.")) return;
    await supabase.from("assessments").delete().eq("patient_id", id);
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) { console.error(error); return toast.error("Não foi possível remover. Tente novamente."); }
    toast.success("Paciente removido definitivamente.");
    setReload((k) => k + 1);
  }

  return (
    <ClinicLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            {showTrash ? "Lixeira" : "Pacientes"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showTrash ? "default" : "outline"}
            size="sm"
            onClick={() => setShowTrash((v) => !v)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            {showTrash ? "Ver ativos" : "Lixeira"}
          </Button>
          {!showTrash && (
            <Link to="/pacientes/novo">
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Novo paciente
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Card className="divide-y">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            {showTrash ? "Nenhum paciente na lixeira." : "Nenhum paciente cadastrado."}
          </div>
        ) : showTrash ? (
          filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div>
                <div className="font-medium text-secondary">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.phone || "sem telefone"} · apagado em{" "}
                  {p.deleted_at && new Date(p.deleted_at).toLocaleString("pt-BR")}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => restore(p.id)}>
                  <Undo2 className="mr-1 h-4 w-4" /> Restaurar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => purge(p.id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Apagar definitivamente
                </Button>
              </div>
            </div>
          ))
        ) : (
          filtered.map((p) => (
            <Link
              key={p.id}
              to="/pacientes/$id"
              params={{ id: p.id }}
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40"
            >
              <div>
                <div className="font-medium text-secondary">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.phone || "sem telefone"} · cadastrado em{" "}
                  {new Date(p.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <span className="text-sm text-primary">Abrir →</span>
            </Link>
          ))
        )}
      </Card>
    </ClinicLayout>
  );
}
