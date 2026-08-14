import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Activity, BookOpen, LogOut, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ClinicLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [claiming, setClaiming] = useState(false);
  const [hasLegacy, setHasLegacy] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    // Detecta pacientes legados (owner_id IS NULL) — só funciona porque a policy
    // permite SELECT desses até alguém reivindicar.
    supabase
      .from("patients")
      .select("id", { count: "exact", head: true })
      .is("owner_id", null)
      .then(({ count }) => setHasLegacy((count ?? 0) > 0));
  }, []);

  async function claim() {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_legacy_patients");
    setClaiming(false);
    if (error) { console.error(error); toast.error("Não foi possível reivindicar."); return; }
    toast.success(`${data ?? 0} pacientes vinculados à sua conta.`);
    setHasLegacy(false);
    window.location.reload();
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <div>
              <div className="text-base font-semibold leading-tight tracking-wide">Avante Questionários</div>
              <div className="text-xs text-secondary-foreground/70">{email}</div>
            </div>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/pacientes"
              className={`rounded-md px-3 py-2 transition-colors ${
                isActive("/pacientes") ? "bg-primary text-primary-foreground" : "hover:bg-white/10"
              }`}
            >
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" />Pacientes</span>
            </Link>
            <Link
              to="/manual"
              className={`rounded-md px-3 py-2 transition-colors ${
                isActive("/manual") ? "bg-primary text-primary-foreground" : "hover:bg-white/10"
              }`}
            >
              <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" />Manual</span>
            </Link>
            <Button size="sm" variant="ghost" onClick={logout} className="text-secondary-foreground hover:bg-white/10">
              <LogOut className="mr-1 h-4 w-4" />Sair
            </Button>
          </nav>
        </div>
        {hasLegacy && (
          <div className="border-t border-white/10 bg-primary/20 px-4 py-2 text-xs">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
              <span>Existem pacientes anteriores ao login ainda sem dono. Reivindique-os para sua conta.</span>
              <Button size="sm" onClick={claim} disabled={claiming}>
                {claiming ? "Reivindicando…" : "Reivindicar pacientes legados"}
              </Button>
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children ?? <Outlet />}</main>
      <footer className="mt-16 border-t bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <div>© Dr. Charles Oliveira</div>
          <div className="flex gap-4">
            <a href="https://instagram.com/drcharledoliveira" target="_blank" rel="noreferrer" className="hover:text-primary">@drcharledoliveira</a>
            <a href="https://drcharlesoliveira.com.br" target="_blank" rel="noreferrer" className="hover:text-primary">drcharlesoliveira.com.br</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
