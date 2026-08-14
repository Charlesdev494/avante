import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Usa getSession() (lê do localStorage, instantâneo) em vez de getUser()
    // (vai à rede). Isso evita logout falso quando a rede está instável ou
    // o token está apenas sendo renovado em background. O Supabase já cuida
    // do auto-refresh do token.
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
    return { user: data.session.user };
  },
  component: () => <Outlet />,
});
