import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Tela de definir nova senha, aberta pelo link do e-mail de recuperação.
 *
 * O link do Supabase não traz a senha nem um formulário: ele abre o app já
 * com uma sessão de recuperação ativa. Quem manda esse link para a home deixa
 * o médico logado e sem lugar nenhum para trocar a senha — o fluxo morre ali.
 * Por isso o /auth pede o redirecionamento para cá.
 *
 * ssr: false porque a sessão só existe no navegador — ela chega no endereço
 * (hash ou ?code=) e é o supabase-js que a processa ao carregar a página.
 */
export const Route = createFileRoute("/nova-senha")({
  ssr: false,
  component: NovaSenhaPage,
});

/** verificando: ainda processando o link · liberado: pode trocar · invalido: link velho ou já usado */
type Estado = "verificando" | "liberado" | "invalido";

function NovaSenhaPage() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let vivo = true;

    // O supabase-js processa o link de forma assíncrona e avisa por evento.
    // Escutamos antes de perguntar, senão o PASSWORD_RECOVERY pode disparar
    // no intervalo entre a pergunta e a inscrição, e a tela ficaria presa
    // em "verificando".
    const { data: sub } = supabase.auth.onAuthStateChange((evento, sessao) => {
      if (!vivo) return;
      if (evento === "PASSWORD_RECOVERY" || sessao) setEstado("liberado");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!vivo) return;
      setEstado((atual) => (atual === "liberado" ? atual : data.session ? "liberado" : "invalido"));
    });

    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) return toast.error("A senha precisa ter ao menos 6 caracteres.");
    if (senha !== confirmacao) return toast.error("As duas senhas não são iguais.");

    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);

    if (error) {
      console.error(error);
      // O caso comum aqui é o link ter expirado enquanto a pessoa digitava.
      toast.error(
        error.message.toLowerCase().includes("expired")
          ? "O link expirou. Peça um novo e-mail de recuperação."
          : "Não foi possível salvar a nova senha.",
      );
      return;
    }

    setPronto(true);
    toast.success("Senha alterada!");
    setTimeout(() => navigate({ to: "/" }), 1200);
  }

  if (estado === "verificando") {
    return <Moldura>Verificando o link…</Moldura>;
  }

  if (estado === "invalido") {
    return (
      <Moldura>
        <p className="text-sm text-muted-foreground">
          Este link de recuperação não vale mais. Eles expiram em 1 hora e só podem ser usados uma
          vez.
        </p>
        <Button asChild className="mt-4 w-full">
          <Link to="/auth">Pedir um novo link</Link>
        </Button>
      </Moldura>
    );
  }

  if (pronto) {
    return (
      <Moldura>
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <div className="font-semibold text-secondary">Senha alterada</div>
          <div className="text-sm text-muted-foreground">Levando você para o app…</div>
        </div>
      </Moldura>
    );
  }

  return (
    <Moldura>
      <form onSubmit={salvar} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="senha">Nova senha</Label>
          <Input
            id="senha"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">Ao menos 6 caracteres.</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmacao">Repita a nova senha</Label>
          <Input
            id="confirmacao"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar nova senha"}
        </Button>
      </form>
    </Moldura>
  );
}

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <div className="text-base font-semibold text-secondary">Avante Questionários</div>
            <div className="text-xs text-muted-foreground">Definir nova senha</div>
          </div>
        </div>
        {children}
      </Card>
    </div>
  );
}
