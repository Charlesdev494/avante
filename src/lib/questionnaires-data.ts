// Itens e regras de pontuação dos questionários — versões validadas para o português (Brasil)
// Cada definição abaixo cita a referência da versão validada utilizada (campo `reference`).
// Não são traduções livres: os enunciados seguem a redação publicada na validação
// brasileira de cada instrumento.

export interface QItem {
  id: string;
  prompt: string;
  options: { label: string; value: number }[];
}

export interface QuestionnaireDef {
  id:
    | "pcs"
    | "odi"
    | "ndi"
    | "spadi"
    | "sf36"
    | "tsk"
    | "rmdq"
    | "dn4"
    | "hads"
    | "hoos"
    | "koos12"
    | "fiqr"
    | "pps"
    | "kps"
    | "nantes"
    | "peg"
    | "phq9"
    | "gad7"
    | "fabq"
    | "promis_pf"
    | "promis_mobility_hip"
    | "isi"
    | "whoqol_bref"
    | "ppdi";
  title: string;
  intro: string;
  /**
   * Explicação curta, em linguagem acessível, do que é o questionário,
   * por que ele é importante e como será usado. Mostrada ao paciente
   * ANTES das perguntas.
   */
  synopsis: string;
  /**
   * Referência da versão validada em português (Brasil) usada como base
   * dos enunciados. Exibida no rodapé do formulário para auditoria
   * e citação acadêmica.
   */
  reference: string;
  items: QItem[];
  score: (answers: Record<string, number>) => {
    total: number;
    max: number;
    percent?: number;
    interpretation: string;
    subscales?: Record<string, number>;
  };
}

// ---------- PCS (Pain Catastrophizing Scale) ----------
const pcsOptions = [
  { label: "0 — nada", value: 0 },
  { label: "1 — um pouco", value: 1 },
  { label: "2 — moderadamente", value: 2 },
  { label: "3 — bastante", value: 3 },
  { label: "4 — o tempo todo / extremamente", value: 4 },
];

const pcsItems: QItem[] = [
  { id: "1", prompt: "Eu fico preocupado(a) o tempo todo se a dor vai acabar.", options: pcsOptions },
  { id: "2", prompt: "Eu sinto que não posso continuar assim.", options: pcsOptions },
  { id: "3", prompt: "É terrível e eu acho que nunca vai melhorar.", options: pcsOptions },
  { id: "4", prompt: "É horrível e sinto que isso me domina.", options: pcsOptions },
  { id: "5", prompt: "Eu sinto que não aguento mais.", options: pcsOptions },
  { id: "6", prompt: "Eu fico com medo de que a dor piore.", options: pcsOptions },
  { id: "7", prompt: "Eu fico pensando em outras situações dolorosas.", options: pcsOptions },
  { id: "8", prompt: "Eu desejo ansiosamente que a dor vá embora.", options: pcsOptions },
  { id: "9", prompt: "Parece que eu não consigo tirar a dor da minha cabeça.", options: pcsOptions },
  { id: "10", prompt: "Eu fico pensando o quanto a dor me machuca.", options: pcsOptions },
  { id: "11", prompt: "Eu fico pensando o quanto eu quero que a dor pare.", options: pcsOptions },
  { id: "12", prompt: "Não há nada que eu possa fazer para diminuir a intensidade da dor.", options: pcsOptions },
  { id: "13", prompt: "Eu fico imaginando se algo grave pode acontecer.", options: pcsOptions },
];

export const PCS_DEF: QuestionnaireDef = {
  id: "pcs",
  title: "PCS — Catastrofização da Dor",
  intro:
    "Pensando na sua dor, indique o quanto cada pensamento ou sentimento ocorre quando você está com dor.",
  synopsis:
    "Este questionário avalia como pensamentos e sentimentos surgem quando você sente dor — preocupação, sensação de não aguentar mais e ficar pensando o tempo todo no problema. Entender isso ajuda seu médico a planejar um tratamento que cuide não só do corpo, mas também do impacto emocional da dor.",
  reference:
    "Sehn F, Chachamovich E, Vidor LP, Dall-Agnol L, de Souza ICC, Torres ILS, et al. Cross-cultural adaptation and validation of the Brazilian Portuguese version of the Pain Catastrophizing Scale. Pain Medicine. 2012;13(11):1425-35.",
  items: pcsItems,
  score: (a) => {
    const sum = (ids: string[]) => ids.reduce((s, id) => s + (a[id] ?? 0), 0);
    const ruminacao = sum(["8", "9", "10", "11"]);
    const magnificacao = sum(["6", "7", "13"]);
    const desesperanca = sum(["1", "2", "3", "4", "5", "12"]);
    const total = ruminacao + magnificacao + desesperanca;
    let interpretation = "Catastrofização baixa";
    if (total >= 30) interpretation = "Catastrofização clinicamente relevante";
    else if (total >= 20) interpretation = "Catastrofização moderada";
    return {
      total,
      max: 52,
      interpretation,
      subscales: { ruminacao, magnificacao, desesperanca },
    };
  },
};

// ---------- ODI (Oswestry Disability Index) ----------
function disabilityOptions(prompts: string[]): { label: string; value: number }[] {
  return prompts.map((p, i) => ({ label: `${i} — ${p}`, value: i }));
}

const odiItems: QItem[] = [
  {
    id: "1",
    prompt: "Intensidade da dor",
    options: disabilityOptions([
      "Não tenho dor no momento",
      "A dor é muito leve no momento",
      "A dor é moderada no momento",
      "A dor é razoavelmente intensa",
      "A dor é muito intensa",
      "A dor é a pior imaginável",
    ]),
  },
  {
    id: "2",
    prompt: "Cuidados pessoais (lavar-se, vestir-se)",
    options: disabilityOptions([
      "Consigo cuidar de mim sem provocar dor",
      "Consigo cuidar de mim, mas isso aumenta a dor",
      "Causa dor e tenho que ser lento e cuidadoso",
      "Preciso de alguma ajuda, mas faço a maior parte",
      "Preciso de ajuda todos os dias para a maioria",
      "Não me visto, lavo-me com dificuldade e fico na cama",
    ]),
  },
  {
    id: "3",
    prompt: "Levantar pesos",
    options: disabilityOptions([
      "Consigo levantar pesos sem dor extra",
      "Posso levantar pesos, mas isso aumenta a dor",
      "A dor me impede de levantar do chão, mas consigo se bem posicionados",
      "A dor me impede de levantar, mas consigo pesos leves bem posicionados",
      "Só consigo levantar coisas muito leves",
      "Não consigo levantar nem carregar nada",
    ]),
  },
  {
    id: "4",
    prompt: "Caminhar",
    options: disabilityOptions([
      "A dor não me impede de caminhar nenhuma distância",
      "A dor me impede de caminhar mais de 1,5 km",
      "A dor me impede de caminhar mais de 500 m",
      "A dor me impede de caminhar mais de 100 m",
      "Só consigo caminhar com bengala ou muleta",
      "Fico na cama a maior parte do tempo",
    ]),
  },
  {
    id: "5",
    prompt: "Sentar",
    options: disabilityOptions([
      "Posso sentar em qualquer cadeira pelo tempo que quiser",
      "Posso sentar na minha cadeira favorita pelo tempo que quiser",
      "A dor me impede de sentar por mais de 1 hora",
      "A dor me impede de sentar por mais de 30 minutos",
      "A dor me impede de sentar por mais de 10 minutos",
      "A dor me impede de sentar por completo",
    ]),
  },
  {
    id: "6",
    prompt: "Ficar em pé",
    options: disabilityOptions([
      "Posso ficar em pé pelo tempo que quiser sem dor extra",
      "Posso ficar em pé pelo tempo que quiser, mas com alguma dor",
      "A dor me impede de ficar em pé por mais de 1 hora",
      "A dor me impede de ficar em pé por mais de 30 minutos",
      "A dor me impede de ficar em pé por mais de 10 minutos",
      "A dor me impede de ficar em pé",
    ]),
  },
  {
    id: "7",
    prompt: "Dormir",
    options: disabilityOptions([
      "Meu sono não é perturbado pela dor",
      "Meu sono é ocasionalmente perturbado pela dor",
      "Devido à dor durmo menos de 6 horas",
      "Devido à dor durmo menos de 4 horas",
      "Devido à dor durmo menos de 2 horas",
      "A dor me impede totalmente de dormir",
    ]),
  },
  {
    id: "8",
    prompt: "Vida sexual",
    options: disabilityOptions([
      "Minha vida sexual é normal e não causa dor extra",
      "Minha vida sexual é normal, mas causa alguma dor extra",
      "Minha vida sexual é quase normal, mas é dolorida",
      "Minha vida sexual é severamente restringida pela dor",
      "Minha vida sexual é quase ausente devido à dor",
      "A dor me impede totalmente de ter vida sexual",
    ]),
  },
  {
    id: "9",
    prompt: "Vida social",
    options: disabilityOptions([
      "Minha vida social é normal, sem dor extra",
      "Minha vida social é normal, mas aumenta a dor",
      "A dor afeta a vida social só limitando atividades vigorosas",
      "A dor restringe a vida social e não saio com frequência",
      "A dor restringe minha vida social a minha casa",
      "Não tenho vida social devido à dor",
    ]),
  },
  {
    id: "10",
    prompt: "Viajar",
    options: disabilityOptions([
      "Posso viajar para qualquer lugar sem dor",
      "Posso viajar para qualquer lugar, mas com dor extra",
      "A dor é forte, mas consigo viagens acima de 2 horas",
      "A dor me restringe a viagens de menos de 1 hora",
      "A dor me restringe a viagens curtas e necessárias",
      "A dor me impede de viajar, exceto para tratamento",
    ]),
  },
];

export const ODI_DEF: QuestionnaireDef = {
  id: "odi",
  title: "Oswestry (ODI) — Incapacidade Lombar",
  intro:
    "Para cada seção marque a alternativa que melhor descreve seu estado hoje. Se mais de uma se aplicar, escolha a que mais se aproxima.",
  synopsis:
    "Este questionário mede o quanto a dor na coluna lombar interfere em coisas do seu dia a dia: caminhar, sentar, dormir, levantar peso, viajar, vida social e sexual. Ele ajuda seu médico a entender o tamanho real do impacto e a acompanhar se o tratamento está te devolvendo função.",
  reference:
    "Vigatto R, Alexandre NMC, Correa Filho HR. Development of a Brazilian Portuguese version of the Oswestry Disability Index: cross-cultural adaptation, reliability, and validity. Spine. 2007;32(4):481-6.",
  items: odiItems,
  score: (a) => {
    const answered = Object.values(a);
    const total = answered.reduce((s, v) => s + (v ?? 0), 0);
    const max = answered.length * 5;
    const percent = max > 0 ? Math.round((total / max) * 100) : 0;
    let interpretation = "Incapacidade mínima";
    if (percent >= 81) interpretation = "Confinado ao leito";
    else if (percent >= 61) interpretation = "Incapacidade aleijante";
    else if (percent >= 41) interpretation = "Incapacidade severa";
    else if (percent >= 21) interpretation = "Incapacidade moderada";
    return { total, max, percent, interpretation };
  },
};

// ---------- NDI (Neck Disability Index) ----------
const ndiItems: QItem[] = [
  {
    id: "1",
    prompt: "Intensidade da dor cervical",
    options: disabilityOptions([
      "Não tenho dor no momento",
      "A dor é muito leve",
      "A dor é moderada",
      "A dor é razoavelmente intensa",
      "A dor é muito intensa",
      "A dor é a pior imaginável",
    ]),
  },
  {
    id: "2",
    prompt: "Cuidados pessoais",
    options: disabilityOptions([
      "Consigo cuidar de mim sem causar mais dor",
      "Consigo cuidar de mim, mas causa mais dor",
      "Cuidar de mim é doloroso e sou lento e cuidadoso",
      "Preciso de ajuda, mas faço a maior parte",
      "Preciso de ajuda todos os dias na maioria",
      "Não me visto, lavo-me com dificuldade e fico na cama",
    ]),
  },
  {
    id: "3",
    prompt: "Levantar pesos",
    options: disabilityOptions([
      "Consigo levantar pesos sem dor extra",
      "Consigo levantar pesos, mas dói mais",
      "A dor impede pesos do chão, mas consigo se bem posicionados",
      "Só consigo pesos leves bem posicionados",
      "Só consigo pesos muito leves",
      "Não consigo levantar nada"]),
  },
  {
    id: "4",
    prompt: "Leitura",
    options: disabilityOptions([
      "Leio o quanto quero sem dor no pescoço",
      "Leio o quanto quero com dor leve no pescoço",
      "Leio o quanto quero com dor moderada",
      "Não leio o quanto quero por dor moderada",
      "Quase não consigo ler por dor intensa",
      "Não consigo ler"]),
  },
  {
    id: "5",
    prompt: "Dores de cabeça",
    options: disabilityOptions([
      "Não tenho dor de cabeça",
      "Tenho dor de cabeça leve, infrequente",
      "Tenho dor de cabeça moderada, infrequente",
      "Tenho dor de cabeça moderada, frequente",
      "Tenho dor de cabeça intensa, frequente",
      "Tenho dor de cabeça quase o tempo todo"]),
  },
  {
    id: "6",
    prompt: "Concentração",
    options: disabilityOptions([
      "Me concentro totalmente sem dificuldade",
      "Me concentro com leve dificuldade",
      "Tenho dificuldade moderada para me concentrar",
      "Tenho muita dificuldade para me concentrar",
      "Tenho enorme dificuldade para me concentrar",
      "Não consigo me concentrar"]),
  },
  {
    id: "7",
    prompt: "Trabalho",
    options: disabilityOptions([
      "Posso trabalhar tudo o que quero",
      "Só posso fazer meu trabalho habitual, nada além",
      "Posso fazer a maioria do meu trabalho habitual",
      "Não posso fazer meu trabalho habitual",
      "Mal consigo fazer qualquer trabalho",
      "Não consigo trabalhar"]),
  },
  {
    id: "8",
    prompt: "Dirigir",
    options: disabilityOptions([
      "Posso dirigir sem dor no pescoço",
      "Posso dirigir o quanto quero com leve dor",
      "Posso dirigir o quanto quero com dor moderada",
      "Não posso dirigir tanto quanto quero",
      "Quase não consigo dirigir por dor intensa",
      "Não consigo dirigir"]),
  },
  {
    id: "9",
    prompt: "Dormir",
    options: disabilityOptions([
      "Não tenho problemas para dormir",
      "Meu sono é levemente perturbado (< 1 h perdida)",
      "Sono levemente perturbado (1–2 h perdidas)",
      "Sono moderadamente perturbado (2–3 h perdidas)",
      "Sono muito perturbado (3–5 h perdidas)",
      "Sono completamente perturbado (5–7 h perdidas)"]),
  },
  {
    id: "10",
    prompt: "Lazer / atividades recreativas",
    options: disabilityOptions([
      "Faço todas sem dor no pescoço",
      "Faço todas com alguma dor no pescoço",
      "Faço a maioria, mas não todas",
      "Faço só algumas das minhas atividades",
      "Quase não consigo fazer atividades de lazer",
      "Não consigo fazer nenhuma atividade de lazer"]),
  },
];

export const NDI_DEF: QuestionnaireDef = {
  id: "ndi",
  title: "NDI — Incapacidade Cervical",
  intro:
    "Marque, em cada seção, a alternativa que melhor descreve como você está hoje.",
  synopsis:
    "Este questionário mede o quanto a dor no pescoço (cervical) afeta atividades comuns: ler, dirigir, dormir, trabalhar, se concentrar e cuidar de si. Permite ao seu médico ver, ao longo do tratamento, se o pescoço está liberando você para a vida que você quer ter.",
  reference:
    "Cook C, Richardson JK, Braga L, Menezes A, Soler X, Kume P, et al. Cross-cultural adaptation and validation of the Brazilian Portuguese version of the Neck Disability Index and Neck Pain and Disability Scale. Spine. 2006;31(14):1621-7.",
  items: ndiItems,
  score: (a) => {
    const answered = Object.values(a);
    const total = answered.reduce((s, v) => s + (v ?? 0), 0);
    const max = answered.length * 5;
    const percent = max > 0 ? Math.round((total / max) * 100) : 0;
    let interpretation = "Sem incapacidade";
    if (percent >= 72) interpretation = "Incapacidade completa";
    else if (percent >= 50) interpretation = "Incapacidade severa";
    else if (percent >= 30) interpretation = "Incapacidade moderada";
    else if (percent >= 10) interpretation = "Incapacidade leve";
    return { total, max, percent, interpretation };
  },
};

// ---------- SPADI (Shoulder Pain and Disability Index) ----------
// 13 itens, escala 0–10 em cada. Subescalas: Dor (5 itens) e Função (8 itens).
const spadiOptions = Array.from({ length: 11 }, (_, i) => ({
  label: i === 0 ? "0 — sem dor / sem dificuldade" : i === 10 ? "10 — pior imaginável / impossível" : String(i),
  value: i,
}));

const spadiItems: QItem[] = [
  // Dor
  { id: "p1", prompt: "Dor no ombro no seu pior momento.", options: spadiOptions },
  { id: "p2", prompt: "Dor quando deita sobre o lado afetado.", options: spadiOptions },
  { id: "p3", prompt: "Dor ao alcançar algo em uma prateleira alta.", options: spadiOptions },
  { id: "p4", prompt: "Dor ao tocar a nuca.", options: spadiOptions },
  { id: "p5", prompt: "Dor ao empurrar algo com o braço afetado.", options: spadiOptions },
  // Função
  { id: "f1", prompt: "Dificuldade para lavar o cabelo.", options: spadiOptions },
  { id: "f2", prompt: "Dificuldade para lavar as costas.", options: spadiOptions },
  { id: "f3", prompt: "Dificuldade para vestir uma camiseta.", options: spadiOptions },
  { id: "f4", prompt: "Dificuldade para vestir uma camisa que abotoa na frente.", options: spadiOptions },
  { id: "f5", prompt: "Dificuldade para vestir as calças.", options: spadiOptions },
  { id: "f6", prompt: "Dificuldade para colocar algo em uma prateleira alta.", options: spadiOptions },
  { id: "f7", prompt: "Dificuldade para carregar um objeto pesado (≈ 5 kg).", options: spadiOptions },
  { id: "f8", prompt: "Dificuldade para retirar algo do bolso traseiro.", options: spadiOptions },
];

export const SPADI_DEF: QuestionnaireDef = {
  id: "spadi",
  title: "SPADI — Dor e Função do Ombro",
  intro:
    "Considere a última semana. Para cada item, escolha um número de 0 (sem dor / sem dificuldade) a 10 (pior imaginável / impossível de realizar).",
  synopsis:
    "Este questionário mede dor e dificuldade para usar o ombro em gestos da rotina (pentear, alcançar uma prateleira, vestir uma camisa, carregar peso). É a forma mais usada no mundo para acompanhar a evolução de problemas de ombro durante o tratamento.",
  reference:
    "Martins J, Napoles BV, Hoffman CB, Oliveira AS. The Brazilian version of Shoulder Pain and Disability Index — translation, cultural adaptation and reliability. Brazilian Journal of Physical Therapy. 2010;14(6):527-36.",
  items: spadiItems,
  score: (a) => {
    const painIds = ["p1", "p2", "p3", "p4", "p5"];
    const funcIds = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"];
    const painSum = painIds.reduce((s, id) => s + (a[id] ?? 0), 0);
    const funcSum = funcIds.reduce((s, id) => s + (a[id] ?? 0), 0);
    const painPct = Math.round((painSum / (painIds.length * 10)) * 100);
    const funcPct = Math.round((funcSum / (funcIds.length * 10)) * 100);
    const totalPct = Math.round((painPct + funcPct) / 2);
    let interpretation = "Comprometimento mínimo";
    if (totalPct >= 70) interpretation = "Comprometimento grave";
    else if (totalPct >= 40) interpretation = "Comprometimento moderado";
    else if (totalPct >= 20) interpretation = "Comprometimento leve";
    return {
      total: totalPct,
      max: 100,
      percent: totalPct,
      interpretation,
      subscales: { dor: painPct, funcao: funcPct },
    };
  },
};

// ---------- SF-36 (Medical Outcomes Study Short Form 36) ----------
// Versão brasileira validada (Ciconelli et al., 1999). Escores 0–100 por domínio.

const sf36GeneralHealth = [
  { label: "Excelente", value: 1 },
  { label: "Muito boa", value: 2 },
  { label: "Boa", value: 3 },
  { label: "Ruim", value: 4 },
  { label: "Muito ruim", value: 5 },
];

const sf36Compared = [
  { label: "Muito melhor agora do que há um ano", value: 1 },
  { label: "Um pouco melhor agora do que há um ano", value: 2 },
  { label: "Quase a mesma de um ano atrás", value: 3 },
  { label: "Um pouco pior agora do que há um ano", value: 4 },
  { label: "Muito pior agora do que há um ano", value: 5 },
];

const sf36Limit = [
  { label: "Sim, limita muito", value: 1 },
  { label: "Sim, limita um pouco", value: 2 },
  { label: "Não, não limita de maneira alguma", value: 3 },
];

const sf36YesNo = [
  { label: "Sim", value: 1 },
  { label: "Não", value: 2 },
];

const sf36Pain = [
  { label: "Nenhuma", value: 1 },
  { label: "Muito leve", value: 2 },
  { label: "Leve", value: 3 },
  { label: "Moderada", value: 4 },
  { label: "Grave", value: 5 },
  { label: "Muito grave", value: 6 },
];

const sf36PainInterfere = [
  { label: "De maneira alguma", value: 1 },
  { label: "Um pouco", value: 2 },
  { label: "Moderadamente", value: 3 },
  { label: "Bastante", value: 4 },
  { label: "Extremamente", value: 5 },
];

const sf36Time6 = [
  { label: "Todo tempo", value: 1 },
  { label: "A maior parte do tempo", value: 2 },
  { label: "Uma boa parte do tempo", value: 3 },
  { label: "Alguma parte do tempo", value: 4 },
  { label: "Uma pequena parte do tempo", value: 5 },
  { label: "Nunca", value: 6 },
];

const sf36Time5 = [
  { label: "Todo tempo", value: 1 },
  { label: "A maior parte do tempo", value: 2 },
  { label: "Alguma parte do tempo", value: 3 },
  { label: "Uma pequena parte do tempo", value: 4 },
  { label: "Nenhuma parte do tempo", value: 5 },
];

const sf36HowTrue = [
  { label: "Definitivamente verdadeira", value: 1 },
  { label: "A maioria das vezes verdadeira", value: 2 },
  { label: "Não sei", value: 3 },
  { label: "A maioria das vezes falsa", value: 4 },
  { label: "Definitivamente falsa", value: 5 },
];

const sf36Items: QItem[] = [
  { id: "1", prompt: "Em geral, você diria que sua saúde é:", options: sf36GeneralHealth },
  { id: "2", prompt: "Comparada há um ano atrás, como você classificaria sua saúde em geral, agora?", options: sf36Compared },
  // Itens 3a–3j: limitações por atividades (mapeados como 3..12)
  { id: "3", prompt: "Atividades vigorosas (correr, levantar objetos pesados, esportes árduos).", options: sf36Limit },
  { id: "4", prompt: "Atividades moderadas (mover uma mesa, passar aspirador, jogar bola, varrer).", options: sf36Limit },
  { id: "5", prompt: "Levantar ou carregar mantimentos.", options: sf36Limit },
  { id: "6", prompt: "Subir vários lances de escada.", options: sf36Limit },
  { id: "7", prompt: "Subir um lance de escada.", options: sf36Limit },
  { id: "8", prompt: "Curvar-se, ajoelhar-se ou dobrar-se.", options: sf36Limit },
  { id: "9", prompt: "Andar mais de 1 km.", options: sf36Limit },
  { id: "10", prompt: "Andar vários quarteirões.", options: sf36Limit },
  { id: "11", prompt: "Andar um quarteirão.", options: sf36Limit },
  { id: "12", prompt: "Tomar banho ou vestir-se.", options: sf36Limit },
  // 13–16: limitações por saúde física (sim/não)
  { id: "13", prompt: "Diminuiu a quantidade de tempo em que se dedicava ao trabalho ou outras atividades, por problemas físicos?", options: sf36YesNo },
  { id: "14", prompt: "Realizou menos tarefas do que gostaria, por problemas físicos?", options: sf36YesNo },
  { id: "15", prompt: "Esteve limitado(a) no tipo de trabalho ou outras atividades, por problemas físicos?", options: sf36YesNo },
  { id: "16", prompt: "Teve dificuldade para fazer seu trabalho ou outras atividades (precisou esforço extra), por problemas físicos?", options: sf36YesNo },
  // 17–19: limitações por problemas emocionais (sim/não)
  { id: "17", prompt: "Diminuiu a quantidade de tempo dedicada ao trabalho ou outras atividades, por problemas emocionais?", options: sf36YesNo },
  { id: "18", prompt: "Realizou menos tarefas do que gostaria, por problemas emocionais?", options: sf36YesNo },
  { id: "19", prompt: "Não trabalhou ou realizou qualquer atividade com tanto cuidado como costumava, por problemas emocionais?", options: sf36YesNo },
  // 20: interferência social
  { id: "20", prompt: "Durante as últimas 4 semanas, em que medida sua saúde física ou problemas emocionais interferiram nas suas atividades sociais normais com a família, amigos, vizinhos?", options: sf36PainInterfere },
  // 21–22: dor
  { id: "21", prompt: "Quanta dor no corpo você teve nas últimas 4 semanas?", options: sf36Pain },
  { id: "22", prompt: "Durante as últimas 4 semanas, quanto a dor interferiu no seu trabalho normal (incluindo dentro e fora de casa)?", options: sf36PainInterfere },
  // 23–31: vitalidade, saúde mental, social — escala de tempo
  { id: "23", prompt: "Quanto tempo você se sentiu cheio(a) de vigor, energia?", options: sf36Time6 },
  { id: "24", prompt: "Quanto tempo você se sentiu uma pessoa muito nervosa?", options: sf36Time6 },
  { id: "25", prompt: "Quanto tempo você se sentiu tão deprimido(a) que nada poderia anima-lo(a)?", options: sf36Time6 },
  { id: "26", prompt: "Quanto tempo você se sentiu calmo(a) ou tranquilo(a)?", options: sf36Time6 },
  { id: "27", prompt: "Quanto tempo você se sentiu com muita energia?", options: sf36Time6 },
  { id: "28", prompt: "Quanto tempo você se sentiu desanimado(a) e abatido(a)?", options: sf36Time6 },
  { id: "29", prompt: "Quanto tempo você se sentiu esgotado(a)?", options: sf36Time6 },
  { id: "30", prompt: "Quanto tempo você se sentiu uma pessoa feliz?", options: sf36Time6 },
  { id: "31", prompt: "Quanto tempo você se sentiu cansado(a)?", options: sf36Time6 },
  // 32: interferência social (tempo)
  { id: "32", prompt: "Quanto do seu tempo a sua saúde física ou problemas emocionais interferiram com as suas atividades sociais?", options: sf36Time5 },
  // 33–36: saúde geral
  { id: "33", prompt: "Eu costumo adoecer um pouco mais facilmente que as outras pessoas.", options: sf36HowTrue },
  { id: "34", prompt: "Eu sou tão saudável quanto qualquer pessoa que eu conheço.", options: sf36HowTrue },
  { id: "35", prompt: "Eu acho que minha saúde vai piorar.", options: sf36HowTrue },
  { id: "36", prompt: "Minha saúde é excelente.", options: sf36HowTrue },
];

// Tabelas de recodificação (escore bruto → 0–100) para SF-36
// Baseadas em Ware & Sherbourne (1992) e validação brasileira (Ciconelli, 1999).
function sf36Recode(a: Record<string, number>): Record<string, number> {
  const r: Record<string, number> = { ...a };
  // Item 1 (saúde geral): 1→100, 2→85, 3→60, 4→35, 5→0  (some sources: 1→5; here usamos transformada 0–100 direta)
  const item1Map: Record<number, number> = { 1: 100, 2: 85, 3: 60, 4: 35, 5: 0 };
  if (a["1"] != null) r["1_t"] = item1Map[a["1"]];
  // Itens 3–12 (PF): 1→0, 2→50, 3→100
  for (let i = 3; i <= 12; i++) {
    const v = a[String(i)];
    if (v != null) r[`${i}_t`] = v === 1 ? 0 : v === 2 ? 50 : 100;
  }
  // Itens 13–16 (RP) e 17–19 (RE): sim(1)=0, não(2)=100
  for (const i of [13, 14, 15, 16, 17, 18, 19]) {
    const v = a[String(i)];
    if (v != null) r[`${i}_t`] = v === 1 ? 0 : 100;
  }
  // Itens 20 (SF) e 32 (SF): inverter, 1→100..5→0
  const inv5: Record<number, number> = { 1: 100, 2: 75, 3: 50, 4: 25, 5: 0 };
  if (a["20"] != null) r["20_t"] = inv5[a["20"]];
  if (a["32"] != null) r["32_t"] = inv5[a["32"]];
  // Item 21 (BP, dor 1–6): 1→100, 2→80, 3→60, 4→40, 5→20, 6→0
  const pain6: Record<number, number> = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20, 6: 0 };
  if (a["21"] != null) r["21_t"] = pain6[a["21"]];
  // Item 22 (BP, interferência 1–5)
  if (a["22"] != null) r["22_t"] = inv5[a["22"]];
  // Itens 23–31 (escala de tempo 6 pontos)
  const time6Pos: Record<number, number> = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20, 6: 0 }; // mais é melhor
  const time6Neg: Record<number, number> = { 1: 0, 2: 20, 3: 40, 4: 60, 5: 80, 6: 100 }; // menos é melhor
  // VT: 23,27 positivos; 29,31 negativos
  if (a["23"] != null) r["23_t"] = time6Pos[a["23"]];
  if (a["27"] != null) r["27_t"] = time6Pos[a["27"]];
  if (a["29"] != null) r["29_t"] = time6Neg[a["29"]];
  if (a["31"] != null) r["31_t"] = time6Neg[a["31"]];
  // MH: 24,25,28 negativos; 26,30 positivos
  if (a["24"] != null) r["24_t"] = time6Neg[a["24"]];
  if (a["25"] != null) r["25_t"] = time6Neg[a["25"]];
  if (a["26"] != null) r["26_t"] = time6Pos[a["26"]];
  if (a["28"] != null) r["28_t"] = time6Neg[a["28"]];
  if (a["30"] != null) r["30_t"] = time6Pos[a["30"]];
  // GH (33–36): 33 e 35 negativos (1→0..5→100); 34 e 36 positivos
  const ghPos: Record<number, number> = { 1: 100, 2: 75, 3: 50, 4: 25, 5: 0 };
  const ghNeg: Record<number, number> = { 1: 0, 2: 25, 3: 50, 4: 75, 5: 100 };
  if (a["33"] != null) r["33_t"] = ghNeg[a["33"]];
  if (a["34"] != null) r["34_t"] = ghPos[a["34"]];
  if (a["35"] != null) r["35_t"] = ghNeg[a["35"]];
  if (a["36"] != null) r["36_t"] = ghPos[a["36"]];
  return r;
}

function avg(vals: (number | undefined)[]): number {
  const v = vals.filter((x): x is number => typeof x === "number");
  if (v.length === 0) return 0;
  return Math.round(v.reduce((s, x) => s + x, 0) / v.length);
}

export const SF36_DEF: QuestionnaireDef = {
  id: "sf36",
  title: "SF-36 — Qualidade de Vida",
  intro:
    "Este questionário pergunta sobre sua saúde, como você se sente e como consegue fazer suas atividades habituais. Responda pensando nas últimas 4 semanas.",
  synopsis:
    "Este é o questionário de qualidade de vida mais usado no mundo. Em 36 perguntas ele olha 8 áreas da sua vida — disposição física, dor, emoções, energia, vida social, saúde geral. O resultado mostra ao seu médico onde a dor ou a doença mais pesa hoje e o que está melhorando ao longo do tratamento.",
  reference:
    "Ciconelli RM, Ferraz MB, Santos W, Meinão I, Quaresma MR. Tradução para a língua portuguesa e validação do questionário genérico de avaliação de qualidade de vida SF-36 (Brasil SF-36). Rev Bras Reumatol. 1999;39(3):143-50.",
  items: sf36Items,
  score: (a) => {
    const r = sf36Recode(a);
    const capacidadeFuncional = avg([3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => r[`${i}_t`]));
    const limitacaoFisica = avg([13, 14, 15, 16].map((i) => r[`${i}_t`]));
    const dor = avg([21, 22].map((i) => r[`${i}_t`]));
    const saudeGeral = avg([1, 33, 34, 35, 36].map((i) => r[`${i}_t`]));
    const vitalidade = avg([23, 27, 29, 31].map((i) => r[`${i}_t`]));
    const aspectosSociais = avg([20, 32].map((i) => r[`${i}_t`]));
    const limitacaoEmocional = avg([17, 18, 19].map((i) => r[`${i}_t`]));
    const saudeMental = avg([24, 25, 26, 28, 30].map((i) => r[`${i}_t`]));
    const subscales = {
      capacidade_funcional: capacidadeFuncional,
      limitacao_fisica: limitacaoFisica,
      dor,
      saude_geral: saudeGeral,
      vitalidade,
      aspectos_sociais: aspectosSociais,
      limitacao_emocional: limitacaoEmocional,
      saude_mental: saudeMental,
    };
    const mean = Math.round(
      (capacidadeFuncional + limitacaoFisica + dor + saudeGeral + vitalidade + aspectosSociais + limitacaoEmocional + saudeMental) / 8,
    );
    let interpretation = "Qualidade de vida alta";
    if (mean < 40) interpretation = "Qualidade de vida baixa";
    else if (mean < 70) interpretation = "Qualidade de vida moderada";
    return { total: mean, max: 100, percent: mean, interpretation, subscales };
  },
};

// ---------- TSK-17 (Tampa Scale for Kinesiophobia — versão brasileira) ----------
const tskOptions = [
  { label: "1 — discordo totalmente", value: 1 },
  { label: "2 — discordo", value: 2 },
  { label: "3 — concordo", value: 3 },
  { label: "4 — concordo totalmente", value: 4 },
];

// Itens 4, 8, 12 e 16 têm pontuação invertida (5 - valor)
const TSK_REVERSE = new Set(["4", "8", "12", "16"]);

const tskItems: QItem[] = [
  { id: "1", prompt: "Tenho medo de me machucar se fizer exercício físico.", options: tskOptions },
  { id: "2", prompt: "Se eu tentasse vencer a dor, ela aumentaria.", options: tskOptions },
  { id: "3", prompt: "Meu corpo está dizendo que tem algo seriamente errado comigo.", options: tskOptions },
  { id: "4", prompt: "Minha dor provavelmente seria aliviada se eu fizesse exercício.", options: tskOptions },
  { id: "5", prompt: "As pessoas não estão levando minha condição médica a sério o suficiente.", options: tskOptions },
  { id: "6", prompt: "Meu problema/acidente colocou meu corpo em risco para o resto da vida.", options: tskOptions },
  { id: "7", prompt: "Dor sempre significa que machuquei meu corpo.", options: tskOptions },
  { id: "8", prompt: "Só porque algo agrava minha dor, não significa que seja perigoso.", options: tskOptions },
  { id: "9", prompt: "Tenho medo de me machucar acidentalmente.", options: tskOptions },
  { id: "10", prompt: "A maneira mais segura de evitar que minha dor piore é simplesmente ter cuidado para não fazer movimentos desnecessários.", options: tskOptions },
  { id: "11", prompt: "Eu não teria tanta dor se algo potencialmente perigoso não estivesse acontecendo no meu corpo.", options: tskOptions },
  { id: "12", prompt: "Embora minha condição me cause dor, eu estaria melhor se estivesse fisicamente ativo(a).", options: tskOptions },
  { id: "13", prompt: "A dor me diz quando parar de me exercitar para não me machucar.", options: tskOptions },
  { id: "14", prompt: "Não é seguro, para alguém com a minha condição, ser fisicamente ativo(a).", options: tskOptions },
  { id: "15", prompt: "Eu não consigo fazer todas as coisas que pessoas normais fazem, pois eu poderia me machucar facilmente.", options: tskOptions },
  { id: "16", prompt: "Mesmo que algo cause muita dor em mim, eu não acho que seja realmente perigoso.", options: tskOptions },
  { id: "17", prompt: "Ninguém deveria fazer exercícios quando está com dor.", options: tskOptions },
];

export const TSK_DEF: QuestionnaireDef = {
  id: "tsk",
  title: "TSK-17 — Cinesiofobia (Medo do Movimento)",
  intro:
    "Leia cada afirmação e indique o quanto você concorda ou discorda. Não há respostas certas ou erradas.",
  synopsis:
    "Este questionário mede o medo de se movimentar por achar que vai piorar a dor ou se machucar. Esse medo é comum e muitas vezes atrapalha a recuperação mais do que a própria lesão. Identificá-lo permite ao seu médico construir um plano seguro para você voltar a se movimentar com confiança.",
  reference:
    "Siqueira FB, Teixeira-Salmela LF, Magalhães LC. Análise das propriedades psicométricas da versão brasileira da Escala Tampa de Cinesiofobia. Acta Ortop Bras. 2007;15(1):19-24.",
  items: tskItems,
  score: (a) => {
    let total = 0;
    for (const item of tskItems) {
      const v = a[item.id] ?? 0;
      total += TSK_REVERSE.has(item.id) ? 5 - v : v;
    }
    // Escala 17–68
    let interpretation = "Cinesiofobia baixa";
    if (total >= 50) interpretation = "Cinesiofobia alta — forte medo do movimento";
    else if (total >= 37) interpretation = "Cinesiofobia moderada";
    return { total, max: 68, interpretation };
  },
};

// ---------- RMDQ (Roland-Morris Disability Questionnaire — versão brasileira) ----------
const rmdqOptions = [
  { label: "Não", value: 0 },
  { label: "Sim", value: 1 },
];

const rmdqItems: QItem[] = [
  { id: "1", prompt: "Fico em casa a maior parte do tempo por causa das minhas costas.", options: rmdqOptions },
  { id: "2", prompt: "Mudo de posição frequentemente, tentando deixar minhas costas confortáveis.", options: rmdqOptions },
  { id: "3", prompt: "Ando mais devagar do que de costume por causa das minhas costas.", options: rmdqOptions },
  { id: "4", prompt: "Por causa das minhas costas, não estou fazendo nenhum dos trabalhos que geralmente faço em casa.", options: rmdqOptions },
  { id: "5", prompt: "Por causa das minhas costas, uso o corrimão para subir escadas.", options: rmdqOptions },
  { id: "6", prompt: "Por causa das minhas costas, deito-me para descansar com mais frequência.", options: rmdqOptions },
  { id: "7", prompt: "Por causa das minhas costas, tenho que me apoiar em alguma coisa para me levantar de uma poltrona.", options: rmdqOptions },
  { id: "8", prompt: "Por causa das minhas costas, tento conseguir que outras pessoas façam as coisas por mim.", options: rmdqOptions },
  { id: "9", prompt: "Visto-me mais lentamente do que de costume por causa das minhas costas.", options: rmdqOptions },
  { id: "10", prompt: "Eu só fico em pé por períodos curtos de tempo por causa das minhas costas.", options: rmdqOptions },
  { id: "11", prompt: "Por causa das minhas costas, evito me abaixar ou me ajoelhar.", options: rmdqOptions },
  { id: "12", prompt: "Acho difícil levantar de uma cadeira por causa das minhas costas.", options: rmdqOptions },
  { id: "13", prompt: "Minhas costas doem quase o tempo todo.", options: rmdqOptions },
  { id: "14", prompt: "Tenho dificuldade para virar na cama por causa das minhas costas.", options: rmdqOptions },
  { id: "15", prompt: "Meu apetite não é muito bom por causa das dores nas minhas costas.", options: rmdqOptions },
  { id: "16", prompt: "Tenho problemas para colocar minhas meias (ou meia-calça) por causa da dor nas minhas costas.", options: rmdqOptions },
  { id: "17", prompt: "Eu só consigo andar distâncias curtas por causa das minhas dores nas costas.", options: rmdqOptions },
  { id: "18", prompt: "Não durmo tão bem por causa das minhas costas.", options: rmdqOptions },
  { id: "19", prompt: "Por causa da minha dor nas costas, eu me visto com a ajuda de outras pessoas.", options: rmdqOptions },
  { id: "20", prompt: "Fico sentado(a) a maior parte do dia por causa das minhas costas.", options: rmdqOptions },
  { id: "21", prompt: "Evito trabalhos pesados em casa por causa das minhas costas.", options: rmdqOptions },
  { id: "22", prompt: "Por causa das dores nas minhas costas, fico mais irritado(a) e mal-humorado(a) com as pessoas do que de costume.", options: rmdqOptions },
  { id: "23", prompt: "Por causa das minhas costas, eu subo escadas mais lentamente do que de costume.", options: rmdqOptions },
  { id: "24", prompt: "Fico na cama a maior parte do tempo por causa das minhas costas.", options: rmdqOptions },
];

export const RMDQ_DEF: QuestionnaireDef = {
  id: "rmdq",
  title: "Roland-Morris — Incapacidade por Dor Lombar",
  intro:
    "Marque cada frase que descreve como você se sente HOJE por causa da sua dor nas costas.",
  synopsis:
    "Este questionário é uma lista de 24 frases bem práticas sobre o que a dor nas costas está te impedindo de fazer HOJE. Marcar Sim ou Não para cada uma dá ao seu médico um retrato simples e sensível do impacto da dor lombar e de como ela muda ao longo do tratamento.",
  reference:
    "Nusbaum L, Natour J, Ferraz MB, Goldenberg J. Translation, adaptation and validation of the Roland-Morris questionnaire — Brazil Roland-Morris. Braz J Med Biol Res. 2001;34(2):203-10.",
  items: rmdqItems,
  score: (a) => {
    const total = rmdqItems.reduce((s, i) => s + (a[i.id] ?? 0), 0);
    let interpretation = "Incapacidade leve";
    if (total >= 14) interpretation = "Incapacidade grave";
    else if (total >= 7) interpretation = "Incapacidade moderada";
    return { total, max: 24, percent: Math.round((total / 24) * 100), interpretation };
  },
};

// ---------- DN4 (Douleur Neuropathique 4 — triagem de dor neuropática) ----------
const dn4SimOptions = [
  { label: "Não", value: 0 },
  { label: "Sim", value: 1 },
];

const dn4Items: QItem[] = [
  // Entrevista
  { id: "1", prompt: "A dor tem a característica de QUEIMAÇÃO?", options: dn4SimOptions },
  { id: "2", prompt: "A dor tem a sensação de FRIO DOLOROSO?", options: dn4SimOptions },
  { id: "3", prompt: "A dor tem a sensação de CHOQUE ELÉTRICO?", options: dn4SimOptions },
  { id: "4", prompt: "Na região dolorosa há FORMIGAMENTO?", options: dn4SimOptions },
  { id: "5", prompt: "Na região dolorosa há sensação de ALFINETADAS / AGULHADAS?", options: dn4SimOptions },
  { id: "6", prompt: "Na região dolorosa há sensação de DORMÊNCIA / ENTORPECIMENTO?", options: dn4SimOptions },
  { id: "7", prompt: "Na região dolorosa há sensação de COCEIRA?", options: dn4SimOptions },
  // Exame físico (auto-relato simplificado)
  { id: "8", prompt: "Há hipoestesia ao TOQUE (diminuição da sensibilidade ao toque) na área da dor?", options: dn4SimOptions },
  { id: "9", prompt: "Há hipoestesia à PICADA (diminuição da sensibilidade à picada) na área da dor?", options: dn4SimOptions },
  { id: "10", prompt: "A dor é provocada ou aumentada pelo ROÇAR (escovar de leve a pele) na área da dor?", options: dn4SimOptions },
];

export const DN4_DEF: QuestionnaireDef = {
  id: "dn4",
  title: "DN4 — Triagem de Dor Neuropática",
  intro:
    "Responda Sim ou Não para cada item conforme a sua dor. Pontuação ≥ 4 sugere componente neuropático.",
  synopsis:
    "Esta é uma triagem rápida para um tipo específico de dor — a dor neuropática, que vem de irritação do próprio nervo (queimação, choque, formigamento, dormência). Identificá-la muda o tratamento, porque ela costuma responder a medicações e estratégias diferentes da dor comum.",
  reference:
    "Santos JG, Brito JO, de Andrade DC, Kaziyama VM, Ferreira KA, Souza I, et al. Translation to Portuguese and validation of the Douleur Neuropathique 4 questionnaire. J Pain. 2010;11(5):484-90.",
  items: dn4Items,
  score: (a) => {
    const total = dn4Items.reduce((s, i) => s + (a[i.id] ?? 0), 0);
    const interpretation =
      total >= 4 ? "Provável dor neuropática (≥ 4)" : "Dor neuropática improvável (< 4)";
    return { total, max: 10, interpretation };
  },
};

// ---------- HADS (Hospital Anxiety and Depression Scale — versão brasileira) ----------
// 14 itens, ímpares = Ansiedade, pares = Depressão. Cada item 0–3. Cada subescala 0–21.
// Alguns itens têm pontuação invertida.

type HadsItem = QItem & { sub: "A" | "D"; reverse?: boolean };

const hads0to3 = (labels: [string, string, string, string]) =>
  labels.map((l, i) => ({ label: `${i} — ${l}`, value: i }));

const hadsItems: HadsItem[] = [
  { id: "1", sub: "A", prompt: "Eu me sinto tenso(a) ou contraído(a):", options: hads0to3(["nunca", "de vez em quando", "boa parte do tempo", "a maior parte do tempo"]) },
  { id: "2", sub: "D", prompt: "Eu ainda sinto gosto pelas mesmas coisas de antes:", options: hads0to3(["sim, do mesmo jeito que antes", "não tanto quanto antes", "só um pouco", "já não consigo mais"]) },
  { id: "3", sub: "A", prompt: "Eu sinto uma espécie de medo, como se algo ruim fosse acontecer:", options: hads0to3(["não, de maneira alguma", "sim, mas não muito forte", "sim, e bastante forte", "sim, e muito forte"]) },
  { id: "4", sub: "D", prompt: "Dou risada e me divirto quando vejo coisas engraçadas:", options: hads0to3(["sim, do mesmo jeito que antes", "atualmente um pouco menos", "atualmente bem menos", "atualmente, de jeito nenhum"]) },
  { id: "5", sub: "A", prompt: "Estou com a cabeça cheia de preocupações:", options: hads0to3(["raramente", "de vez em quando", "boa parte do tempo", "a maior parte do tempo"]) },
  { id: "6", sub: "D", prompt: "Eu me sinto alegre:", options: hads0to3(["nunca", "poucas vezes", "muitas vezes", "a maior parte do tempo"]) },
  { id: "7", sub: "A", prompt: "Consigo ficar sentado(a) à vontade e me sentir relaxado(a):", options: hads0to3(["sim, quase sempre", "muitas vezes", "poucas vezes", "nunca"]) },
  { id: "8", sub: "D", prompt: "Eu estou lento(a) para pensar e fazer as coisas:", options: hads0to3(["nunca", "às vezes", "quase sempre", "a maior parte do tempo"]) },
  { id: "9", sub: "A", prompt: "Tenho uma sensação ruim de medo, como um frio na barriga ou um aperto no estômago:", options: hads0to3(["nunca", "de vez em quando", "muitas vezes", "quase sempre"]) },
  { id: "10", sub: "D", prompt: "Eu perdi o interesse em cuidar da minha aparência:", options: hads0to3(["me cuido como sempre", "às vezes deixo de cuidar", "não estou cuidando como deveria", "não tenho cuidado"]) },
  { id: "11", sub: "A", prompt: "Eu me sinto inquieto(a), como se eu não pudesse ficar parado(a) em lugar nenhum:", options: hads0to3(["sim, demais", "bastante", "um pouco", "não me sinto assim"]) },
  { id: "12", sub: "D", prompt: "Fico esperando animado(a) as coisas boas que estão por vir:", options: hads0to3(["do mesmo jeito de antes", "um pouco menos do que antes", "bem menos do que antes", "quase nunca"]) },
  { id: "13", sub: "A", prompt: "De repente, tenho sensações de pânico:", options: hads0to3(["a quase todo momento", "várias vezes", "de vez em quando", "não tenho tido"]) },
  { id: "14", sub: "D", prompt: "Consigo sentir prazer ao ler um bom livro ou assistir a um bom programa de TV / cinema:", options: hads0to3(["quase sempre", "várias vezes", "poucas vezes", "quase nunca"]) },
];

export const HADS_DEF: QuestionnaireDef = {
  id: "hads",
  title: "HADS — Ansiedade e Depressão",
  intro:
    "Responda como você tem se sentido na última semana. Não pense muito em cada questão — sua reação imediata é a mais útil.",
  synopsis:
    "Este questionário avalia, em 14 perguntas curtas, sinais de ansiedade e de humor deprimido na última semana. Não é um diagnóstico — é um termômetro. Dor crônica e sofrimento emocional caminham juntos, e cuidar dos dois melhora o resultado do tratamento.",
  reference:
    "Botega NJ, Bio MR, Zomignani MA, Garcia Jr C, Pereira WAB. Transtornos do humor em enfermaria de clínica médica e validação de escala de medida (HAD) de ansiedade e depressão. Rev Saúde Pública. 1995;29(5):355-63.",
  items: hadsItems,
  score: (a) => {
    let ansiedade = 0;
    let depressao = 0;
    for (const it of hadsItems) {
      const v = a[it.id] ?? 0;
      if (it.sub === "A") ansiedade += v;
      else depressao += v;
    }
    const classify = (v: number) =>
      v <= 7 ? "improvável" : v <= 10 ? "possível" : "provável";
    const interpretation = `Ansiedade ${ansiedade}/21 (${classify(ansiedade)}) · Depressão ${depressao}/21 (${classify(depressao)})`;
    return {
      total: ansiedade + depressao,
      max: 42,
      interpretation,
      subscales: { ansiedade, depressao },
    };
  },
};

// ---------- HOOS (Hip Disability and Osteoarthritis Outcome Score — versão brasileira) ----------
// 40 itens, 5 subescalas. Cada item 0–4 (0 = nenhum, 4 = extremo).
// Subescala = 100 - (soma * 100 / (4 * nº itens)) → 100 = sem problemas, 0 = problemas extremos.
const hoosOpts = [
  { label: "0 — Nenhum(a)", value: 0 },
  { label: "1 — Leve", value: 1 },
  { label: "2 — Moderado(a)", value: 2 },
  { label: "3 — Grave", value: 3 },
  { label: "4 — Extremo(a)", value: 4 },
];
const hoosFreq = [
  { label: "0 — Nunca", value: 0 },
  { label: "1 — Mensalmente", value: 1 },
  { label: "2 — Semanalmente", value: 2 },
  { label: "3 — Diariamente", value: 3 },
  { label: "4 — Sempre", value: 4 },
];
const hoosDiff = [
  { label: "0 — Nenhuma", value: 0 },
  { label: "1 — Leve", value: 1 },
  { label: "2 — Moderada", value: 2 },
  { label: "3 — Grave", value: 3 },
  { label: "4 — Extrema", value: 4 },
];

const hoosItems: QItem[] = [
  // Sintomas (S1–S5)
  { id: "S1", prompt: "S1. Você sente seu quadril estalando, rangendo ou fazendo qualquer outro tipo de barulho?", options: hoosFreq },
  { id: "S2", prompt: "S2. Você sente o seu quadril travando ou prendendo enquanto se movimenta?", options: hoosFreq },
  { id: "S3", prompt: "S3. Você sente dificuldade em abrir ou afastar muito as pernas?", options: hoosDiff },
  { id: "S4", prompt: "S4. Você sente dificuldade em alcançar os pés/passar meias e sapatos?", options: hoosDiff },
  { id: "S5", prompt: "S5. Quão grave é a rigidez do seu quadril após acordar pela manhã?", options: hoosOpts },
  // Rigidez (R1–R2) — agrupada em "Sintomas" no escore oficial
  { id: "R1", prompt: "R1. Quão grave é a rigidez do seu quadril depois de sentar, deitar ou descansar mais tarde no dia?", options: hoosOpts },
  { id: "R2", prompt: "R2. (Não usado — a versão simplificada combina rigidez aos sintomas.) Quão rígido está o seu quadril ao final do dia?", options: hoosOpts },
  // Dor (P1–P10)
  { id: "P1", prompt: "P1. Com que frequência sua dor no quadril ocorre?", options: hoosFreq },
  { id: "P2", prompt: "P2. Estender totalmente a perna.", options: hoosOpts },
  { id: "P3", prompt: "P3. Dobrar totalmente a perna.", options: hoosOpts },
  { id: "P4", prompt: "P4. Andar em uma superfície plana.", options: hoosOpts },
  { id: "P5", prompt: "P5. Subir ou descer escadas.", options: hoosOpts },
  { id: "P6", prompt: "P6. À noite, na cama (dor que perturba o sono).", options: hoosOpts },
  { id: "P7", prompt: "P7. Sentado(a) ou deitado(a).", options: hoosOpts },
  { id: "P8", prompt: "P8. Em pé.", options: hoosOpts },
  { id: "P9", prompt: "P9. Andando em superfície dura (asfalto, calçada).", options: hoosOpts },
  { id: "P10", prompt: "P10. Andando em superfície irregular.", options: hoosOpts },
  // AVD — Atividades de Vida Diária (A1–A17)
  { id: "A1", prompt: "A1. Descer escadas.", options: hoosDiff },
  { id: "A2", prompt: "A2. Subir escadas.", options: hoosDiff },
  { id: "A3", prompt: "A3. Levantar-se da posição sentada.", options: hoosDiff },
  { id: "A4", prompt: "A4. Ficar em pé.", options: hoosDiff },
  { id: "A5", prompt: "A5. Abaixar-se ao chão / pegar objeto.", options: hoosDiff },
  { id: "A6", prompt: "A6. Andar em superfície plana.", options: hoosDiff },
  { id: "A7", prompt: "A7. Entrar ou sair do carro.", options: hoosDiff },
  { id: "A8", prompt: "A8. Fazer compras.", options: hoosDiff },
  { id: "A9", prompt: "A9. Colocar meias / pés-de-meia.", options: hoosDiff },
  { id: "A10", prompt: "A10. Sair da cama.", options: hoosDiff },
  { id: "A11", prompt: "A11. Tirar meias / pés-de-meia.", options: hoosDiff },
  { id: "A12", prompt: "A12. Deitado(a) na cama (virar-se, manter a posição).", options: hoosDiff },
  { id: "A13", prompt: "A13. Entrar ou sair da banheira / box.", options: hoosDiff },
  { id: "A14", prompt: "A14. Sentar-se.", options: hoosDiff },
  { id: "A15", prompt: "A15. Sentar e levantar do vaso sanitário.", options: hoosDiff },
  { id: "A16", prompt: "A16. Tarefas domésticas pesadas (esfregar chão, levantar caixas).", options: hoosDiff },
  { id: "A17", prompt: "A17. Tarefas domésticas leves (cozinhar, tirar pó).", options: hoosDiff },
  // Esporte e Recreação (SP1–SP4)
  { id: "SP1", prompt: "SP1. Agachar-se.", options: hoosDiff },
  { id: "SP2", prompt: "SP2. Correr.", options: hoosDiff },
  { id: "SP3", prompt: "SP3. Girar / pivotear sobre a perna afetada.", options: hoosDiff },
  { id: "SP4", prompt: "SP4. Caminhar em superfície irregular.", options: hoosDiff },
  // Qualidade de Vida (Q1–Q4)
  { id: "Q1", prompt: "Q1. Com que frequência você se lembra do problema do seu quadril?", options: hoosFreq },
  { id: "Q2", prompt: "Q2. Você mudou seu estilo de vida para evitar atividades que podem prejudicar o seu quadril?", options: [
    { label: "0 — De jeito nenhum", value: 0 },
    { label: "1 — Levemente", value: 1 },
    { label: "2 — Moderadamente", value: 2 },
    { label: "3 — Gravemente", value: 3 },
    { label: "4 — Totalmente", value: 4 },
  ] },
  { id: "Q3", prompt: "Q3. Quanto você se sente incomodado(a) com a falta de confiança no seu quadril?", options: hoosOpts },
  { id: "Q4", prompt: "Q4. Em geral, quanta dificuldade você tem com o seu quadril?", options: hoosDiff },
];

export const HOOS_DEF: QuestionnaireDef = {
  id: "hoos",
  title: "HOOS — Lesão e Osteoartrite do Quadril",
  intro:
    "Pense no seu quadril durante a última semana. Marque a opção que melhor descreve a sua experiência em cada item.",
  synopsis:
    "Este questionário avalia o quadril em cinco áreas — sintomas, dor, atividades do dia a dia, esporte/lazer e qualidade de vida. É a forma padrão internacional de acompanhar o quadril (desgaste/osteoartrite, lesões) e ver o efeito real do tratamento.",
  reference:
    "Imoto AM, Peccin MS, Trevisani VFM. Tradução, adaptação cultural e validação para a língua portuguesa do Hip Disability and Osteoarthritis Outcome Score (HOOS). Acta Ortop Bras. 2013;21(4):217-22.",
  items: hoosItems,
  score: (a) => {
    const sub = (ids: string[]) => {
      const sum = ids.reduce((s, id) => s + (a[id] ?? 0), 0);
      const raw = (sum * 100) / (4 * ids.length);
      return Math.round(100 - raw); // 100 = sem problemas
    };
    const sintomas = sub(["S1", "S2", "S3", "S4", "S5", "R1", "R2"]);
    const dor = sub(["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"]);
    const avd = sub([
      "A1","A2","A3","A4","A5","A6","A7","A8","A9","A10",
      "A11","A12","A13","A14","A15","A16","A17",
    ]);
    const esporte = sub(["SP1", "SP2", "SP3", "SP4"]);
    const qualidade_vida = sub(["Q1", "Q2", "Q3", "Q4"]);
    const subscales = { sintomas, dor, avd, esporte, qualidade_vida };
    const total = Math.round((sintomas + dor + avd + esporte + qualidade_vida) / 5);
    let interpretation = "Função do quadril preservada";
    if (total < 40) interpretation = "Função do quadril gravemente comprometida";
    else if (total < 70) interpretation = "Função do quadril moderadamente comprometida";
    return { total, max: 100, percent: total, interpretation, subscales };
  },
};

// ---------- KOOS-12 (Knee injury and Osteoarthritis Outcome Score — versão curta) ----------
// 12 itens, 3 subescalas (Dor, Função, QV). Cada item 0–4 (0 = nenhum, 4 = extremo).
// Subescala = 100 - (soma * 100 / (4 * nº itens)) → 100 = sem problemas.
// Referência: Gandek B, Roos EM, Franklin PD, Ware JE. A 12-item short form of
// the Knee injury and Osteoarthritis Outcome Score (KOOS-12). Osteoarthritis
// Cartilage. 2019;27(5):762-70. Itens fundamentados na versão brasileira do
// KOOS (Gonçalves RS et al., 2009).
const koosOpts = [
  { label: "0 — Nenhum(a)", value: 0 },
  { label: "1 — Leve", value: 1 },
  { label: "2 — Moderado(a)", value: 2 },
  { label: "3 — Grave", value: 3 },
  { label: "4 — Extremo(a)", value: 4 },
];
const koosFreq = [
  { label: "0 — Nunca", value: 0 },
  { label: "1 — Mensalmente", value: 1 },
  { label: "2 — Semanalmente", value: 2 },
  { label: "3 — Diariamente", value: 3 },
  { label: "4 — Sempre", value: 4 },
];
const koosDiff = [
  { label: "0 — Nenhuma", value: 0 },
  { label: "1 — Leve", value: 1 },
  { label: "2 — Moderada", value: 2 },
  { label: "3 — Grave", value: 3 },
  { label: "4 — Extrema", value: 4 },
];
const koosLifestyle = [
  { label: "0 — De jeito nenhum", value: 0 },
  { label: "1 — Levemente", value: 1 },
  { label: "2 — Moderadamente", value: 2 },
  { label: "3 — Gravemente", value: 3 },
  { label: "4 — Totalmente", value: 4 },
];

const koos12Items: QItem[] = [
  // Dor (P1–P4)
  { id: "P1", prompt: "P1. Com que frequência você sente dor no joelho?", options: koosFreq },
  { id: "P2", prompt: "P2. Torcer/girar sobre o seu joelho.", options: koosOpts },
  { id: "P3", prompt: "P3. Endireitar (esticar) o joelho totalmente.", options: koosOpts },
  { id: "P4", prompt: "P4. Subir ou descer escadas.", options: koosOpts },
  // Função (F1–F4)
  { id: "F1", prompt: "F1. Levantar-se da posição sentada.", options: koosDiff },
  { id: "F2", prompt: "F2. Abaixar-se ao chão / apanhar um objeto.", options: koosDiff },
  { id: "F3", prompt: "F3. Torcer/girar sobre o joelho lesionado.", options: koosDiff },
  { id: "F4", prompt: "F4. Descer escadas.", options: koosDiff },
  // Qualidade de vida (Q1–Q4)
  { id: "Q1", prompt: "Q1. Com que frequência você se lembra do problema do seu joelho?", options: koosFreq },
  { id: "Q2", prompt: "Q2. Você mudou seu estilo de vida para evitar atividades que possam prejudicar o seu joelho?", options: koosLifestyle },
  { id: "Q3", prompt: "Q3. O quanto você se sente incomodado(a) com a falta de confiança no seu joelho?", options: koosOpts },
  { id: "Q4", prompt: "Q4. Em geral, quanta dificuldade você tem com o seu joelho?", options: koosDiff },
];

export const KOOS12_DEF: QuestionnaireDef = {
  id: "koos12",
  title: "KOOS-12 — Joelho (versão curta)",
  intro:
    "Pense no seu joelho durante a última semana. Marque a opção que melhor descreve a sua experiência em cada item.",
  synopsis:
    "Versão curta do KOOS (12 perguntas) que avalia três coisas do joelho: dor, função no dia a dia e o quanto o problema afeta sua qualidade de vida. É rápida de responder e sensível para acompanhar a evolução do tratamento.",
  reference:
    "Gandek B, Roos EM, Franklin PD, Ware JE. A 12-item short form of the Knee injury and Osteoarthritis Outcome Score (KOOS-12). Osteoarthritis Cartilage. 2019;27(5):762-70. Itens fundamentados na versão brasileira do KOOS — Gonçalves RS, Cabri J, Pinheiro JP, Ferreira PL. Cross-cultural adaptation and validation of the Portuguese version of the Knee injury and Osteoarthritis Outcome Score (KOOS). Osteoarthritis Cartilage. 2009;17(9):1156-62.",
  items: koos12Items,
  score: (a) => {
    const sub = (ids: string[]) => {
      const sum = ids.reduce((s, id) => s + (a[id] ?? 0), 0);
      const raw = (sum * 100) / (4 * ids.length);
      return Math.round(100 - raw);
    };
    const dor = sub(["P1", "P2", "P3", "P4"]);
    const funcao = sub(["F1", "F2", "F3", "F4"]);
    const qualidade_vida = sub(["Q1", "Q2", "Q3", "Q4"]);
    const total = Math.round((dor + funcao + qualidade_vida) / 3);
    let interpretation = "Função do joelho preservada";
    if (total < 40) interpretation = "Função do joelho gravemente comprometida";
    else if (total < 70) interpretation = "Função do joelho moderadamente comprometida";
    return {
      total,
      max: 100,
      percent: total,
      interpretation,
      subscales: { dor, funcao, qualidade_vida },
    };
  },
};

// ---------- FIQR (Fibromyalgia Impact Questionnaire - Revised, PT-BR) ----------
// Versão brasileira validada (Paiva ES et al., Rev Bras Reumatol 2013)
// 21 itens, escala numérica 0–10, 3 domínios: função, impacto global, sintomas.
const fiqrOpts: { label: string; value: number }[] = Array.from({ length: 11 }, (_, i) => ({
  label: String(i),
  value: i,
}));

const fiqrItems: QItem[] = [
  // Função (9 itens) — "Na última semana, você teve dificuldade para…"
  { id: "F1", prompt: "F1. Pentear ou escovar o cabelo.", options: fiqrOpts },
  { id: "F2", prompt: "F2. Caminhar continuamente por 20 minutos.", options: fiqrOpts },
  { id: "F3", prompt: "F3. Preparar uma refeição caseira.", options: fiqrOpts },
  { id: "F4", prompt: "F4. Aspirar, varrer ou esfregar o chão.", options: fiqrOpts },
  { id: "F5", prompt: "F5. Levantar e carregar uma sacola cheia de compras.", options: fiqrOpts },
  { id: "F6", prompt: "F6. Subir um lance de escadas.", options: fiqrOpts },
  { id: "F7", prompt: "F7. Trocar a roupa de cama.", options: fiqrOpts },
  { id: "F8", prompt: "F8. Permanecer sentado(a) em uma cadeira por 45 minutos.", options: fiqrOpts },
  { id: "F9", prompt: "F9. Ir ao supermercado fazer compras.", options: fiqrOpts },
  // Impacto global (2 itens) — "Na última semana…"
  {
    id: "G1",
    prompt:
      "G1. A fibromialgia impediu você de realizar metas/objetivos que tinha para a semana.",
    options: fiqrOpts,
  },
  {
    id: "G2",
    prompt:
      "G2. Você se sentiu completamente sobrecarregado(a) pelos sintomas da fibromialgia.",
    options: fiqrOpts,
  },
  // Sintomas (10 itens) — "Avalie a intensidade dos seus sintomas na última semana."
  { id: "S1", prompt: "S1. Nível de dor.", options: fiqrOpts },
  { id: "S2", prompt: "S2. Nível de falta de energia (fadiga).", options: fiqrOpts },
  { id: "S3", prompt: "S3. Nível de rigidez.", options: fiqrOpts },
  { id: "S4", prompt: "S4. Qualidade do sono (0 = muito boa, 10 = péssima).", options: fiqrOpts },
  { id: "S5", prompt: "S5. Nível de depressão.", options: fiqrOpts },
  { id: "S6", prompt: "S6. Problemas de memória.", options: fiqrOpts },
  { id: "S7", prompt: "S7. Nível de ansiedade.", options: fiqrOpts },
  { id: "S8", prompt: "S8. Sensibilidade ao toque (alodínia).", options: fiqrOpts },
  { id: "S9", prompt: "S9. Problemas de equilíbrio.", options: fiqrOpts },
  {
    id: "S10",
    prompt:
      "S10. Sensibilidade a estímulos do ambiente (luzes, ruídos, cheiros, frio).",
    options: fiqrOpts,
  },
];

export const FIQR_DEF: QuestionnaireDef = {
  id: "fiqr",
  title: "FIQR — Impacto da Fibromialgia (Revisado)",
  intro:
    "Pense na sua última semana. Para cada item, escolha um número de 0 a 10 que melhor descreve a sua experiência (0 = sem dificuldade / sem sintoma; 10 = dificuldade extrema / sintoma máximo).",
  synopsis:
    "Este questionário é específico para fibromialgia. Mede três coisas: o quanto você consegue funcionar, o quanto a fibromialgia impactou a sua semana e a intensidade dos sintomas (dor, fadiga, sono, memória, ansiedade, sensibilidade). Ele dá um retrato global e ajuda a comparar momentos ao longo do tratamento.",
  reference:
    "Paiva ES, Heymann RE, Helfenstein Jr M, Goldenfum MA, Martinez JE, Provenza JR, et al. A Brazilian Portuguese version of the Revised Fibromyalgia Impact Questionnaire (FIQR): a validation study. Clin Rheumatol. 2013;32(8):1199-206.",
  items: fiqrItems,
  score: (a) => {
    const sum = (ids: string[]) => ids.reduce((s, id) => s + (a[id] ?? 0), 0);
    // Função: 9 itens (0–90) → /3 → 0–30
    const funcaoRaw = sum(["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"]);
    const funcao = Math.round((funcaoRaw / 3) * 10) / 10;
    // Impacto global: 2 itens (0–20)
    const impacto = sum(["G1", "G2"]);
    // Sintomas: 10 itens (0–100) → /2 → 0–50
    const sintomasRaw = sum([
      "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10",
    ]);
    const sintomas = Math.round((sintomasRaw / 2) * 10) / 10;
    const total = Math.round((funcao + impacto + sintomas) * 10) / 10;
    let interpretation = "Impacto leve da fibromialgia";
    if (total >= 60) interpretation = "Impacto grave da fibromialgia";
    else if (total >= 43) interpretation = "Impacto moderado da fibromialgia";
    return {
      total,
      max: 100,
      percent: Math.round(total),
      interpretation,
      subscales: { funcao, impacto_global: impacto, sintomas },
    };
  },
};

// ---------- PPS (Palliative Performance Scale v2) ----------
// Avaliação clínica única (0–100, passos de 10) — Anderson et al., 1996; tradução PT-BR.
const ppsOptions: { label: string; value: number }[] = [
  { label: "100 — Deambulação total · atividade e trabalho normais · sem evidência de doença · autocuidado completo · ingesta normal · plenamente consciente", value: 100 },
  { label: "90 — Deambulação total · atividade e trabalho normais · alguma evidência de doença · autocuidado completo · ingesta normal · plenamente consciente", value: 90 },
  { label: "80 — Deambulação total · atividade normal com esforço · alguma evidência de doença · autocuidado completo · ingesta normal ou reduzida · plenamente consciente", value: 80 },
  { label: "70 — Deambulação reduzida · incapaz de trabalhar · doença significativa · autocuidado completo · ingesta normal ou reduzida · plenamente consciente", value: 70 },
  { label: "60 — Deambulação reduzida · incapaz de hobbies/trabalho doméstico · doença significativa · necessita assistência ocasional · ingesta normal ou reduzida · consciente ou confuso", value: 60 },
  { label: "50 — Maior parte do tempo sentado/deitado · incapacitado para qualquer trabalho · doença extensa · necessita considerável assistência · ingesta normal ou reduzida · consciente ou confuso", value: 50 },
  { label: "40 — Maior parte do tempo acamado · incapacitado para a maioria das atividades · doença extensa · cuidados quase totais · ingesta normal ou reduzida · consciente, sonolento ou confuso", value: 40 },
  { label: "30 — Totalmente acamado · incapacitado para qualquer atividade · doença extensa · cuidados totais · ingesta reduzida · consciente, sonolento ou confuso", value: 30 },
  { label: "20 — Totalmente acamado · incapacitado para qualquer atividade · doença extensa · cuidados totais · ingesta mínima (goles) · consciente, sonolento ou confuso", value: 20 },
  { label: "10 — Totalmente acamado · incapacitado para qualquer atividade · doença extensa · cuidados totais · cuidados com a boca apenas · sonolento ou em coma", value: 10 },
  { label: "0 — Óbito", value: 0 },
];

export const PPS_DEF: QuestionnaireDef = {
  id: "pps",
  title: "PPS — Palliative Performance Scale (v2)",
  intro:
    "Escolha o nível que melhor representa o estado funcional global do paciente neste momento, considerando deambulação, atividade/evidência de doença, autocuidado, ingesta e nível de consciência. Em caso de dúvida entre duas categorias, escolha a menor.",
  synopsis:
    "Esta é uma escala usada por médicos em cuidados paliativos para descrever, num único número de 0 a 100, o estado funcional global do paciente — se anda, se cuida de si, se alimenta, nível de consciência. Serve para acompanhar a evolução e planejar o cuidado de forma humanizada.",
  reference:
    "Anderson F, Downing GM, Hill J, Casorso L, Lerch N. Palliative Performance Scale (PPS): a new tool. J Palliat Care. 1996;12(1):5-11. Versão 2 (PPSv2 © Victoria Hospice Society, 2001). Tradução brasileira utilizada em serviços de cuidados paliativos (Maciel MGS et al., ANCP).",
  items: [
    {
      id: "pps",
      prompt: "Nível de desempenho paliativo atual (PPS v2)",
      options: ppsOptions,
    },
  ],
  score: (a) => {
    const v = a["pps"] ?? 0;
    let interpretation = "Estável — funcionalidade preservada";
    if (v === 0) interpretation = "Óbito";
    else if (v <= 20) interpretation = "Fase terminal — cuidados totais, ingesta mínima";
    else if (v <= 40) interpretation = "Declínio importante — paciente acamado, cuidados quase totais";
    else if (v <= 60) interpretation = "Transição — assistência crescente para autocuidado";
    else if (v <= 80) interpretation = "Funcionalidade reduzida — restrição parcial de atividades";
    return { total: v, max: 100, percent: v, interpretation };
  },
};

// ---------- KPS (Karnofsky Performance Status) ----------
// Avaliação clínica única (0–100, passos de 10) — Karnofsky & Burchenal, 1949.
const kpsOptions: { label: string; value: number }[] = [
  { label: "100 — Normal · sem queixas · sem evidência de doença", value: 100 },
  { label: "90 — Capaz de atividade normal · sinais ou sintomas menores de doença", value: 90 },
  { label: "80 — Atividade normal com esforço · alguns sinais ou sintomas de doença", value: 80 },
  { label: "70 — Cuida de si mesmo · incapaz de trabalhar ou manter atividade normal", value: 70 },
  { label: "60 — Requer assistência ocasional · ainda capaz da maioria dos cuidados pessoais", value: 60 },
  { label: "50 — Requer assistência considerável e cuidados médicos frequentes", value: 50 },
  { label: "40 — Incapacitado · requer cuidados especiais e assistência", value: 40 },
  { label: "30 — Gravemente incapacitado · hospitalização indicada · morte não iminente", value: 30 },
  { label: "20 — Muito doente · hospitalização e tratamento ativo de suporte necessários", value: 20 },
  { label: "10 — Moribundo · processo de morte progredindo rapidamente", value: 10 },
  { label: "0 — Óbito", value: 0 },
];

export const KPS_DEF: QuestionnaireDef = {
  id: "kps",
  title: "Karnofsky — Performance Status",
  intro:
    "Escolha o percentual que melhor descreve a capacidade funcional global do paciente neste momento. Em caso de dúvida entre dois níveis, escolha o menor.",
  synopsis:
    "Esta é uma escala clássica que resume em um único número de 0 a 100 a capacidade funcional global do paciente — de \"normal, sem queixas\" até estados que exigem cuidados totais. É muito usada em oncologia e em cuidados paliativos para apoiar decisões de tratamento.",
  reference:
    "Karnofsky DA, Burchenal JH. The clinical evaluation of chemotherapeutic agents in cancer. In: MacLeod CM, editor. Evaluation of chemotherapeutic agents. New York: Columbia University Press; 1949. p. 191-205. Tradução brasileira de uso clínico amplamente difundida em oncologia e cuidados paliativos.",
  items: [
    {
      id: "kps",
      prompt: "Karnofsky Performance Status (0–100)",
      options: kpsOptions,
    },
  ],
  score: (a) => {
    const v = a["kps"] ?? 0;
    let interpretation = "Capaz de atividade normal e trabalho · sem cuidados especiais";
    if (v === 0) interpretation = "Óbito";
    else if (v <= 30) interpretation = "Incapaz de cuidar de si · cuidados hospitalares/institucionais · doença progredindo rapidamente";
    else if (v <= 50) interpretation = "Incapaz de trabalhar · necessita assistência considerável e cuidados médicos frequentes";
    else if (v <= 70) interpretation = "Incapaz de trabalhar · capaz de viver em casa · cuida da maioria das necessidades pessoais";
    return { total: v, max: 100, percent: v, interpretation };
  },
};

// ---------- Critérios de Nantes (Neuralgia do Pudendo) ----------
// Labat JJ et al., Neurourol Urodyn 2008 — critérios diagnósticos.
// Heteroavaliação clínica: 5 essenciais (todos obrigatórios), complementares,
// exclusão e critérios associados.
const ynOpts = [
  { label: "Não", value: 0 },
  { label: "Sim", value: 1 },
];

const nantesItems: QItem[] = [
  // Essenciais (E1–E5) — todos devem ser SIM
  { id: "E1", prompt: "E1. Dor no território do nervo pudendo (do ânus ao pênis/clitóris).", options: ynOpts },
  { id: "E2", prompt: "E2. Dor predominantemente desencadeada pela posição sentada.", options: ynOpts },
  { id: "E3", prompt: "E3. A dor te desperta durante a noite (te faz acordar)?", options: ynOpts },
  { id: "E4", prompt: "E4. Você apresenta perda objetiva de sensibilidade na região (dormência confirmada em exame neurológico)?", options: ynOpts },
  { id: "E5", prompt: "E5. Alívio da dor com bloqueio anestésico do nervo pudendo.", options: ynOpts },
  // Complementares (C1–C8) — reforçam o diagnóstico
  { id: "C1", prompt: "C1. Caráter neuropático: queimação, choque, fisgada, dormência.", options: ynOpts },
  { id: "C2", prompt: "C2. Alodínia ou hiperpatia na região.", options: ynOpts },
  { id: "C3", prompt: "C3. Sensação de corpo estranho retal ou vaginal (simpatalgia).", options: ynOpts },
  { id: "C4", prompt: "C4. Piora da dor ao longo do dia.", options: ynOpts },
  { id: "C5", prompt: "C5. Dor predominantemente unilateral.", options: ynOpts },
  { id: "C6", prompt: "C6. Dor desencadeada/agravada pela defecação.", options: ynOpts },
  { id: "C7", prompt: "C7. Sensibilidade exquisita à palpação da espinha isquiática.", options: ynOpts },
  { id: "C8", prompt: "C8. Alterações neurofisiológicas (em homens ou mulheres nulíparas).", options: ynOpts },
  // Exclusão (X1–X4) — se SIM, afastam o diagnóstico
  { id: "X1", prompt: "X1. Dor exclusivamente coccígea, glútea, púbica ou hipogástrica.", options: ynOpts },
  { id: "X2", prompt: "X2. Prurido como sintoma predominante.", options: ynOpts },
  { id: "X3", prompt: "X3. Dor exclusivamente paroxística.", options: ynOpts },
  { id: "X4", prompt: "X4. Alterações de imagem que expliquem a dor.", options: ynOpts },
  // Associados (A1–A4) — não excluem, mas sugerem outro diagnóstico associado
  { id: "A1", prompt: "A1. Dor glútea ao sentar (sugere lesão proximal do pudendo).", options: ynOpts },
  { id: "A2", prompt: "A2. Dor referida no território ciático.", options: ynOpts },
  { id: "A3", prompt: "A3. Dor suprapúbica.", options: ynOpts },
  { id: "A4", prompt: "A4. Polaciúria e/ou dor ao enchimento vesical.", options: ynOpts },
];

export const NANTES_DEF: QuestionnaireDef = {
  id: "nantes",
  title: "Critérios de Nantes — Neuralgia do Pudendo",
  intro:
    "Avaliação clínica para diagnóstico de neuralgia do pudendo (Labat et al., 2008). Marque cada item como Sim ou Não. O diagnóstico exige TODOS os 5 critérios essenciais presentes e NENHUM critério de exclusão.",
  synopsis:
    "Este é um roteiro clínico para investigar uma causa específica de dor pélvica — a neuralgia do nervo pudendo. O médico revisa características da dor (localização, piora ao sentar, alívio com bloqueio) para definir se o quadro se encaixa nesse diagnóstico e direcionar o tratamento certo.",
  reference:
    "Labat JJ, Riant T, Robert R, Amarenco G, Lefaucheur JP, Rigaud J. Diagnostic criteria for pudendal neuralgia by pudendal nerve entrapment (Nantes criteria). Neurourol Urodyn. 2008;27(4):306-10. Versão em português de uso clínico amplamente difundida em serviços de dor pélvica no Brasil.",
  items: nantesItems,
  score: (a) => {
    const sum = (ids: string[]) => ids.reduce((s, id) => s + (a[id] ?? 0), 0);
    // E3 e E4 são reversos: "Não" (0) = critério essencial atendido.
    const metReverse = (id: string) => ((a[id] ?? 0) === 0 ? 1 : 0);
    const essenciais =
      (a["E1"] ?? 0) + (a["E2"] ?? 0) + metReverse("E3") + metReverse("E4") + (a["E5"] ?? 0);
    const complementares = sum(["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8"]);
    const exclusoes = sum(["X1", "X2", "X3", "X4"]);
    const associados = sum(["A1", "A2", "A3", "A4"]);
    let interpretation: string;
    if (essenciais === 5 && exclusoes === 0) {
      interpretation = `Critérios de Nantes preenchidos — diagnóstico compatível com neuralgia do pudendo (${complementares} complementar${complementares === 1 ? "" : "es"} presente${complementares === 1 ? "" : "s"})`;
    } else if (essenciais === 5 && exclusoes > 0) {
      interpretation = `Essenciais presentes, porém com ${exclusoes} critério(s) de exclusão — diagnóstico afastado`;
    } else if (exclusoes > 0) {
      interpretation = `Diagnóstico improvável — ${exclusoes} critério(s) de exclusão`;
    } else {
      interpretation = `Critérios essenciais incompletos (${essenciais}/5) — diagnóstico não estabelecido`;
    }
    return {
      total: essenciais,
      max: 5,
      interpretation,
      subscales: {
        essenciais,
        complementares,
        exclusoes,
        associados,
      },
    };
  },
};

// ===========================================================================
// Questionários adicionais — todos com versão validada em PT-BR e uso público
// ===========================================================================

// ---------- PEG (Pain, Enjoyment, General activity) — 3 itens 0–10 ----------
const nrs0a10 = Array.from({ length: 11 }, (_, i) => ({
  label: String(i),
  value: i,
}));

export const PEG_DEF: QuestionnaireDef = {
  id: "peg",
  title: "PEG — Dor, Prazer e Atividade Geral",
  intro:
    "Pensando nos últimos 7 dias, responda às 3 questões abaixo com uma nota de 0 a 10.",
  synopsis:
    "Avaliação breve (3 perguntas) do impacto da dor na sua vida: intensidade, quanto interfere no prazer de viver e quanto interfere nas atividades do dia a dia. É um resumo rápido para acompanhar a evolução do tratamento.",
  reference:
    "Krebs EE, Lorenz KA, Bair MJ, et al. Development and initial validation of the PEG, a three-item scale assessing pain intensity and interference. J Gen Intern Med. 2009;24(6):733-8. Adaptação PT-BR: Ferreira-Valente MA, Pais-Ribeiro JL, Jensen MP, 2018.",
  items: [
    {
      id: "1",
      prompt:
        "Qual nota você daria, em média, para a sua dor nos últimos 7 dias? (0 = sem dor, 10 = pior dor imaginável)",
      options: nrs0a10,
    },
    {
      id: "2",
      prompt:
        "Quanto a dor interferiu no seu prazer de viver nos últimos 7 dias? (0 = não interferiu, 10 = interferiu completamente)",
      options: nrs0a10,
    },
    {
      id: "3",
      prompt:
        "Quanto a dor interferiu nas suas atividades em geral nos últimos 7 dias? (0 = não interferiu, 10 = interferiu completamente)",
      options: nrs0a10,
    },
  ],
  score: (a) => {
    const vals = ["1", "2", "3"].map((id) => a[id] ?? 0);
    const sum = vals.reduce((s, v) => s + v, 0);
    const media = vals.length ? sum / vals.length : 0;
    let interpretation = "Impacto leve";
    if (media >= 7) interpretation = "Impacto grave";
    else if (media >= 4) interpretation = "Impacto moderado";
    return {
      total: Math.round(media * 10) / 10,
      max: 10,
      percent: Math.round(media * 10),
      interpretation,
      subscales: {
        intensidade: vals[0],
        prazer: vals[1],
        atividade: vals[2],
      },
    };
  },
};

// ---------- PHQ-9 — Depressão (Patient Health Questionnaire) ----------
const phqOptions = [
  { label: "0 — nenhum dia", value: 0 },
  { label: "1 — vários dias", value: 1 },
  { label: "2 — mais da metade dos dias", value: 2 },
  { label: "3 — quase todos os dias", value: 3 },
];

export const PHQ9_DEF: QuestionnaireDef = {
  id: "phq9",
  title: "PHQ-9 — Sintomas Depressivos",
  intro:
    "Nas últimas 2 semanas, com que frequência você foi incomodado(a) por qualquer um dos problemas abaixo?",
  synopsis:
    "Triagem de sintomas depressivos nas últimas duas semanas. Não é um diagnóstico — é um termômetro para conversar com seu médico sobre humor, sono, energia e bem-estar emocional.",
  reference:
    "Santos IS, Tavares BF, Munhoz TN, et al. Sensibilidade e especificidade do Patient Health Questionnaire-9 (PHQ-9) entre adultos da população geral. Cad Saude Publica. 2013;29(8):1533-43.",
  items: [
    { id: "1", prompt: "Pouco interesse ou prazer em fazer as coisas.", options: phqOptions },
    { id: "2", prompt: "Sentir-se para baixo, deprimido(a) ou sem esperança.", options: phqOptions },
    { id: "3", prompt: "Dificuldade para pegar no sono, continuar dormindo ou dormir demais.", options: phqOptions },
    { id: "4", prompt: "Sentir-se cansado(a) ou com pouca energia.", options: phqOptions },
    { id: "5", prompt: "Falta de apetite ou comer demais.", options: phqOptions },
    { id: "6", prompt: "Sentir-se mal consigo mesmo(a) — ou achar que é um(a) fracassado(a) ou que decepcionou sua família.", options: phqOptions },
    { id: "7", prompt: "Dificuldade para se concentrar em coisas, como ler o jornal ou ver televisão.", options: phqOptions },
    { id: "8", prompt: "Lentidão para se movimentar ou falar (perceptível por outras pessoas) — ou, ao contrário, estar tão agitado(a) que se move muito mais que o habitual.", options: phqOptions },
    { id: "9", prompt: "Pensar em se ferir de alguma maneira ou que seria melhor estar morto(a).", options: phqOptions },
  ],
  score: (a) => {
    const total = Array.from({ length: 9 }, (_, i) => a[String(i + 1)] ?? 0).reduce(
      (s, v) => s + v,
      0,
    );
    let interpretation = "Mínimo / sem sintomas";
    if (total >= 20) interpretation = "Depressão grave";
    else if (total >= 15) interpretation = "Depressão moderadamente grave";
    else if (total >= 10) interpretation = "Depressão moderada";
    else if (total >= 5) interpretation = "Sintomas leves";
    const alertaItem9 = (a["9"] ?? 0) > 0;
    return {
      total,
      max: 27,
      percent: Math.round((total / 27) * 100),
      interpretation:
        interpretation + (alertaItem9 ? " · Atenção: item 9 positivo (ideação)." : ""),
    };
  },
};

// ---------- GAD-7 — Ansiedade Generalizada ----------
export const GAD7_DEF: QuestionnaireDef = {
  id: "gad7",
  title: "GAD-7 — Sintomas de Ansiedade",
  intro:
    "Nas últimas 2 semanas, com que frequência você foi incomodado(a) pelos problemas abaixo?",
  synopsis:
    "Triagem de sintomas de ansiedade nas últimas duas semanas. Ajuda a perceber preocupação excessiva, irritabilidade e tensão — sinais importantes ao lado do quadro de dor.",
  reference:
    "Moreno AL, DeSousa DA, Souza AMFL, et al. Factor structure, reliability, and item parameters of the Brazilian-Portuguese version of the GAD-7 questionnaire. Trends Psychiatry Psychother. 2016;38(3):143-9.",
  items: [
    { id: "1", prompt: "Sentir-se nervoso(a), ansioso(a) ou muito tenso(a).", options: phqOptions },
    { id: "2", prompt: "Não conseguir parar ou controlar as preocupações.", options: phqOptions },
    { id: "3", prompt: "Preocupar-se muito com diversas coisas.", options: phqOptions },
    { id: "4", prompt: "Dificuldade para relaxar.", options: phqOptions },
    { id: "5", prompt: "Ficar tão agitado(a) que se torna difícil ficar parado(a).", options: phqOptions },
    { id: "6", prompt: "Ficar facilmente aborrecido(a) ou irritado(a).", options: phqOptions },
    { id: "7", prompt: "Sentir medo como se algo terrível fosse acontecer.", options: phqOptions },
  ],
  score: (a) => {
    const total = Array.from({ length: 7 }, (_, i) => a[String(i + 1)] ?? 0).reduce(
      (s, v) => s + v,
      0,
    );
    let interpretation = "Mínimo / sem ansiedade";
    if (total >= 15) interpretation = "Ansiedade grave";
    else if (total >= 10) interpretation = "Ansiedade moderada";
    else if (total >= 5) interpretation = "Ansiedade leve";
    return {
      total,
      max: 21,
      percent: Math.round((total / 21) * 100),
      interpretation,
    };
  },
};

// ---------- FABQ — Fear-Avoidance Beliefs Questionnaire ----------
const fabqOptions = Array.from({ length: 7 }, (_, i) => ({
  label:
    i === 0
      ? "0 — discordo totalmente"
      : i === 3
      ? "3 — neutro"
      : i === 6
      ? "6 — concordo totalmente"
      : String(i),
  value: i,
}));

export const FABQ_DEF: QuestionnaireDef = {
  id: "fabq",
  title: "FABQ — Crenças de Medo-Evitação",
  intro:
    "Indique o quanto você concorda com cada afirmação sobre sua dor, atividade física e trabalho (0 = discordo totalmente; 6 = concordo totalmente).",
  synopsis:
    "Avalia o quanto o medo de se machucar e a evitação de atividades — físicas ou no trabalho — estão influenciando sua dor. Saber disso ajuda a planejar uma reabilitação mais segura e progressiva.",
  reference:
    "Abreu AM, Faria CD, Cardoso SM, Teixeira-Salmela LF. Versão brasileira do Fear Avoidance Beliefs Questionnaire. Cad Saude Publica. 2008;24(3):615-23.",
  items: [
    { id: "1", prompt: "Minha dor foi causada por atividade física.", options: fabqOptions },
    { id: "2", prompt: "A atividade física faz minha dor piorar.", options: fabqOptions },
    { id: "3", prompt: "Atividade física pode prejudicar minhas costas.", options: fabqOptions },
    { id: "4", prompt: "Eu não deveria fazer atividades físicas que (poderiam) piorar minha dor.", options: fabqOptions },
    { id: "5", prompt: "Eu não posso fazer atividades físicas que (poderiam) piorar minha dor.", options: fabqOptions },
    { id: "6", prompt: "Minha dor foi causada pelo meu trabalho ou por um acidente no trabalho.", options: fabqOptions },
    { id: "7", prompt: "Meu trabalho agravou a minha dor.", options: fabqOptions },
    { id: "8", prompt: "Tenho uma indenização ou pedido de indenização por causa da minha dor.", options: fabqOptions },
    { id: "9", prompt: "Meu trabalho é muito pesado para mim.", options: fabqOptions },
    { id: "10", prompt: "Meu trabalho faz, ou faria, minha dor piorar.", options: fabqOptions },
    { id: "11", prompt: "Meu trabalho pode prejudicar minhas costas.", options: fabqOptions },
    { id: "12", prompt: "Eu não deveria fazer meu trabalho atual com essa dor.", options: fabqOptions },
    { id: "13", prompt: "Eu não posso fazer meu trabalho atual com essa dor.", options: fabqOptions },
    { id: "14", prompt: "Eu não posso fazer meu trabalho atual até que minha dor seja tratada.", options: fabqOptions },
    { id: "15", prompt: "Eu não acho que voltarei ao meu trabalho normal em 3 meses.", options: fabqOptions },
    { id: "16", prompt: "Eu não acho que serei capaz de voltar ao meu trabalho normal nunca mais.", options: fabqOptions },
  ],
  score: (a) => {
    const sum = (ids: string[]) => ids.reduce((s, id) => s + (a[id] ?? 0), 0);
    // FABQ-Phys: itens 2,3,4,5 (0–24)
    const phys = sum(["2", "3", "4", "5"]);
    // FABQ-Work: itens 6,7,9,10,11,12,15 (0–42)
    const work = sum(["6", "7", "9", "10", "11", "12", "15"]);
    const total = phys + work;
    let interpretation = "Crenças baixas de medo-evitação";
    if (phys >= 15 || work >= 25) interpretation = "Crenças elevadas de medo-evitação";
    else if (phys >= 10 || work >= 20) interpretation = "Crenças moderadas de medo-evitação";
    return {
      total,
      max: 66,
      interpretation,
      subscales: {
        atividade_fisica: phys,
        trabalho: work,
      },
    };
  },
};

// ---------- PROMIS Physical Function — Short Form 10a ----------
// 5 itens de capacidade (5 = sem dificuldade ... 1 = incapaz) +
// 5 itens de interferência (5 = nada ... 1 = não consegue).
// Todos pontuam na mesma direção: 5 = melhor função, 1 = pior.
const promisCapacityOptions = [
  { label: "5 — sem qualquer dificuldade", value: 5 },
  { label: "4 — com um pouco de dificuldade", value: 4 },
  { label: "3 — com alguma dificuldade", value: 3 },
  { label: "2 — com muita dificuldade", value: 2 },
  { label: "1 — incapaz de fazer", value: 1 },
];
const promisLimitOptions = [
  { label: "5 — de jeito nenhum", value: 5 },
  { label: "4 — muito pouco", value: 4 },
  { label: "3 — um pouco", value: 3 },
  { label: "2 — muito", value: 2 },
  { label: "1 — não consegue fazer", value: 1 },
];

export const PROMIS_PF_DEF: QuestionnaireDef = {
  id: "promis_pf",
  title: "PROMIS — Função Física (Forma Curta 10a)",
  intro:
    "Para cada item, indique a opção que melhor descreve sua função física no momento.",
  synopsis:
    "Mede o quanto você consegue realizar atividades do dia a dia — andar, subir escadas, carregar peso, fazer tarefas domésticas e de lazer. Quanto maior a pontuação, melhor a sua função física.",
  reference:
    "Instrumento PROMIS® (Patient-Reported Outcomes Measurement Information System) — HealthMeasures / PROMIS Health Organization. Versão em português brasileiro disponibilizada pela rede PROMIS Brasil (FACIT.org / HealthMeasures). Domínio: Physical Function — Short Form 10a.",
  items: [
    { id: "1", prompt: "Você consegue fazer tarefas domésticas pesadas, como esfregar o chão ou limpar janelas?", options: promisCapacityOptions },
    { id: "2", prompt: "Você consegue subir um lance de escadas em ritmo normal?", options: promisCapacityOptions },
    { id: "3", prompt: "Você consegue andar por 15 minutos, sem parar, em terreno plano?", options: promisCapacityOptions },
    { id: "4", prompt: "Você consegue carregar uma sacola de compras ou pasta?", options: promisCapacityOptions },
    { id: "5", prompt: "Você consegue se curvar, ajoelhar-se ou agachar-se?", options: promisCapacityOptions },
    { id: "6", prompt: "Sua saúde limita você nas atividades vigorosas (correr, levantar objetos pesados, esportes pesados)?", options: promisLimitOptions },
    { id: "7", prompt: "Sua saúde limita você ao subir vários lances de escada?", options: promisLimitOptions },
    { id: "8", prompt: "Sua saúde limita você ao caminhar mais de um quilômetro?", options: promisLimitOptions },
    { id: "9", prompt: "Sua saúde limita você nas atividades de lazer, como caminhar, jardinagem ou natação leve?", options: promisLimitOptions },
    { id: "10", prompt: "Sua saúde limita você ao fazer atividades moderadas, como mover uma mesa ou empurrar um aspirador?", options: promisLimitOptions },
  ],
  score: (a) => {
    const total = Array.from({ length: 10 }, (_, i) => a[String(i + 1)] ?? 0).reduce(
      (s, v) => s + v,
      0,
    );
    let interpretation = "Função física baixa";
    if (total >= 45) interpretation = "Função física excelente";
    else if (total >= 35) interpretation = "Função física boa";
    else if (total >= 25) interpretation = "Função física moderada";
    return {
      total,
      max: 50,
      percent: Math.round((total / 50) * 100),
      interpretation,
    };
  },
};

// ---------- PROMIS Mobility — adaptado para quadril ----------
// Adaptação inspirada nos itens PROMIS de Função Física com ênfase em
// mobilidade do quadril (marcha, escadas, levantar da cadeira, agachar,
// pivotar, sair do carro). Mantém a métrica do PROMIS-PF: 10 itens,
// cada um 1–5 (5 = sem dificuldade), escore bruto 10–50, ↑ = melhor.
// NÃO é a forma curta oficial PROMIS Mobility 8a — é uma adaptação
// pragmática para acompanhamento clínico de quadril.
export const PROMIS_MOBILITY_HIP_DEF: QuestionnaireDef = {
  id: "promis_mobility_hip",
  title: "PROMIS Mobility — Quadril (adaptado)",
  intro:
    "Para cada item, indique a opção que melhor descreve sua mobilidade no momento, pensando especificamente no seu quadril.",
  synopsis:
    "Avalia a mobilidade funcional do quadril: caminhar, subir/descer escadas, levantar da cadeira, agachar, pivotar e entrar/sair do carro. Quanto maior a pontuação, melhor a mobilidade.",
  reference:
    "Adaptação de itens de mobilidade do PROMIS® Physical Function (HealthMeasures / PROMIS Health Organization) com foco em quadril. Não substitui as formas curtas oficiais PROMIS Mobility — uso clínico para acompanhamento longitudinal.",
  items: [
    { id: "1", prompt: "Você consegue caminhar por 15 minutos, sem parar, em terreno plano?", options: promisCapacityOptions },
    { id: "2", prompt: "Você consegue subir um lance de escadas em ritmo normal?", options: promisCapacityOptions },
    { id: "3", prompt: "Você consegue descer um lance de escadas em ritmo normal?", options: promisCapacityOptions },
    { id: "4", prompt: "Você consegue levantar-se de uma cadeira sem usar os braços?", options: promisCapacityOptions },
    { id: "5", prompt: "Você consegue agachar-se para pegar algo no chão?", options: promisCapacityOptions },
    { id: "6", prompt: "Sua mobilidade do quadril limita você ao caminhar mais de um quilômetro?", options: promisLimitOptions },
    { id: "7", prompt: "Sua mobilidade do quadril limita você ao entrar e sair do carro?", options: promisLimitOptions },
    { id: "8", prompt: "Sua mobilidade do quadril limita você ao girar/pivotar o corpo (mudar de direção andando)?", options: promisLimitOptions },
    { id: "9", prompt: "Sua mobilidade do quadril limita você ao calçar meias e sapatos?", options: promisLimitOptions },
    { id: "10", prompt: "Sua mobilidade do quadril limita você em atividades de lazer (caminhar, dançar, jardinagem)?", options: promisLimitOptions },
  ],
  score: (a) => {
    const total = Array.from({ length: 10 }, (_, i) => a[String(i + 1)] ?? 0).reduce(
      (s, v) => s + v,
      0,
    );
    let interpretation = "Mobilidade baixa";
    if (total >= 45) interpretation = "Mobilidade excelente";
    else if (total >= 35) interpretation = "Mobilidade boa";
    else if (total >= 25) interpretation = "Mobilidade moderada";
    return {
      total,
      max: 50,
      percent: Math.round((total / 50) * 100),
      interpretation,
    };
  },
};


// ---------- ISI — Insomnia Severity Index ----------
const isi04 = [
  { label: "0 — nenhuma", value: 0 },
  { label: "1 — leve", value: 1 },
  { label: "2 — moderada", value: 2 },
  { label: "3 — grave", value: 3 },
  { label: "4 — muito grave", value: 4 },
];
const isiSatisf = [
  { label: "0 — muito satisfeito(a)", value: 0 },
  { label: "1 — satisfeito(a)", value: 1 },
  { label: "2 — moderadamente satisfeito(a)", value: 2 },
  { label: "3 — insatisfeito(a)", value: 3 },
  { label: "4 — muito insatisfeito(a)", value: 4 },
];
const isiNotice = [
  { label: "0 — nada perceptível", value: 0 },
  { label: "1 — pouco", value: 1 },
  { label: "2 — algo", value: 2 },
  { label: "3 — muito", value: 3 },
  { label: "4 — muitíssimo", value: 4 },
];
const isiWorry = [
  { label: "0 — nada preocupado(a)", value: 0 },
  { label: "1 — pouco", value: 1 },
  { label: "2 — algo", value: 2 },
  { label: "3 — muito", value: 3 },
  { label: "4 — extremamente", value: 4 },
];
const isiInterf = [
  { label: "0 — não interferiu", value: 0 },
  { label: "1 — um pouco", value: 1 },
  { label: "2 — moderadamente", value: 2 },
  { label: "3 — muito", value: 3 },
  { label: "4 — interferiu totalmente", value: 4 },
];

export const ISI_DEF: QuestionnaireDef = {
  id: "isi",
  title: "ISI — Índice de Gravidade da Insônia",
  intro:
    "As perguntas a seguir referem-se ao seu sono nas últimas 2 semanas.",
  synopsis:
    "Avalia a gravidade da insônia: dificuldade para iniciar o sono, manutenção, despertar precoce, satisfação com o sono e o impacto disso no seu dia a dia. Dor e sono andam juntos — cuidar de um ajuda o outro.",
  reference:
    "Castro LS. Adaptação e validação do Índice de Gravidade de Insônia (IGI): caracterização populacional, valores normativos e aspectos associados. Tese (Doutorado) — UNIFESP, 2011.",
  items: [
    { id: "1", prompt: "Dificuldade para iniciar o sono.", options: isi04 },
    { id: "2", prompt: "Dificuldade para manter o sono.", options: isi04 },
    { id: "3", prompt: "Acordar muito cedo.", options: isi04 },
    { id: "4", prompt: "Quão satisfeito(a)/insatisfeito(a) você está com seu padrão atual de sono?", options: isiSatisf },
    { id: "5", prompt: "Quão perceptível para os outros você acha que está seu problema de sono em termos de prejudicar sua qualidade de vida?", options: isiNotice },
    { id: "6", prompt: "Quão preocupado(a)/incomodado(a) você está com seu problema atual de sono?", options: isiWorry },
    { id: "7", prompt: "Em que medida você considera que seu problema de sono interfere no seu funcionamento diário (fadiga, humor, trabalho, concentração, etc.)?", options: isiInterf },
  ],
  score: (a) => {
    const total = Array.from({ length: 7 }, (_, i) => a[String(i + 1)] ?? 0).reduce(
      (s, v) => s + v,
      0,
    );
    let interpretation = "Sem insônia clinicamente significativa";
    if (total >= 22) interpretation = "Insônia clínica grave";
    else if (total >= 15) interpretation = "Insônia clínica de moderada gravidade";
    else if (total >= 8) interpretation = "Insônia subclínica (limítrofe)";
    return {
      total,
      max: 28,
      percent: Math.round((total / 28) * 100),
      interpretation,
    };
  },
};

// ---------- WHOQOL-BREF — Qualidade de Vida (26 itens) ----------
const whoq1a5 = [
  { label: "1 — muito ruim / muito insatisfeito(a)", value: 1 },
  { label: "2 — ruim / insatisfeito(a)", value: 2 },
  { label: "3 — nem ruim nem boa / nem insatisfeito(a) nem satisfeito(a)", value: 3 },
  { label: "4 — boa / satisfeito(a)", value: 4 },
  { label: "5 — muito boa / muito satisfeito(a)", value: 5 },
];
const whoqFreq = [
  { label: "1 — nada", value: 1 },
  { label: "2 — muito pouco", value: 2 },
  { label: "3 — mais ou menos", value: 3 },
  { label: "4 — bastante", value: 4 },
  { label: "5 — extremamente", value: 5 },
];
const whoqCapac = [
  { label: "1 — nada", value: 1 },
  { label: "2 — muito pouco", value: 2 },
  { label: "3 — médio", value: 3 },
  { label: "4 — muito", value: 4 },
  { label: "5 — completamente", value: 5 },
];
const whoqFreqNeg = [
  { label: "1 — nunca", value: 1 },
  { label: "2 — algumas vezes", value: 2 },
  { label: "3 — frequentemente", value: 3 },
  { label: "4 — muito frequentemente", value: 4 },
  { label: "5 — sempre", value: 5 },
];

export const WHOQOL_BREF_DEF: QuestionnaireDef = {
  id: "whoqol_bref",
  title: "WHOQOL-BREF — Qualidade de Vida (OMS)",
  intro:
    "As perguntas seguintes referem-se a como você se sente a respeito da sua qualidade de vida nas últimas 2 semanas.",
  synopsis:
    "Questionário da Organização Mundial da Saúde (versão abreviada) com 26 perguntas sobre quatro grandes áreas: saúde física, bem-estar psicológico, relações sociais e ambiente em que você vive. Dá uma fotografia geral da sua qualidade de vida.",
  reference:
    "Fleck MPA, Louzada S, Xavier M, et al. Aplicação da versão em português do instrumento abreviado de avaliação da qualidade de vida WHOQOL-bref. Rev Saude Publica. 2000;34(2):178-83.",
  items: [
    { id: "1", prompt: "Como você avaliaria sua qualidade de vida?", options: whoq1a5 },
    { id: "2", prompt: "Quão satisfeito(a) você está com a sua saúde?", options: whoq1a5 },
    { id: "3", prompt: "Em que medida você acha que sua dor (física) impede você de fazer o que precisa?", options: whoqFreq },
    { id: "4", prompt: "O quanto você precisa de algum tratamento médico para levar sua vida diária?", options: whoqFreq },
    { id: "5", prompt: "O quanto você aproveita a vida?", options: whoqFreq },
    { id: "6", prompt: "Em que medida você acha que a sua vida tem sentido?", options: whoqFreq },
    { id: "7", prompt: "O quanto você consegue se concentrar?", options: whoqFreq },
    { id: "8", prompt: "Quão seguro(a) você se sente em sua vida diária?", options: whoqFreq },
    { id: "9", prompt: "Quão saudável é o seu ambiente físico (clima, barulho, poluição, atrativos)?", options: whoqFreq },
    { id: "10", prompt: "Você tem energia suficiente para seu dia a dia?", options: whoqCapac },
    { id: "11", prompt: "Você é capaz de aceitar sua aparência física?", options: whoqCapac },
    { id: "12", prompt: "Você tem dinheiro suficiente para satisfazer suas necessidades?", options: whoqCapac },
    { id: "13", prompt: "Quão disponíveis para você estão as informações que precisa no seu dia a dia?", options: whoqCapac },
    { id: "14", prompt: "Em que medida você tem oportunidades de atividade de lazer?", options: whoqCapac },
    { id: "15", prompt: "Quão bem você é capaz de se locomover?", options: whoq1a5 },
    { id: "16", prompt: "Quão satisfeito(a) você está com o seu sono?", options: whoq1a5 },
    { id: "17", prompt: "Quão satisfeito(a) você está com sua capacidade de desempenhar as atividades do seu dia a dia?", options: whoq1a5 },
    { id: "18", prompt: "Quão satisfeito(a) você está com sua capacidade para o trabalho?", options: whoq1a5 },
    { id: "19", prompt: "Quão satisfeito(a) você está consigo mesmo(a)?", options: whoq1a5 },
    { id: "20", prompt: "Quão satisfeito(a) você está com suas relações pessoais (amigos, parentes, conhecidos, colegas)?", options: whoq1a5 },
    { id: "21", prompt: "Quão satisfeito(a) você está com sua vida sexual?", options: whoq1a5 },
    { id: "22", prompt: "Quão satisfeito(a) você está com o apoio que você recebe de seus amigos?", options: whoq1a5 },
    { id: "23", prompt: "Quão satisfeito(a) você está com as condições do local onde mora?", options: whoq1a5 },
    { id: "24", prompt: "Quão satisfeito(a) você está com o seu acesso aos serviços de saúde?", options: whoq1a5 },
    { id: "25", prompt: "Quão satisfeito(a) você está com o seu meio de transporte?", options: whoq1a5 },
    { id: "26", prompt: "Com que frequência você tem sentimentos negativos, tais como mau humor, desespero, ansiedade, depressão?", options: whoqFreqNeg },
  ],
  score: (a) => {
    // Itens 3, 4 e 26 têm direção invertida (sintoma → menor QV).
    const v = (id: string) => a[id] ?? 0;
    const inv = (id: string) => (a[id] ? 6 - a[id] : 0);
    // Domínios conforme manual WHOQOL-BREF (média dos itens × 4 → 0–100).
    const meanTo100 = (items: number[]) => {
      const valid = items.filter((x) => x > 0);
      if (!valid.length) return 0;
      const mean = valid.reduce((s, x) => s + x, 0) / valid.length;
      return Math.round(((mean - 1) / 4) * 100);
    };
    const fisico = meanTo100([
      inv("3"),
      inv("4"),
      v("10"),
      v("15"),
      v("16"),
      v("17"),
      v("18"),
    ]);
    const psicologico = meanTo100([
      v("5"),
      v("6"),
      v("7"),
      v("11"),
      v("19"),
      inv("26"),
    ]);
    const social = meanTo100([v("20"), v("21"), v("22")]);
    const ambiente = meanTo100([
      v("8"),
      v("9"),
      v("12"),
      v("13"),
      v("14"),
      v("23"),
      v("24"),
      v("25"),
    ]);
    const geral = meanTo100([v("1"), v("2")]);
    const total = Math.round((fisico + psicologico + social + ambiente) / 4);
    let interpretation = "Qualidade de vida boa";
    if (total < 40) interpretation = "Qualidade de vida ruim";
    else if (total < 60) interpretation = "Qualidade de vida regular";
    else if (total >= 80) interpretation = "Qualidade de vida muito boa";
    return {
      total,
      max: 100,
      percent: total,
      interpretation,
      subscales: {
        geral,
        fisico,
        psicologico,
        social,
        ambiente,
      },
    };
  },
};

// ---------- PPDI (Pediatric Pain Disability Index) ----------
// Tradução para o português (Brasil) — uso clínico interno.
// 12 itens · escala 0–4 (sem dificuldade → não consigo realizar) · total 0–48.
// Referência: Hübner B, Hechler T, Dobe M, et al. Pain-related disability in
// adolescents suffering from chronic pain — preliminary examination of the
// Pediatric Pain Disability Index (P-PDI). Schmerz. 2009;23(1):20-32.
const ppdiOpts = [
  { label: "0 — Sem dificuldade nenhuma", value: 0 },
  { label: "1 — Um pouco de dificuldade", value: 1 },
  { label: "2 — Dificuldade moderada", value: 2 },
  { label: "3 — Muita dificuldade", value: 3 },
  { label: "4 — Não consigo fazer por causa da dor", value: 4 },
];

const ppdiItems: QItem[] = [
  { id: "Q1", prompt: "1. Ir para a escola / creche.", options: ppdiOpts },
  { id: "Q2", prompt: "2. Fazer as lições / tarefas escolares em casa.", options: ppdiOpts },
  { id: "Q3", prompt: "3. Brincar ou se divertir com amigos(as).", options: ppdiOpts },
  { id: "Q4", prompt: "4. Praticar esportes ou educação física.", options: ppdiOpts },
  { id: "Q5", prompt: "5. Andar de bicicleta, patinete ou correr.", options: ppdiOpts },
  { id: "Q6", prompt: "6. Dormir bem à noite.", options: ppdiOpts },
  { id: "Q7", prompt: "7. Comer normalmente nas refeições.", options: ppdiOpts },
  { id: "Q8", prompt: "8. Tomar banho e se vestir sozinho(a).", options: ppdiOpts },
  { id: "Q9", prompt: "9. Ajudar em pequenas tarefas de casa.", options: ppdiOpts },
  { id: "Q10", prompt: "10. Atividades de lazer (assistir TV, ler, jogar videogame).", options: ppdiOpts },
  { id: "Q11", prompt: "11. Passear ou sair com a família.", options: ppdiOpts },
  { id: "Q12", prompt: "12. Cuidar de si mesmo(a) (higiene, escovar dentes, pentear cabelo).", options: ppdiOpts },
];

export const PPDI_DEF: QuestionnaireDef = {
  id: "ppdi",
  title: "PPDI — Índice de Incapacidade por Dor (Pediátrico)",
  intro:
    "Pensando na última semana, marque o quanto a dor atrapalhou você em cada uma destas atividades. Se não tiver certeza, marque a opção que mais se parece com o seu dia a dia.",
  synopsis:
    "Questionário pediátrico que mede o quanto a dor está atrapalhando crianças e adolescentes nas atividades do dia a dia — escola, brincadeiras, esporte, sono, higiene e convívio familiar. Útil para acompanhar a evolução do tratamento ao longo do tempo.",
  reference:
    "Hübner B, Hechler T, Dobe M, et al. Schmerzbezogene Beeinträchtigung bei Jugendlichen mit chronischen Schmerzen — Erste Überprüfung des Pediatric Pain Disability Index (P-PDI). Schmerz. 2009;23(1):20-32. Tradução de uso clínico para o português (Brasil).",
  items: ppdiItems,
  score: (a) => {
    const total = ppdiItems.reduce((s, it) => s + (a[it.id] ?? 0), 0);
    const max = 48;
    const percent = Math.round((total / max) * 100);
    let interpretation = "Incapacidade leve por dor";
    if (total >= 37) interpretation = "Incapacidade incapacitante por dor";
    else if (total >= 25) interpretation = "Incapacidade severa por dor";
    else if (total >= 13) interpretation = "Incapacidade moderada por dor";
    return { total, max, percent, interpretation };
  },
};

export const QUESTIONNAIRE_DEFS: Record<string, QuestionnaireDef> = {
  pcs: PCS_DEF,
  odi: ODI_DEF,
  ndi: NDI_DEF,
  spadi: SPADI_DEF,
  sf36: SF36_DEF,
  tsk: TSK_DEF,
  rmdq: RMDQ_DEF,
  dn4: DN4_DEF,
  hads: HADS_DEF,
  hoos: HOOS_DEF,
  koos12: KOOS12_DEF,
  fiqr: FIQR_DEF,
  pps: PPS_DEF,
  kps: KPS_DEF,
  nantes: NANTES_DEF,
  peg: PEG_DEF,
  phq9: PHQ9_DEF,
  gad7: GAD7_DEF,
  fabq: FABQ_DEF,
  promis_pf: PROMIS_PF_DEF,
  promis_mobility_hip: PROMIS_MOBILITY_HIP_DEF,
  isi: ISI_DEF,
  whoqol_bref: WHOQOL_BREF_DEF,
  ppdi: PPDI_DEF,
};

export function getDef(type: string): QuestionnaireDef | undefined {
  return QUESTIONNAIRE_DEFS[type];
}

