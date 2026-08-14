import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Activity, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

/** Quantos dígitos o código do e-mail tem (mailer_otp_length no Supabase). */
const TAMANHO_CODIGO = 8;

type Modo = "entrar" | "cadastrar" | "codigo" | "recuperar";

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [busy, setBusy] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;

      // Com confirmação de e-mail ligada o cadastro não devolve sessão: o
      // Supabase manda o código e espera a confirmação. Com ela desligada a
      // sessão já vem pronta e não há o que confirmar.
      if (data.session) {
        navigate({ to: "/" });
        return;
      }
      setCodigo("");
      setModo("codigo");
      toast.success("Enviamos um código para o seu e-mail.");
    } catch (err) {
      console.error(err);
      toast.error(
        modo === "entrar" ? "E-mail ou senha incorretos." : "Não foi possível criar a conta.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmarCodigo(valor: string) {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: valor, type: "signup" });
    setBusy(false);

    if (error) {
      console.error(error);
      setCodigo("");
      toast.error(
        error.message.toLowerCase().includes("expired")
          ? "Este código expirou. Peça um novo."
          : "Código incorreto. Confira e tente de novo.",
      );
      return;
    }
    toast.success("Conta confirmada!");
    navigate({ to: "/" });
  }

  async function reenviarCodigo() {
    setReenviando(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setReenviando(false);
    if (error) {
      console.error(error);
      toast.error("Não foi possível reenviar agora. Aguarde um instante.");
      return;
    }
    toast.success("Código reenviado.");
  }

  async function pedirRecuperacao(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    // O redirectTo tem que apontar para /nova-senha: sem ele o Supabase usa a
    // site_url, o médico cai na home logado e não acha onde trocar a senha.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    });
    setBusy(false);
    if (error) console.error(error);
    // Resposta igual com ou sem erro, de propósito: dizer "este e-mail não
    // existe" entrega quem tem conta no sistema para quem estiver testando.
    toast.success("Se houver conta com esse e-mail, o link de recuperação chegou.");
    setModo("entrar");
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      console.error(result.error);
      toast.error("Falha ao entrar com Google.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  // ---------------------------------------------------------------- código
  if (modo === "codigo") {
    return (
      <Moldura legenda="Confirmar conta">
        <div className="flex flex-col items-center gap-2 text-center">
          <MailCheck className="h-9 w-9 text-primary" />
          <div className="text-sm text-muted-foreground">
            Digite o código de {TAMANHO_CODIGO} dígitos que enviamos para
            <br />
            <strong className="text-secondary">{email}</strong>
          </div>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={TAMANHO_CODIGO}
            value={codigo}
            onChange={(valor) => {
              setCodigo(valor);
              // Confirma sozinho ao completar: ninguém quer digitar 8 dígitos
              // e ainda procurar um botão.
              if (valor.length === TAMANHO_CODIGO) confirmarCodigo(valor);
            }}
            disabled={busy}
          >
            <InputOTPGroup>
              {Array.from({ length: TAMANHO_CODIGO }, (_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="space-y-2 text-center text-xs text-muted-foreground">
          <div>{busy ? "Confirmando…" : "O código vale por 1 hora."}</div>
          <button
            type="button"
            className="text-primary underline disabled:opacity-50"
            onClick={reenviarCodigo}
            disabled={reenviando || busy}
          >
            {reenviando ? "Reenviando…" : "Reenviar código"}
          </button>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setModo("cadastrar")}
        >
          <ArrowLeft className="h-3 w-3" /> Usar outro e-mail
        </button>
      </Moldura>
    );
  }

  // ------------------------------------------------------------ recuperar
  if (modo === "recuperar") {
    return (
      <Moldura legenda="Recuperar senha">
        <p className="text-sm text-muted-foreground">
          Informe seu e-mail que enviamos um link para você criar uma senha nova.
        </p>
        <form onSubmit={pedirRecuperacao} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email-rec">E-mail</Label>
            <Input
              id="email-rec"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Enviando…" : "Enviar link"}
          </Button>
        </form>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setModo("entrar")}
        >
          <ArrowLeft className="h-3 w-3" /> Voltar
        </button>
      </Moldura>
    );
  }

  // ------------------------------------------------------ entrar/cadastrar
  return (
    <Moldura legenda="Acesso do médico">
      <Button type="button" variant="outline" className="w-full" onClick={google} disabled={busy}>
        Entrar com Google
      </Button>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">Senha</Label>
            {modo === "entrar" && (
              <button
                type="button"
                className="text-xs text-primary underline"
                onClick={() => setModo("recuperar")}
              >
                Esqueci minha senha
              </button>
            )}
          </div>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        {modo === "entrar" ? (
          <>
            Ainda não tem conta?{" "}
            <button className="text-primary underline" onClick={() => setModo("cadastrar")}>
              Cadastrar
            </button>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <button className="text-primary underline" onClick={() => setModo("entrar")}>
              Entrar
            </button>
          </>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Pacientes não fazem login — eles respondem pelo link exclusivo enviado por você.{" "}
        <Link to="/" className="underline">
          Voltar
        </Link>
      </p>
    </Moldura>
  );
}

function Moldura({ legenda, children }: { legenda: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <div className="text-base font-semibold text-secondary">Avante Questionários</div>
            <div className="text-xs text-muted-foreground">{legenda}</div>
          </div>
        </div>
        {children}
      </Card>
    </div>
  );
}
