import { createServerFn } from "@tanstack/react-start";

/**
 * Análise por IA da cinesiofobia (TSK-17) com previsão de barreiras
 * ao movimento e estratégia de intervenção embasada em literatura
 * (graded exposure, graded activity, educação em neurociência da dor,
 * abordagem cognitivo-comportamental, Fear-Avoidance Model de Vlaeyen).
 *
 * Retorna estrutura tipada via tool calling do Lovable AI Gateway.
 */

export interface TskItemAnswer {
  id: string;
  prompt: string;
  /** Valor 1–4 escolhido pelo paciente (já com reversão tratada no payload). */
  value: number;
  /** Texto da opção escolhida (ex: "Concordo totalmente"). */
  optionLabel: string;
  /** True quando o item é dos que somam de forma "reversa". */
  reversed: boolean;
}

export interface KinesioAnalysis {
  risk: "baixo" | "moderado" | "alto";
  riskRationale: string;
  barriers: string[];
  redFlags: string[];
  strategy: { phase: string; goal: string; actions: string[] }[];
  patientLanguage: string;
}

export const analyzeKinesiophobia = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      patientName: string;
      tskTotal: number;
      tskMax: number;
      tskInterpretation: string;
      answers: TskItemAnswer[];
      context?: {
        evaCurrent?: number | null;
        pcsTotal?: number | null;
        odiPercent?: number | null;
        hadsAnsiedade?: number | null;
        hadsDepressao?: number | null;
        sf36Vitalidade?: number | null;
        sf36SaudeMental?: number | null;
      };
    }) => input,
  )
  .handler(async ({ data }): Promise<KinesioAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");

    const itemsText = data.answers
      .map(
        (a) =>
          `- Item ${a.id}${a.reversed ? " (invertido)" : ""}: "${a.prompt}" → ${a.value}/4 ("${a.optionLabel}")`,
      )
      .join("\n");

    const ctx = data.context ?? {};
    const ctxText = [
      ctx.evaCurrent != null ? `EVA atual: ${ctx.evaCurrent}/10` : null,
      ctx.pcsTotal != null ? `PCS (catastrofização): ${ctx.pcsTotal}/52` : null,
      ctx.odiPercent != null ? `ODI: ${ctx.odiPercent}%` : null,
      ctx.hadsAnsiedade != null ? `HADS Ansiedade: ${ctx.hadsAnsiedade}/21` : null,
      ctx.hadsDepressao != null ? `HADS Depressão: ${ctx.hadsDepressao}/21` : null,
      ctx.sf36Vitalidade != null ? `SF-36 Vitalidade: ${ctx.sf36Vitalidade}/100` : null,
      ctx.sf36SaudeMental != null ? `SF-36 Saúde Mental: ${ctx.sf36SaudeMental}/100` : null,
    ]
      .filter(Boolean)
      .join("; ");

    const system = `Você é um assistente clínico para o Dr. Charles Oliveira (especialista em dor crônica e reabilitação). Sua função é interpretar o questionário TSK-17 (Tampa Scale for Kinesiophobia) à luz da literatura — Fear-Avoidance Model (Vlaeyen & Linton), graded exposure in vivo, graded activity, educação em neurociência da dor (Moseley/Butler) e abordagem cognitivo-comportamental.

Princípios:
- Pontuação TSK ≥ 37 indica cinesiofobia clinicamente relevante; ≥ 50, cinesiofobia alta com forte preditor de evitação e cronificação.
- Itens 4, 8, 12 e 16 são reversos: pontuação ALTA neles (após reversão) indica crenças mais saudáveis sobre movimento; baixa pontuação após reversão é sinal de fusão dor=dano.
- Itens-chave para "medo de movimento/lesão" (1, 9, 15, 17), "fusão dor=dano" (2, 3, 7, 11), "hipervigilância" (10, 13), "evitação social/atividade" (5, 14).
- Combine TSK com EVA, PCS (catastrofização) e HADS (ansiedade/depressão) quando disponíveis — risco se eleva muito quando TSK alto + PCS alto + HADS alto.

Você NUNCA dá diagnóstico médico nem substitui o julgamento do Dr. Charles. Seu papel é destacar barreiras prováveis e sugerir uma estratégia inicial que ele possa adaptar.

Responda SEMPRE em português do Brasil, tom clínico e direto, sem floreios.`;

    const user = `Paciente: ${data.patientName || "(sem nome)"}
TSK-17: ${data.tskTotal}/${data.tskMax} — ${data.tskInterpretation}
${ctxText ? `Contexto adicional: ${ctxText}` : "Sem contexto adicional disponível."}

Respostas item a item (1 = discordo totalmente, 4 = concordo totalmente):
${itemsText}

Tarefa:
1. Classifique o RISCO de o paciente apresentar dificuldade em ser colocado em movimento (baixo / moderado / alto) com justificativa breve.
2. Liste as BARREIRAS prováveis, citando os itens que mais sustentam essa leitura.
3. Sinalize RED FLAGS comportamentais que merecem atenção (catastrofização, fusão dor=dano, hipervigilância, dependência, isolamento).
4. Proponha uma ESTRATÉGIA DE INTERVENÇÃO em fases (educação em dor → dessensibilização gradual → exposição graduada → reintegração funcional), com 2 a 4 ações concretas por fase.
5. Sugira uma frase curta em LINGUAGEM DO PACIENTE que o Dr. Charles possa usar para abrir conversa sobre movimento sem disparar defensividade.`;

    const tool = {
      type: "function",
      function: {
        name: "report_kinesiophobia_analysis",
        description: "Estrutura a análise clínica do TSK-17.",
        parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
            risk: { type: "string", enum: ["baixo", "moderado", "alto"] },
            riskRationale: { type: "string" },
            barriers: { type: "array", items: { type: "string" } },
            redFlags: { type: "array", items: { type: "string" } },
            strategy: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  phase: { type: "string" },
                  goal: { type: "string" },
                  actions: { type: "array", items: { type: "string" } },
                },
                required: ["phase", "goal", "actions"],
              },
            },
            patientLanguage: { type: "string" },
          },
          required: [
            "risk",
            "riskRationale",
            "barriers",
            "redFlags",
            "strategy",
            "patientLanguage",
          ],
        },
      },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        tools: [tool],
        tool_choice: {
          type: "function",
          function: { name: "report_kinesiophobia_analysis" },
        },
      }),
    });

    if (!res.ok) {
      if (res.status === 429)
        throw new Error("Limite de uso da IA atingido. Tente novamente em alguns instantes.");
      if (res.status === 402)
        throw new Error("Créditos de IA esgotados. Adicione créditos na sua workspace Lovable.");
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error("Falha ao consultar a IA. Tente novamente.");
    }

    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = call?.function?.arguments;
    if (!argsRaw) throw new Error("Resposta da IA em formato inesperado.");
    const parsed = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
    return parsed as KinesioAnalysis;
  });
