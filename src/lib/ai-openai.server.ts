/**
 * Ponte única com a OpenAI.
 *
 * O app nasceu chamando o gateway de IA da Lovable, que só existe dentro da
 * Lovable. Como o deploy passou a ser na Vercel, as funções de IA falavam com
 * um endereço que nunca ia responder. Aqui a conversa é direta com a OpenAI,
 * usando a mesma chave já configurada no US360.
 *
 * O sufixo .server.ts impede o Vite de mandar este arquivo para o navegador —
 * a chave nunca sai do servidor. Arquivos *.functions.ts vão para o bundle do
 * cliente, então eles devem importar este módulo dinamicamente, dentro do
 * handler: `const { chamarOpenAI } = await import("./ai-openai.server");`
 */

/** Formato de tool no schema da OpenAI — o mesmo que o gateway já usava. */
export type FerramentaOpenAI = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

const MODELO_PADRAO = "gpt-5.5";

/**
 * Faz a chamada obrigando o modelo a responder pela tool, e devolve os
 * argumentos já parseados. O tipo de retorno é responsabilidade de quem chama:
 * o schema da tool é quem garante o formato.
 */
export async function chamarOpenAI<T>(params: {
  system: string;
  user: string;
  tool: FerramentaOpenAI;
}): Promise<T> {
  // Lido dentro da função de propósito: em runtime serverless o env só existe
  // no momento da requisição — ler no escopo do módulo devolveria undefined.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY não configurada. Cadastre a variável no ambiente para habilitar a IA.",
    );
  }
  const modelo = process.env.OPENAI_MODEL || MODELO_PADRAO;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelo,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      tools: [params.tool],
      tool_choice: {
        type: "function",
        function: { name: params.tool.function.name },
      },
    }),
  });

  if (!res.ok) {
    const corpo = await res.text();
    // O corpo do erro pode conter a chave em mensagens de autenticação; loga só
    // o status e o código do erro, nunca a resposta crua inteira.
    console.error("OpenAI error:", res.status, corpo.slice(0, 300));
    if (res.status === 401)
      throw new Error("Chave da OpenAI inválida ou expirada. Verifique a configuração.");
    if (res.status === 429)
      throw new Error("Limite de uso da IA atingido. Tente novamente em alguns instantes.");
    if (res.status === 402 || corpo.includes("insufficient_quota"))
      throw new Error("Créditos da OpenAI esgotados. Verifique o saldo da conta.");
    throw new Error("Falha ao consultar a IA. Tente novamente.");
  }

  const json = await res.json();
  const call = json.choices?.[0]?.message?.tool_calls?.[0];
  const argsRaw = call?.function?.arguments;
  if (!argsRaw) throw new Error("Resposta da IA em formato inesperado.");
  try {
    return (typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw) as T;
  } catch {
    throw new Error("Resposta da IA em formato inesperado.");
  }
}
