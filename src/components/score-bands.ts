/**
 * Faixas interpretativas (Band[]) reutilizadas pelas réguas dos questionários.
 * Centralizadas aqui para manter coerência clínica e facilitar ajustes.
 */
import type { Band } from "@/components/score-ruler";

// ---------- Incapacidade percentual (NDI, ODI) ----------
export const NDI_BANDS: Band[] = [
  { from: 0, to: 9, label: "Sem incapacidade", tone: "good", tip: "Cervical não está limitando atividades — manter exercícios e postura." },
  { from: 10, to: 28, label: "Leve", tone: "watch", tip: "Limitação leve — bom momento para reforçar postura, exercícios e ergonomia." },
  { from: 29, to: 49, label: "Moderada", tone: "moderate", tip: "Limitação moderada — fisioterapia ativa e controle de fatores agravantes." },
  { from: 50, to: 71, label: "Severa", tone: "alert", tip: "Cervical limita o cotidiano — avaliar dor, função e necessidade de abordagem multimodal." },
  { from: 72, to: 100, label: "Completa", tone: "critical", tip: "Incapacidade cervical completa — investigação ampliada e abordagem intensiva." },
];

export const ODI_BANDS: Band[] = [
  { from: 0, to: 20, label: "Mínima", tone: "good", tip: "Lombar permite vida normal — manter atividade física e bons hábitos posturais." },
  { from: 21, to: 40, label: "Moderada", tone: "watch", tip: "Dor lombar gera algum desconforto em sentar, caminhar e levantar peso — fisioterapia conservadora é o caminho." },
  { from: 41, to: 60, label: "Severa", tone: "moderate", tip: "Dor é a principal queixa — limita trabalho, sono e vida social. Tratamento ativo e multimodal." },
  { from: 61, to: 80, label: "Aleijante", tone: "alert", tip: "A dor lombar invade todos os aspectos da vida — abordagem intensiva, investigação cuidadosa." },
  { from: 81, to: 100, label: "Confinado", tone: "critical", tip: "Pacientes acamados ou com sintomas exagerados — investigação aprofundada." },
];

// ---------- SPADI (0–100, menor = melhor) ----------
export const SPADI_BANDS: Band[] = [
  { from: 0, to: 19, label: "Mínimo", tone: "good", tip: "Ombro funcionando bem — manter mobilidade e fortalecimento." },
  { from: 20, to: 39, label: "Leve", tone: "watch", tip: "Limitação leve — fisioterapia ativa costuma resolver." },
  { from: 40, to: 69, label: "Moderado", tone: "moderate", tip: "Ombro restringindo gestos diários — tratamento ativo, controle de dor e progressão de carga." },
  { from: 70, to: 100, label: "Grave", tone: "critical", tip: "Comprometimento grave — investigar causa estrutural e considerar abordagem multidisciplinar." },
];

// ---------- RMDQ (0–24, menor = melhor) ----------
export const RMDQ_BANDS: Band[] = [
  { from: 0, to: 6, label: "Leve", tone: "good", tip: "Lombar pouco limita as atividades cotidianas — manter movimento." },
  { from: 7, to: 13, label: "Moderada", tone: "moderate", tip: "Lombar atrapalha tarefas comuns — fisioterapia ativa e controle de dor." },
  { from: 14, to: 24, label: "Grave", tone: "critical", tip: "Lombar impacta grande parte do dia — abordagem multimodal e revisão clínica." },
];

// ---------- DN4 (0–10) ----------
export const DN4_BANDS: Band[] = [
  { from: 0, to: 3, label: "Improvável", tone: "good", tip: "Sem perfil neuropático claro — manter abordagem convencional." },
  { from: 4, to: 10, label: "Provável neuropática", tone: "alert", tip: "Quadro com características neuropáticas — considerar adjuvantes específicos (gabapentinoides, duais) e investigar nervo envolvido." },
];

// ---------- HADS por subescala (0–21) ----------
export const HADS_BANDS: Band[] = [
  { from: 0, to: 7, label: "Improvável", tone: "good", tip: "Sem sinais relevantes — manter observação." },
  { from: 8, to: 10, label: "Possível", tone: "watch", tip: "Sintomas presentes mas leves — reavaliar em seguimento e considerar suporte." },
  { from: 11, to: 21, label: "Provável", tone: "alert", tip: "Pontuação sugestiva — encaminhamento para avaliação especializada e estratégia ativa." },
];

// ---------- HOOS / KOOS (0–100, maior = melhor) ----------
export const HOOS_BANDS: Band[] = [
  { from: 0, to: 39, label: "Grave", tone: "critical", tip: "Função e/ou dor importantes — tratamento ativo e revisão de plano (medicação, reabilitação, eventualmente cirúrgico)." },
  { from: 40, to: 69, label: "Moderado", tone: "moderate", tip: "Quadro intermediário — reabilitação ativa e progressão de carga." },
  { from: 70, to: 100, label: "Preservada", tone: "good", tip: "Função preservada — manter exercícios e prevenção." },
];

// ---------- FIQR (0–100, menor = melhor) ----------
export const FIQR_BANDS: Band[] = [
  { from: 0, to: 42, label: "Leve", tone: "good", tip: "Impacto leve da fibromialgia — manter exercício aeróbico, sono e abordagem multimodal." },
  { from: 43, to: 59, label: "Moderado", tone: "moderate", tip: "Impacto moderado — reforçar exercício, regulação emocional, sono e farmacoterapia adjuvante." },
  { from: 60, to: 100, label: "Grave", tone: "critical", tip: "Impacto grave — abordagem multidisciplinar intensiva (reumato, dor, psicologia, exercício)." },
];

// ---------- PPS / KPS (0–100, maior = melhor) ----------
export const PPS_BANDS: Band[] = [
  { from: 0, to: 20, label: "Fase terminal", tone: "critical", tip: "Cuidados totais, ingesta mínima — foco em conforto, sintoma, dignidade." },
  { from: 21, to: 40, label: "Declínio importante", tone: "alert", tip: "Paciente acamado, cuidados quase totais — planejamento avançado de cuidados." },
  { from: 41, to: 60, label: "Transição", tone: "moderate", tip: "Necessita assistência crescente — adaptar ambiente e revisar metas de tratamento." },
  { from: 61, to: 80, label: "Reduzida", tone: "watch", tip: "Funcionalidade reduzida — manter autonomia possível, prevenir declínio." },
  { from: 81, to: 100, label: "Preservada", tone: "good", tip: "Funcionalidade preservada — seguir plano atual." },
];

export const KPS_BANDS: Band[] = [
  { from: 0, to: 30, label: "Grave", tone: "critical", tip: "Incapaz de cuidar de si — cuidados hospitalares/institucionais." },
  { from: 31, to: 50, label: "Limitada", tone: "alert", tip: "Necessita assistência considerável e cuidados médicos frequentes." },
  { from: 51, to: 70, label: "Parcial", tone: "moderate", tip: "Em casa, cuida da maioria das necessidades, mas incapaz de trabalhar." },
  { from: 71, to: 89, label: "Quase normal", tone: "watch", tip: "Atividade normal com algum esforço ou sintomas." },
  { from: 90, to: 100, label: "Normal", tone: "good", tip: "Atividade normal sem queixas significativas." },
];

// ---------- ISI (0–28) ----------
export const ISI_BANDS: Band[] = [
  { from: 0, to: 7, label: "Sem insônia", tone: "good", tip: "Sono dentro do esperado — manter higiene do sono." },
  { from: 8, to: 14, label: "Subclínica", tone: "watch", tip: "Sintomas iniciais — reforçar higiene do sono e fatores comportamentais antes de medicar." },
  { from: 15, to: 21, label: "Moderada", tone: "alert", tip: "Insônia clínica — TCC-I, ajustes ambientais e considerar farmacoterapia." },
  { from: 22, to: 28, label: "Grave", tone: "critical", tip: "Insônia clínica grave — avaliação especializada e tratamento ativo." },
];

// ---------- WHOQOL-BREF (0–100, maior = melhor) ----------
export const WHOQOL_BANDS: Band[] = [
  { from: 0, to: 39, label: "Ruim", tone: "critical", tip: "Qualidade de vida ruim — investigar fatores físicos, emocionais e sociais determinantes." },
  { from: 40, to: 59, label: "Regular", tone: "moderate", tip: "Qualidade de vida regular — identificar domínios mais baixos para intervir." },
  { from: 60, to: 79, label: "Boa", tone: "good", tip: "Qualidade de vida boa — manter os recursos identificados." },
  { from: 80, to: 100, label: "Muito boa", tone: "good", tip: "Qualidade de vida muito boa." },
];

// ---------- PPDI (0–48, menor = melhor) — incapacidade pediátrica por dor ----------
export const PPDI_BANDS: Band[] = [
  { from: 0, to: 12, label: "Leve", tone: "good", tip: "Dor pouco interfere no dia a dia — manter rotina de escola, brincar e sono. Reforçar hábitos saudáveis e movimento." },
  { from: 13, to: 24, label: "Moderada", tone: "moderate", tip: "Dor atrapalha parte das atividades — abordagem ativa: reabilitação, regulação emocional, sono e envolvimento da família." },
  { from: 25, to: 36, label: "Severa", tone: "alert", tip: "Dor compromete escola, lazer e convívio — abordagem multidisciplinar (dor, psicologia, fisioterapia, escola)." },
  { from: 37, to: 48, label: "Incapacitante", tone: "critical", tip: "Dor incapacitante — risco de absenteísmo escolar e isolamento. Plano intensivo e reavaliação clínica detalhada." },
];
