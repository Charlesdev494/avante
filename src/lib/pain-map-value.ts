/**
 * Formato e helpers do valor do Mapa da Dor.
 *
 * Fica fora de `pain-map.tsx` porque aquele arquivo exporta um componente: mistura
 * de componente com função quebra o fast refresh do Vite (regra
 * react-refresh/only-export-components).
 */

export type Sex = "female" | "male";

export type PainMapValue = {
  /**
   * Todas as vistas são opcionais: só as que o paciente realmente pintou entram
   * no objeto. Guardar as 16 sempre significava ~72% de PNG em branco em cada
   * registro, multiplicado por dia de acompanhamento e por paciente.
   */
  front?: string;
  back?: string;
  hands?: string;
  handsBack?: string;
  face?: string;
  faceProfile?: string;
  faceProfileR?: string;
  faceBack?: string;
  footTop?: string;
  footLateral?: string;
  footPlantar?: string;
  footTopL?: string;
  footLateralL?: string;
  footPlantarL?: string;
  pelvis?: string;
  pelvisGlute?: string;
  /**
   * Sexo das vistas anatômicas sobre as quais este mapa foi pintado.
   *
   * Fica gravado junto com a pintura, e não só na ficha do paciente, porque a
   * evolução precisa mostrar o desenho que o paciente realmente viu. Se dependesse
   * só da ficha, corrigir o cadastro depois passaria a exibir as marcas antigas
   * sobre outra anatomia.
   *
   * Opcional: mapa respondido antes deste campo existir não tem o valor.
   */
  sex?: Sex;
};

/** Chaves de `PainMapValue` que guardam pintura. `sex` é metadado, não desenho. */
export const CANVAS_KEYS = [
  "front",
  "back",
  "hands",
  "handsBack",
  "face",
  "faceProfile",
  "faceProfileR",
  "faceBack",
  "footTop",
  "footLateral",
  "footPlantar",
  "footTopL",
  "footLateralL",
  "footPlantarL",
  "pelvis",
  "pelvisGlute",
] as const;

/** Só as chaves de desenho — exclui `sex`, que não é canvas. */
export type CanvasKey = (typeof CANVAS_KEYS)[number];

/**
 * Diz se o paciente pintou alguma coisa.
 *
 * Existe porque quem chama não pode varrer `Object.values`: desde que `sex` entrou
 * no objeto, há uma string sempre preenchida ali, e um mapa em branco passaria a
 * contar como respondido.
 */
export function painMapHasContent(v?: PainMapValue | null): boolean {
  if (!v) return false;
  return CANVAS_KEYS.some((k) => typeof v[k] === "string" && (v[k] as string).length > 0);
}

/**
 * Estreita o que vem do banco para `Sex`.
 *
 * A coluna é `text` com check constraint, então o tipo gerado é `string`. Em vez de
 * dar cast, valida: valor inesperado vira null e cai no fallback, em lugar de
 * circular como um `Sex` que não existe.
 */
export function toSex(v: unknown): Sex | null {
  return v === "female" || v === "male" ? v : null;
}
