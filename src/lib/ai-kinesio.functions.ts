import { createServerFn } from "@tanstack/react-start";

/**
 * Análise por IA da cinesiofobia (TSK-17) com previsão de barreiras
 * ao movimento e estratégia de intervenção embasada em literatura
 * (graded exposure, graded activity, educação em neurociência da dor,
 * abordagem cognitivo-comportamental, Fear-Avoidance Model de Vlaeyen).
 *
 * Retorna estrutura tipada via tool calling da OpenAI.
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
    // Import dinâmico: este arquivo vai para o bundle do cliente, o .server.ts não.
    const { chamarOpenAI } = await import("./ai-openai.server");

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
      type: "function" as const,
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

    return chamarOpenAI<KinesioAnalysis>({ system, user, tool });
  });
