import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Cache-busting / version watcher.
 *
 * Estratégia: ao montar e sempre que a aba volta a ficar visível ou ganha foco,
 * busca o HTML da raiz com cache desativado e extrai o hash do bundle JS
 * principal (script type="module" gerado pelo Vite). Se o hash mudou em
 * relação ao carregado pelo navegador, oferecemos recarregar — assim quem
 * abriu o link antes de uma publicação nova não fica preso à versão antiga.
 */
export function VersionWatcher() {
  const currentHashRef = useRef<string | null>(null);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pickHash = (html: string): string | null => {
      // Procura o primeiro <script ... src="/_build/.../*.js"> ou similar.
      const m = html.match(/<script[^>]+src="([^"]+\.js)"/i);
      return m ? m[1] : null;
    };

    // Hash atual = primeiro <script src> no DOM já carregado.
    const initial = Array.from(document.querySelectorAll("script[src]"))
      .map((s) => (s as HTMLScriptElement).src)
      .find((s) => s.endsWith(".js")) ?? null;
    currentHashRef.current = initial;

    let cancelled = false;

    async function check() {
      if (cancelled || notifiedRef.current) return;
      try {
        const res = await fetch(`/?_cb=${Date.now()}`, {
          cache: "no-store",
          headers: { "cache-control": "no-cache" },
        });
        if (!res.ok) return;
        const html = await res.text();
        const latest = pickHash(html);
        if (!latest || !currentHashRef.current) return;
        // Compara só o nome do arquivo (a origem pode diferir).
        const curName = currentHashRef.current.split("/").pop();
        const latestName = latest.split("/").pop();
        if (curName && latestName && curName !== latestName) {
          notifiedRef.current = true;
          toast("Nova versão disponível", {
            description: "Recarregue para ver as atualizações mais recentes.",
            duration: Infinity,
            action: {
              label: "Recarregar",
              onClick: () => window.location.reload(),
            },
          });
        }
      } catch {
        // silencioso — sem rede, sem alerta.
      }
    }

    // Checa logo após montar e em foco/visibilidade.
    const t = setTimeout(check, 1500);
    const onFocus = () => check();
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(t);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
