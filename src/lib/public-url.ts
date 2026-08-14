// URL pública estável do app publicado. Usada nos links enviados a pacientes
// para evitar que o link aponte para a URL de preview (que exige login Lovable).
const PUBLISHED_ORIGIN = "https://journey-pain-compass.lovable.app";

/**
 * Retorna o origin que deve ser usado em links compartilhados com pacientes.
 * - Em preview do editor (id-preview--*.lovable.app) → força URL publicada.
 * - Em localhost → mantém o origin local para testes em dev.
 * - Em qualquer outro domínio (publicado, custom domain) → usa o origin atual.
 */
export function getPublicAppOrigin(): string {
  if (typeof window === "undefined") return PUBLISHED_ORIGIN;
  const { hostname, origin } = window.location;
  if (hostname.startsWith("id-preview--")) return PUBLISHED_ORIGIN;
  if (hostname === "localhost" || hostname === "127.0.0.1") return origin;
  return origin;
}
