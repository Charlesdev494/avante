// Catálogo dos questionários disponíveis
export type QuestionnaireType =
  | "eva"
  | "pain_map"
  | "sf36"
  | "pcs"
  | "spadi"
  | "ndi"
  | "odi"
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


export interface QuestionnaireMeta {
  id: QuestionnaireType;
  name: string;
  short: string;
  description: string;
  /**
   * Resumo clínico curto (1–2 frases) — quando indicar este instrumento
   * e o que ele entrega de informação ao médico. Mostrado abaixo da
   * descrição nos cards de seleção, como apoio à decisão.
   */
  indication?: string;
  clinicianOnly?: boolean;
  /**
   * Quando true, o questionário fica sombreado/desabilitado nos seletores
   * (aguardando licenciamento). A definição permanece no código para
   * preservar dados históricos e permitir reativação imediata.
   */
  hidden?: boolean;
}



const QUESTIONNAIRES_RAW: QuestionnaireMeta[] = [
  {
    id: "eva",
    name: "EVA — Escala Visual Analógica",
    short: "EVA",
    description: "Intensidade da dor de 0 a 10.",
    indication:
      "Use a cada consulta para acompanhar a intensidade subjetiva da dor ao longo do tratamento. Rápida, sensível a mudanças e útil em qualquer condição dolorosa.",
  },
  {
    id: "pain_map",
    name: "Mapa da Dor",
    short: "Mapa",
    description: "Paciente pinta as áreas doloridas no corpo (frente e costas).",
    indication:
      "Indicado quando a dor é difusa, multifocal ou tem distribuição relevante (irradiação, padrão miofascial, fibromialgia). Documenta a topografia e ajuda a diferenciar dor localizada de generalizada.",
  },
  {
    id: "sf36",
    name: "SF-36 — Qualidade de Vida",
    short: "SF-36",
    description: "36 itens, 8 domínios de qualidade de vida (em breve).",
    indication:
      "Avaliação genérica e abrangente de qualidade de vida em saúde — útil em estudos longitudinais e em pacientes com doenças crônicas complexas.",
  },
  {
    id: "pcs",
    name: "PCS — Catastrofização da Dor",
    short: "PCS",
    description: "13 itens · ruminação, magnificação e desesperança (0–52).",
    indication:
      "Indicado em dor crônica para identificar pensamentos catastróficos que prolongam o quadro. Escores ≥ 30 sugerem necessidade de abordagem cognitivo-comportamental associada.",
  },
  {
    id: "spadi",
    name: "SPADI — Dor e Função do Ombro",
    short: "SPADI",
    description: "Dor + função do ombro, 0–100 (em breve).",
    indication:
      "Específico para disfunções do ombro (tendinopatias, capsulite, pós-operatório). Acompanha dor e limitação funcional em paralelo.",
  },
  {
    id: "ndi",
    name: "NDI — Incapacidade Cervical",
    short: "NDI",
    description: "10 seções · incapacidade por cervicalgia (0–100%).",
    indication:
      "Padrão-ouro para mensurar incapacidade por cervicalgia mecânica, whiplash e radiculopatia cervical. Útil para monitorar resposta à terapia conservadora.",
  },
  {
    id: "odi",
    name: "Oswestry — Incapacidade Lombar",
    short: "ODI",
    description: "10 seções · incapacidade funcional lombar (0–100%).",
    indication:
      "Referência em lombalgia crônica e pós-cirurgia de coluna. Quantifica o impacto da dor lombar nas atividades de vida diária.",
  },
  {
    id: "tsk",
    name: "TSK-17 — Cinesiofobia",
    short: "TSK",
    description: "17 itens · medo do movimento / fear-avoidance (17–68).",
    indication:
      "Aplique em dor musculoesquelética crônica quando há suspeita de que o medo de se machucar esteja limitando a reabilitação. Escores > 37 indicam cinesiofobia clinicamente significativa.",
  },
  {
    id: "rmdq",
    name: "Roland-Morris — Incapacidade Lombar",
    short: "RMDQ",
    description: "24 itens Sim/Não · incapacidade por dor lombar (0–24).",
    indication:
      "Alternativa mais curta ao Oswestry para lombalgia, especialmente em dor aguda e subaguda. Sensível a melhoras precoces no tratamento.",
  },
  {
    id: "dn4",
    name: "DN4 — Triagem de Dor Neuropática",
    short: "DN4",
    description: "10 itens Sim/Não · ≥ 4 sugere dor neuropática.",
    indication:
      "Ferramenta de triagem: indique quando há suspeita clínica de dor neuropática (queimação, choque, dormência, alodínia). Escore ≥ 4 orienta a investigação e o uso de adjuvantes específicos.",
    clinicianOnly: true,
  },
  {
    id: "hads",
    name: "HADS — Ansiedade e Depressão",
    short: "HADS",
    description: "14 itens · subescalas Ansiedade e Depressão (0–21 cada).",
    indication:
      "Triagem de ansiedade e depressão em pacientes não-psiquiátricos (clínicas de dor, ambulatórios hospitalares). Evita itens somáticos que poderiam confundir com a doença de base.",
  },
  {
    id: "hoos",
    name: "HOOS — Lesão e Osteoartrite do Quadril",
    short: "HOOS",
    description: "40 itens · 5 subescalas do quadril (0–100, 100 = sem problemas).",
    indication:
      "Específico para osteoartrite e lesões do quadril, incluindo pré e pós-artroplastia. Cobre dor, sintomas, função, esporte e qualidade de vida.",
  },
  {
    id: "koos12",
    name: "KOOS-12 — Joelho (versão curta)",
    short: "KOOS-12",
    description: "12 itens · 3 subescalas do joelho (Dor, Função, QV) · 0–100, 100 = sem problemas.",
    indication:
      "Versão curta do KOOS para joelho — osteoartrite, lesões meniscais/ligamentares, pré/pós-artroplastia. Rápido de aplicar e sensível a mudanças longitudinais.",
  },
  {
    id: "fiqr",
    name: "FIQR — Impacto da Fibromialgia (Revisado)",
    short: "FIQR",
    description: "21 itens (0–10) · função, impacto global e sintomas (0–100).",
    indication:
      "Específico para fibromialgia já diagnosticada — acompanha gravidade do impacto e resposta ao tratamento multimodal.",
  },
  {
    id: "pps",
    name: "PPS — Palliative Performance Scale (v2)",
    short: "PPS",
    description: "Escala única 0–100 · desempenho funcional em cuidados paliativos.",
    indication:
      "Indicada em cuidados paliativos para estratificar nível funcional, apoiar prognóstico e definir intensidade dos cuidados.",
  },
  {
    id: "kps",
    name: "Karnofsky — Performance Status",
    short: "KPS",
    description: "Escala única 0–100 · capacidade funcional global.",
    indication:
      "Avaliação global de capacidade funcional, tradicionalmente usada em oncologia para definir elegibilidade a tratamentos e acompanhar evolução.",
  },
  {
    id: "nantes",
    name: "Critérios de Nantes — Neuralgia do Pudendo",
    short: "Nantes",
    description: "Checklist clínico (Labat 2008) · 5 essenciais + complementares + exclusão.",
    indication:
      "Aplique quando houver suspeita de neuralgia do pudendo (dor perineal em sela, agravada ao sentar). Os 5 critérios essenciais devem estar todos presentes para sustentar o diagnóstico.",
    clinicianOnly: true,
  },
  // ---- Aspectos emocionais ----
  {
    id: "phq9",
    name: "PHQ-9 — Sintomas Depressivos",
    short: "PHQ-9",
    description: "9 itens · triagem de depressão nas últimas 2 semanas (0–27).",
    indication:
      "Triagem e acompanhamento de depressão na atenção primária e em clínicas de dor. Escore ≥ 10 sugere depressão clinicamente relevante; item 9 positivo exige avaliação imediata de risco.",
  },
  {
    id: "gad7",
    name: "GAD-7 — Sintomas de Ansiedade",
    short: "GAD-7",
    description: "7 itens · triagem de ansiedade nas últimas 2 semanas (0–21).",
    indication:
      "Triagem de ansiedade generalizada. Complementar ao PHQ-9 no rastreio de comorbidades emocionais que amplificam a percepção de dor. Escore ≥ 10 indica avaliação clínica adicional.",
  },
  // ---- Dor / impacto breve ----
  {
    id: "peg",
    name: "PEG — Dor, Prazer e Atividade Geral",
    short: "PEG",
    description: "3 itens (0–10) · intensidade da dor e interferência no dia a dia.",
    indication:
      "Versão ultra-breve para acompanhamento longitudinal de dor crônica. Útil entre consultas (telemonitoramento) quando se quer um indicador rápido de intensidade e impacto funcional.",
  },
  // ---- Movimento e função ----
  {
    id: "fabq",
    name: "FABQ — Crenças de Medo-Evitação",
    short: "FABQ",
    description: "16 itens · medo de movimento e trabalho (subescalas física e laboral).",
    indication:
      "Indicado em lombalgia e dor musculoesquelética com risco de cronificação ou afastamento do trabalho. Subescalas separadas para atividade física (FABQ-Phys) e trabalho (FABQ-Work) — esta última é o melhor preditor de retorno laboral.",
  },
  {
    id: "promis_pf",
    name: "PROMIS — Função Física (Forma Curta 10a)",
    short: "PROMIS-PF",
    description: "10 itens · capacidade funcional (10–50, ↑ = melhor função).",
    indication:
      "Medida genérica e moderna de função física, comparável entre condições clínicas. Útil para acompanhar evolução funcional em dor crônica, reabilitação e pós-operatório.",
  },
  {
    id: "promis_mobility_hip",
    name: "PROMIS Mobility — Quadril (adaptado)",
    short: "PROMIS-Mob (Quadril)",
    description: "10 itens · mobilidade funcional do quadril (10–50, ↑ = melhor).",
    indication:
      "Adaptação do PROMIS Physical Function focada em mobilidade do quadril — marcha, escadas, levantar da cadeira, agachar, pivotar, calçar sapatos. Útil em coxartrose, pré/pós-artroplastia e reabilitação.",
  },
  // ---- Sono ----
  {
    id: "isi",
    name: "ISI — Índice de Gravidade da Insônia",
    short: "ISI",
    description: "7 itens · gravidade da insônia nas últimas 2 semanas (0–28).",
    indication:
      "Triagem e monitoramento de insônia, frequentemente associada à dor crônica. Escore ≥ 15 indica insônia clínica moderada a grave, com benefício esperado de intervenção específica (higiene do sono, TCC-I, farmacoterapia).",
  },
  // ---- Qualidade de vida ----
  {
    id: "whoqol_bref",
    name: "WHOQOL-BREF — Qualidade de Vida (OMS)",
    short: "WHOQOL-BREF",
    description: "26 itens · 4 domínios (físico, psicológico, social, ambiente).",
    indication:
      "Avaliação genérica de qualidade de vida em saúde — pacientes crônicos, comparação entre populações ou seguimento longitudinal. Vantagem: domínio público e validado no Brasil.",
  },
  // ---- Pediátrico ----
  {
    id: "ppdi",
    name: "PPDI — Incapacidade por Dor (Pediátrico)",
    short: "PPDI",
    description: "12 itens (0–4) · incapacidade por dor em crianças e adolescentes (0–48).",
    indication:
      "Indicado em dor crônica/recorrente na infância e adolescência (cefaleia, dor abdominal funcional, dor musculoesquelética). Acompanha o impacto da dor em escola, brincar, esporte, sono e convívio familiar.",
  },
];

/**
 * Catálogo exibido nos seletores: liberados primeiro, depois os
 * "Em construção" (hidden), preservando a ordem de declaração em cada grupo.
 */
export const QUESTIONNAIRES: QuestionnaireMeta[] = [
  ...QUESTIONNAIRES_RAW.filter((q) => !q.hidden),
  ...QUESTIONNAIRES_RAW.filter((q) => q.hidden),
];

export function getQuestionnaire(id: string): QuestionnaireMeta | undefined {
  return QUESTIONNAIRES.find((q) => q.id === id);
}


export function interpretEva(score: number): string {
  if (score <= 0) return "Sem dor";
  if (score <= 3) return "Dor leve";
  if (score <= 6) return "Dor moderada";
  return "Dor intensa";
}
