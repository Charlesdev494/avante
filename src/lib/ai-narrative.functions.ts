import { createServerFn } from "@tanstack/react-start";

/**
 * Gera um relato clínico empático, em primeira pessoa, traduzindo em
 * linguagem acessível o conjunto de questionários já respondidos pelo
 * paciente. Pensado para ser entregue ao próprio paciente — curto,
 * humano, sem jargão e sem cansar a leitura.
 */

export interface NarrativeAssessmentInput {
  day: number;
  date: string | null;
  type: string;
  short: string;
  name: string;
  score: any;
  // resumo opcional adicional (ex.: subscalas)
  summary?: string;
}

export interface NarrativeReport {
  greeting: string;
  body: string[]; // 2 a 4 parágrafos curtos
  highlights: string[]; // 2 a 4 bullets de pontos práticos
  closing: string;
}

export const generatePatientNarrative = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      patientName: string;
      doctorName: string;
      assessments: NarrativeAssessmentInput[];
    }) => input,
  )
  .handler(async ({ data }): Promise<NarrativeReport> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada.");

    if (!data.assessments.length) {
      throw new Error("Sem questionários respondidos para resumir.");
    }

    // Agrupa por dia para dar leitura cronológica
    const byDay = new Map<number, NarrativeAssessmentInput[]>();
    for (const a of data.assessments) {
      if (!byDay.has(a.day)) byDay.set(a.day, []);
      byDay.get(a.day)!.push(a);
    }
    const days = Array.from(byDay.keys()).sort((x, y) => x - y);

    const lines: string[] = [];
    for (const d of days) {
      const items = byDay.get(d)!;
      lines.push(`\n# Dia ${d}${items[0].date ? ` (${items[0].date})` : ""}`);
      for (const a of items) {
        const sc = a.score ?? {};
        const parts: string[] = [];
        if (sc.value !== undefined) parts.push(`valor ${sc.value}`);
        if (sc.total !== undefined && sc.max !== undefined)
          parts.push(`${sc.total}/${sc.max}`);
        if (sc.percent !== undefined) parts.push(`${sc.percent}%`);
        if (sc.interpretation) parts.push(sc.interpretation);
        if (sc.subscales) {
          const sub = Object.entries(sc.subscales)
            .map(([k, v]) => `${k}=${v}`)
            .join(", ");
          parts.push(`subscalas: ${sub}`);
        }
        if (a.summary) parts.push(a.summary);
        lines.push(`- ${a.short} (${a.name}): ${parts.join(" · ") || "respondido"}`);
      }
    }

    const system = `Você é um assistente clínico que escreve em nome do(a) médico(a) "${data.doctorName}" para o(a) paciente "${data.patientName}".

Sua tarefa: traduzir em linguagem acessível o conjunto de questionários respondidos, gerando um RELATO PESSOAL, EMPÁTICO, EM PRIMEIRA PESSOA (assinado pelo médico), CURTO e que NÃO CANSE quem está lendo.

Regras absolutas:
- Português do Brasil, tom humano e acolhedor — sem frieza clínica, sem alarmismo, sem promessas.
- Primeira pessoa do singular ("eu vi", "percebi", "pude notar"). Trate o paciente por "você".
- NUNCA use jargão técnico solto. Se citar uma sigla, traduza no mesmo trecho (ex.: "a escala de dor (EVA)").
- NÃO dê diagnóstico novo, prescrição ou prognóstico fechado. Você comenta o que os questionários mostraram.
- NÃO repita números secos: transforme em interpretação prática (ex.: 7/10 = "uma dor que pesa bastante no seu dia").
- Quando houver mais de um dia, comente a evolução brevemente (melhora, piora, estabilidade).
- Compacto: 2 a 4 parágrafos curtos no corpo, frases enxutas, sem listas longas dentro do texto.

Estrutura de saída (obrigatória via tool):
- greeting: cumprimento curto e caloroso (1 frase).
- body: 2 a 4 parágrafos curtos, cada um com 1 a 3 frases.
- highlights: 2 a 4 bullets bem práticos — o que mais chamou atenção e o que vale a pena conversar na próxima consulta.
- closing: encerramento humano em 1–2 frases, assinado em primeira pessoa.`;

    const user = `Paciente: ${data.patientName}
Médico que assina: ${data.doctorName}

Dados dos questionários respondidos (use como base de leitura — NÃO copie números crus para o relato final):
${lines.join("\n")}

Gere o relato seguindo as regras.`;

    const tool = {
      type: "function",
      function: {
        name: "report_patient_narrative",
        description: "Estrutura o relato pessoal do paciente.",
        parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
            greeting: { type: "string" },
            body: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
            highlights: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
            closing: { type: "string" },
          },
          required: ["greeting", "body", "highlights", "closing"],
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
          function: { name: "report_patient_narrative" },
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
    return parsed as NarrativeReport;
  });
