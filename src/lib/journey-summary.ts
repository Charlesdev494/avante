import { getQuestionnaire, interpretEva, type QuestionnaireType } from "./questionnaires";

export interface DayAssessment {
  questionnaire_type: string;
  score: any;
  answers: any;
}

export interface SummaryItem {
  type: string;
  short: string;
  name: string;
  line: string;
  tone: "good" | "watch" | "alert" | "neutral";
}

export interface JourneySummary {
  items: SummaryItem[];
  encouragement: string;
  intro: string;
}

function toneFromInterpretation(s: string): SummaryItem["tone"] {
  const t = s.toLowerCase();
  if (/(sem dor|leve|mínim|improvável|baixa|sem problemas|negativ)/.test(t)) return "good";
  if (/(moderad|possível|média)/.test(t)) return "watch";
  if (/(intens|grave|sever|alta|provável|positiv|incapacit)/.test(t)) return "alert";
  return "neutral";
}

export function buildJourneySummary(
  patientName: string,
  day: number,
  list: DayAssessment[],
): JourneySummary {
  const items: SummaryItem[] = [];

  for (const a of list) {
    const meta = getQuestionnaire(a.questionnaire_type as QuestionnaireType);
    const short = meta?.short ?? a.questionnaire_type.toUpperCase();
    const name = meta?.name ?? short;

    if (a.questionnaire_type === "pain_map") {
      items.push({
        type: a.questionnaire_type,
        short,
        name,
        line: "Mapa da dor registrado — suas marcações ajudam o Dr. Charles a acompanhar a evolução das regiões afetadas.",
        tone: "neutral",
      });
      continue;
    }

    if (a.questionnaire_type === "eva" && a.score?.value !== undefined) {
      const v = a.score.value as number;
      const interp = interpretEva(v);
      items.push({
        type: a.questionnaire_type,
        short,
        name,
        line: `Intensidade da dor agora: ${v}/10 — ${interp}.`,
        tone: toneFromInterpretation(interp),
      });
      continue;
    }

    if (a.score && typeof a.score === "object") {
      const interp = a.score.interpretation ?? "registrado";
      const totalTxt =
        a.score.percent !== undefined
          ? `${a.score.total}${a.score.max === 100 ? "" : `/${a.score.max}`} (${a.score.percent}%)`
          : a.score.total !== undefined
            ? `${a.score.total}/${a.score.max}`
            : "";
      items.push({
        type: a.questionnaire_type,
        short,
        name,
        line: `${totalTxt ? totalTxt + " — " : ""}${interp}.`,
        tone: toneFromInterpretation(String(interp)),
      });
    }
  }

  const alerts = items.filter((i) => i.tone === "alert").length;
  const watches = items.filter((i) => i.tone === "watch").length;
  const goods = items.filter((i) => i.tone === "good").length;

  const first = patientName.split(" ")[0] || "você";

  // Seed pseudo-aleatório estável por paciente+dia, para variar entre jornadas
  // mas manter consistência se o paciente recarregar a mesma tela.
  const seed = hashString(`${patientName}|${day}|${items.map((i) => i.type).join(",")}`);
  const pick = <T,>(arr: T[]) => arr[seed % arr.length];
  const pick2 = <T,>(arr: T[]) => arr[(seed * 7 + 3) % arr.length];

  const intros = [
    `${first}, obrigado por reservar este tempo. Cada resposta sua é uma peça importante do cuidado que o Dr. Charles constrói com você.`,
    `${first}, que bom ter você aqui de novo. O que você compartilhou hoje vai direto para as mãos do Dr. Charles.`,
    `${first}, suas respostas chegaram. Pode parecer simples, mas é assim — um dia de cada vez — que a gente acompanha a sua evolução de perto.`,
    `Oi, ${first}. Obrigado por responder com sinceridade. É a sua voz, mais do que qualquer exame, que guia os próximos passos do tratamento.`,
    `${first}, recebido. Saber como você está hoje é o que permite ajustar o caminho até o seu melhor.`,
  ];
  const intro = pick(intros);

  let encouragement: string;
  if (alerts === 0 && watches === 0 && goods > 0) {
    const opts = [
      `Os números de hoje sorriem para você — e isso é resultado da sua constância. Continue no plano combinado: o corpo está respondendo.`,
      `Hoje é dia de comemorar com discrição: seus resultados estão num bom lugar. Mantenha o ritmo, sem pressa e sem pausa.`,
      `O que você descreveu hoje mostra um terreno favorável. Aproveite essa fase para reforçar os hábitos que estão funcionando.`,
      `Resultados assim não acontecem por acaso — são fruto do que você vem fazendo. Siga firme; o Dr. Charles vai gostar de ver esses dados.`,
    ];
    encouragement = pick2(opts);
  } else if (alerts === 0 && watches > 0) {
    const opts = [
      `Existem pontos a observar com calma, e tudo bem — é exatamente para isso que servem estas avaliações. A dor de hoje não decide o seu amanhã.`,
      `Alguns sinais pedem atenção, nada que não possamos trabalhar juntos. Recuperação não é linha reta; é uma curva que vai melhorando.`,
      `Vejo que há áreas para acompanhar de perto. Respire fundo: você está fazendo a parte mais difícil, que é se cuidar com método.`,
      `Há detalhes para ajustar, e essa informação vale ouro para o seu tratamento. Cada dado seu encurta o caminho até a melhora.`,
    ];
    encouragement = pick2(opts);
  } else if (alerts > 0) {
    const opts = [
      `Sei que alguns resultados podem pesar — e está tudo bem sentir isso. Eles não são uma sentença: são o mapa que o Dr. Charles precisa para abrir o melhor caminho. Você não está sozinho(a) nessa.`,
      `Dias difíceis também fazem parte da jornada. O que você relatou hoje permite mirar exatamente onde precisa cuidar primeiro. A melhora vem por etapas, e cada etapa conta.`,
      `Quando a dor aperta, é fácil duvidar do progresso — mas é justamente nestes momentos que os dados que você compartilha mais ajudam. Conte com a equipe; o próximo passo já está sendo desenhado.`,
      `Reconhecer que está difícil já é um ato de coragem. O Dr. Charles vai usar cada resposta sua para ajustar o tratamento, e juntos vamos transformar este momento em ponto de virada.`,
    ];
    encouragement = pick2(opts);
  } else {
    const opts = [
      `Suas respostas foram registradas com cuidado. Aos poucos, juntando os dias, conseguimos enxergar com nitidez a sua trajetória.`,
      `Tudo recebido. A jornada da dor é feita de pequenos registros como este — e cada um deles importa.`,
      `Pronto, ${first}. Cada avaliação é uma fotografia do momento; com várias delas, montamos o filme da sua recuperação.`,
    ];
    encouragement = pick2(opts);
  }

  if (day === 0) {
    const tails = [
      ` Este é o seu ponto de partida — daqui em diante, cada avaliação vai mostrar o quanto você avançou.`,
      ` Hoje marcamos o km 0 da sua jornada. A partir daqui, só temos para onde crescer.`,
      ` Considere este o primeiro retrato: nas próximas etapas, vamos comparar e ver o movimento acontecer.`,
    ];
    encouragement += pick(tails);
  } else if (day >= 30) {
    const tails = [
      ` Já são ${day} dias de caminhada — vale olhar para trás e reconhecer o quanto você se moveu.`,
      ` ${day} dias depois, você ainda está aqui, registrando, cuidando. Isso, por si só, já é vitória.`,
      ` Em ${day} dias, muita coisa muda — inclusive a forma como o corpo responde. Continue.`,
    ];
    encouragement += pick(tails);
  }

  return { items, encouragement, intro };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
