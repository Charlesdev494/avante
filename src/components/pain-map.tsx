import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eraser, RotateCcw } from "lucide-react";
import type { CanvasKey, PainMapValue, Sex } from "@/lib/pain-map-value";
import maoPalmaImg from "@/assets/mapa/mao-palma.png";
import maoDorsoImg from "@/assets/mapa/mao-dorso.png";
import rostoFrontalImg from "@/assets/mapa/rosto-frontal.png";
import rostoPerfilImg from "@/assets/mapa/rosto-perfil.png";
import cabecaPosteriorImg from "@/assets/mapa/cabeca-posterior.png";
import peSuperiorImg from "@/assets/mapa/pe-superior.png";
import peLateralImg from "@/assets/mapa/pe-lateral.png";
import pePlantarImg from "@/assets/mapa/pe-plantar.png";
import corpoFrenteMascImg from "@/assets/mapa/corpo-frente-m.png";
import corpoCostasMascImg from "@/assets/mapa/corpo-costas-m.png";
import corpoFrenteFemImg from "@/assets/mapa/corpo-frente-f.png";
import corpoCostasFemImg from "@/assets/mapa/corpo-costas-f.png";
import gluteaImg from "@/assets/mapa/glutea.png";
import pelvisFemImg from "@/assets/mapa/pelvis-f.png";

/**
 * Mapa da Dor — paciente pinta áreas doloridas.
 * Abas: Corpo, Mãos (palma e dorso), Rosto (frontal/perfil/posterior),
 * Pés (superior/lateral/plantar), Pélvis (M/F litotomia).
 */

const W = 280;
const H = 640;
const HW = 520;
const HH = 420;
const FW = 300;
const FH = 340;
const FTW = 260;
const FTH = 320;
const PW = 360;
const PH = 440;

interface Props {
  value?: PainMapValue | null;
  onChange?: (v: PainMapValue) => void;
  readOnly?: boolean;
  /** Sexo biológico da ficha do paciente; define o padrão das vistas anatômicas. */
  sex?: Sex;
}

type View = "body" | "hands" | "face" | "feet" | "pelvis";

/** Renders 3D do corpo, um par de vistas por sexo. */
const BODY_IMAGES: Record<Sex, { front: string; back: string }> = {
  male: { front: corpoFrenteMascImg, back: corpoCostasMascImg },
  female: { front: corpoFrenteFemImg, back: corpoCostasFemImg },
};

function BodyFigure({ sex, back }: { sex: Sex; back?: boolean }) {
  const img = BODY_IMAGES[sex];
  return (
    <FigureImage
      src={back ? img.back : img.front}
      alt={`Corpo inteiro, vista ${back ? "posterior" : "anterior"}`}
    />
  );
}

const PALETTE: { color: string; label: string }[] = [
  { color: "#fde047", label: "Amarelo — formigamento" },
  { color: "#fb923c", label: "Laranja — leve" },
  { color: "#ef4444", label: "Vermelho — moderada" },
  { color: "#7f1d1d", label: "Bordô — intensa" },
  { color: "#1e3a8a", label: "Azul — queimação/fria" },
  { color: "#000000", label: "Preto — pior dor" },
];

export function PainMap({ value, onChange, readOnly, sex: sexFromPatient }: Props) {
  const frontRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<HTMLCanvasElement>(null);
  const handsBackRef = useRef<HTMLCanvasElement>(null);
  const faceRef = useRef<HTMLCanvasElement>(null);
  const faceProfileRef = useRef<HTMLCanvasElement>(null);
  const faceBackRef = useRef<HTMLCanvasElement>(null);
  const footTopRef = useRef<HTMLCanvasElement>(null);
  const footLateralRef = useRef<HTMLCanvasElement>(null);
  const footPlantarRef = useRef<HTMLCanvasElement>(null);
  const footTopLRef = useRef<HTMLCanvasElement>(null);
  const footLateralLRef = useRef<HTMLCanvasElement>(null);
  const footPlantarLRef = useRef<HTMLCanvasElement>(null);
  const faceProfileRRef = useRef<HTMLCanvasElement>(null);
  const pelvisRef = useRef<HTMLCanvasElement>(null);
  const pelvisGluteRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState<string>(PALETTE[2].color);
  const [erasing, setErasing] = useState(false);
  const [view, setView] = useState<View>("body");
  const drawing = useRef<HTMLCanvasElement | null>(null);

  /**
   * Precedência do sexo das vistas: o que ficou gravado no mapa manda, porque a
   * evolução tem de reproduzir o desenho que o paciente viu. Só depois vem a
   * ficha do paciente e, por fim, o override manual do médico nesta tela.
   */
  const [sexOverride, setSexOverride] = useState<Sex | null>(null);
  const sex: Sex = sexOverride ?? value?.sex ?? sexFromPatient ?? "female";

  // Trocar de paciente tem de zerar o override, senão ele vaza para o próximo.
  useEffect(() => {
    setSexOverride(null);
  }, [sexFromPatient]);

  /**
   * Cada canvas do mapa com a chave em que é salvo e suas dimensões. A lista
   * existe para restaurar, salvar e limpar percorrendo um lugar só, em vez de
   * repetir as 16 linhas três vezes.
   */
  const canvases: [CanvasKey, React.RefObject<HTMLCanvasElement | null>, number, number][] = [
    ["front", frontRef, W, H],
    ["back", backRef, W, H],
    ["hands", handsRef, HW, HH],
    ["handsBack", handsBackRef, HW, HH],
    ["face", faceRef, FW, FH],
    ["faceProfile", faceProfileRef, FW, FH],
    ["faceProfileR", faceProfileRRef, FW, FH],
    ["faceBack", faceBackRef, FW, FH],
    ["footTop", footTopRef, FTW, FTH],
    ["footLateral", footLateralRef, FTW, FTH],
    ["footPlantar", footPlantarRef, FTW, FTH],
    ["footTopL", footTopLRef, FTW, FTH],
    ["footLateralL", footLateralLRef, FTW, FTH],
    ["footPlantarL", footPlantarLRef, FTW, FTH],
    ["pelvis", pelvisRef, PW, PH],
    ["pelvisGlute", pelvisGluteRef, PW, PH],
  ];

  /**
   * Quais vistas têm pintura de fato.
   *
   * Antes o mapa salvava os 16 canvas sempre, e um paciente que marcasse uma única
   * região gravava ~114 KB, dos quais ~72% eram PNG de canvas vazio — repetido a
   * cada dia de acompanhamento, para sempre.
   *
   * O conjunto é alimentado por dois caminhos, e depender de só um perderia dado:
   * o que o paciente pinta agora, e o que veio restaurado de `value`. Sem o
   * segundo, reabrir um mapa e salvar de novo apagaria o que já estava lá.
   */
  const painted = useRef<Set<CanvasKey>>(new Set());

  const markPainted = (canvas: HTMLCanvasElement) => {
    const hit = canvases.find(([, ref]) => ref.current === canvas);
    if (hit) painted.current.add(hit[0]);
  };

  useEffect(() => {
    for (const [key, ref, w, h] of canvases) {
      const canvas = ref.current;
      if (!canvas) continue;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);

      const url = value?.[key];
      if (typeof url === "string" && url.length > 0) {
        painted.current.add(key);
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, w, h);
        img.src = url;
      } else {
        painted.current.delete(key);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // `sexValue` explícito porque trocar o sexo precisa gravar o valor novo na hora:
  // setState é assíncrono, e `sex` aqui ainda seria o anterior.
  const emit = (sexValue: Sex = sex) => {
    if (!onChange) return;
    const out: PainMapValue = {
      // grava sobre qual anatomia foi pintado, para a evolução reproduzir igual
      sex: sexValue,
    };
    for (const [key, ref] of canvases) {
      if (!painted.current.has(key)) continue;
      const url = ref.current?.toDataURL("image/png");
      if (url) out[key] = url;
    }
    onChange(out);
  };

  const getPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const paintAt = (canvas: HTMLCanvasElement, x: number, y: number) => {
    const ctx = canvas.getContext("2d")!;
    if (erasing) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.75;
    }
    const r = erasing ? 14 : 5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const paintStroke = (canvas: HTMLCanvasElement, x: number, y: number) => {
    // Apagar também conta como mexer: se o canvas já tinha pintura, ele continua
    // no conjunto; se estava vazio, marcar aqui custa um PNG vazio e evita
    // depender de varrer pixel para decidir.
    markPainted(canvas);
    const ctx = canvas.getContext("2d")!;
    const prev = lastPos.current;
    if (prev) {
      const dx = x - prev.x;
      const dy = y - prev.y;
      const dist = Math.hypot(dx, dy);
      ctx.save();
      ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
      ctx.strokeStyle = erasing ? "rgba(0,0,0,1)" : color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = erasing ? 22 : 8;
      ctx.globalAlpha = erasing ? 1 : 0.75;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();

      const step = erasing ? 6 : 3;
      const steps = Math.max(1, Math.ceil(dist / step));
      for (let i = 1; i <= steps; i++) {
        paintAt(canvas, prev.x + (dx * i) / steps, prev.y + (dy * i) / steps);
      }
    } else {
      paintAt(canvas, x, y);
    }
    lastPos.current = { x, y };
  };

  const onDown = (canvas: HTMLCanvasElement, e: React.PointerEvent<HTMLDivElement>) => {
    if (readOnly) return;
    e.preventDefault();
    drawing.current = canvas;
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPos.current = null;
    const { x, y } = getPos(canvas, e.clientX, e.clientY);
    paintStroke(canvas, x, y);
  };
  const onMove = (canvas: HTMLCanvasElement, e: React.PointerEvent<HTMLDivElement>) => {
    if (readOnly || drawing.current !== canvas) return;
    e.preventDefault();
    const nativePoints =
      typeof e.nativeEvent.getCoalescedEvents === "function"
        ? e.nativeEvent.getCoalescedEvents()
        : [e.nativeEvent];

    nativePoints.forEach((point) => {
      const { x, y } = getPos(canvas, point.clientX, point.clientY);
      paintStroke(canvas, x, y);
    });
  };

  const onUp = () => {
    if (drawing.current) {
      drawing.current = null;
      lastPos.current = null;
      emit();
    }
  };

  const clearAll = () => {
    for (const [, ref, w, h] of canvases) {
      ref.current?.getContext("2d")!.clearRect(0, 0, w, h);
    }
    // "Limpar tudo" é o reset explícito: zera o conjunto para o mapa voltar a
    // não gravar vista nenhuma.
    painted.current.clear();
    emit();
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="text-xs font-medium text-muted-foreground">
            Escolha a cor que melhor representa sua dor e pinte sobre o desenho:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PALETTE.map((p) => (
              <button
                key={p.color}
                type="button"
                onClick={() => {
                  setColor(p.color);
                  setErasing(false);
                }}
                title={p.label}
                aria-label={p.label}
                className={`h-9 w-9 rounded-full border-2 transition ${
                  !erasing && color === p.color
                    ? "border-foreground scale-110 ring-2 ring-offset-2 ring-foreground/40"
                    : "border-white shadow"
                }`}
                style={{ backgroundColor: p.color }}
              />
            ))}
            <Button
              type="button"
              size="sm"
              variant={erasing ? "default" : "outline"}
              onClick={() => setErasing(true)}
            >
              <Eraser className="mr-1 h-4 w-4" /> Apagar
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
              <RotateCcw className="mr-1 h-4 w-4" /> Limpar tudo
            </Button>
          </div>
        </div>
      )}

      <Tabs value={view} onValueChange={(v) => setView(v as View)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="body">Corpo</TabsTrigger>
          <TabsTrigger value="hands">Mãos</TabsTrigger>
          <TabsTrigger value="face">Rosto</TabsTrigger>
          <TabsTrigger value="feet">Pés</TabsTrigger>
          <TabsTrigger value="pelvis">Pélvis</TabsTrigger>
        </TabsList>

        <TabsContent value="body" forceMount className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-2 gap-4">
            <Panel
              label="FRENTE"
              w={W}
              h={H}
              canvasRef={frontRef}
              onDown={onDown}
              onMove={onMove}
              onUp={onUp}
              showScrollRail={!readOnly}
            >
              <BodyFigure sex={sex} />
            </Panel>
            <Panel
              label="COSTAS"
              w={W}
              h={H}
              canvasRef={backRef}
              onDown={onDown}
              onMove={onMove}
              onUp={onUp}
              showScrollRail={!readOnly}
            >
              <BodyFigure sex={sex} back />
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="hands" forceMount className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel
              label="MÃOS — PALMA (ABERTAS)"
              w={HW}
              h={HH}
              canvasRef={handsRef}
              onDown={onDown}
              onMove={onMove}
              onUp={onUp}
              showScrollRail={!readOnly}
            >
              <HandsSilhouette side="palm" />
            </Panel>
            <Panel
              label="MÃOS — DORSO"
              w={HW}
              h={HH}
              canvasRef={handsBackRef}
              onDown={onDown}
              onMove={onMove}
              onUp={onUp}
              showScrollRail={!readOnly}
            >
              <HandsSilhouette side="dorsal" />
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="face" forceMount className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Panel
              label="ROSTO — FRONTAL"
              w={FW}
              h={FH}
              canvasRef={faceRef}
              onDown={onDown}
              onMove={onMove}
              onUp={onUp}
              showScrollRail={!readOnly}
            >
              <FaceFront />
            </Panel>
            <Panel
              label="ROSTO — PERFIL ESQ."
              w={FW}
              h={FH}
              canvasRef={faceProfileRef}
              onDown={onDown}
              onMove={onMove}
              onUp={onUp}
              showScrollRail={!readOnly}
            >
              <FaceProfile />
            </Panel>
            <Panel
              label="ROSTO — PERFIL DIR."
              w={FW}
              h={FH}
              canvasRef={faceProfileRRef}
              onDown={onDown}
              onMove={onMove}
              onUp={onUp}
              showScrollRail={!readOnly}
              mirror
            >
              <FaceProfile />
            </Panel>
            <Panel
              label="CABEÇA — POSTERIOR"
              w={FW}
              h={FH}
              canvasRef={faceBackRef}
              onDown={onDown}
              onMove={onMove}
              onUp={onUp}
              showScrollRail={!readOnly}
            >
              <FaceBack />
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="feet" forceMount className="data-[state=inactive]:hidden">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Panel
                label="PÉ DIR. — SUPERIOR"
                w={FTW}
                h={FTH}
                canvasRef={footTopRef}
                onDown={onDown}
                onMove={onMove}
                onUp={onUp}
                showScrollRail={!readOnly}
              >
                <FootTop />
              </Panel>
              <Panel
                label="PÉ DIR. — LATERAL"
                w={FTW}
                h={FTH}
                canvasRef={footLateralRef}
                onDown={onDown}
                onMove={onMove}
                onUp={onUp}
                showScrollRail={!readOnly}
              >
                <FootLateral />
              </Panel>
              <Panel
                label="PÉ DIR. — PLANTAR"
                w={FTW}
                h={FTH}
                canvasRef={footPlantarRef}
                onDown={onDown}
                onMove={onMove}
                onUp={onUp}
                showScrollRail={!readOnly}
              >
                <FootPlantar />
              </Panel>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Panel
                label="PÉ ESQ. — SUPERIOR"
                w={FTW}
                h={FTH}
                canvasRef={footTopLRef}
                onDown={onDown}
                onMove={onMove}
                onUp={onUp}
                showScrollRail={!readOnly}
                mirror
              >
                <FootTop />
              </Panel>
              <Panel
                label="PÉ ESQ. — LATERAL"
                w={FTW}
                h={FTH}
                canvasRef={footLateralLRef}
                onDown={onDown}
                onMove={onMove}
                onUp={onUp}
                showScrollRail={!readOnly}
                mirror
              >
                <FootLateral />
              </Panel>
              <Panel
                label="PÉ ESQ. — PLANTAR"
                w={FTW}
                h={FTH}
                canvasRef={footPlantarLRef}
                onDown={onDown}
                onMove={onMove}
                onUp={onUp}
                showScrollRail={!readOnly}
                mirror
              >
                <FootPlantar />
              </Panel>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pelvis" forceMount className="data-[state=inactive]:hidden">
          {!readOnly && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Sexo:</span>
              <Button
                type="button"
                size="sm"
                variant={sex === "female" ? "default" : "outline"}
                onClick={() => {
                  setSexOverride("female");
                  emit("female");
                }}
              >
                Feminino
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sex === "male" ? "default" : "outline"}
                onClick={() => {
                  setSexOverride("male");
                  emit("male");
                }}
              >
                Masculino
              </Button>
              {!sexFromPatient && (
                <span className="text-xs text-amber-700">
                  Sexo biológico não informado na ficha do paciente.
                </span>
              )}
              {sexOverride && sexFromPatient && sexOverride !== sexFromPatient && (
                <span className="text-xs text-amber-700">
                  Diferente da ficha ({sexFromPatient === "female" ? "feminino" : "masculino"}).
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel
              label={`POSIÇÃO GINECOLÓGICA — ${sex === "female" ? "FEMININO" : "MASCULINO"}`}
              w={PW}
              h={PH}
              canvasRef={pelvisRef}
              onDown={onDown}
              onMove={onMove}
              onUp={onUp}
              showScrollRail={!readOnly}
            >
              <PelvisSilhouette sex={sex} />
            </Panel>
            <Panel
              label="REGIÃO GLÚTEA — PREGA GLÚTEA"
              w={PW}
              h={PH}
              canvasRef={pelvisGluteRef}
              onDown={onDown}
              onMove={onMove}
              onUp={onUp}
              showScrollRail={!readOnly}
            >
              <GluteSilhouette />
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Panel({
  label,
  w,
  h,
  canvasRef,
  onDown,
  onMove,
  onUp,
  children,
  mirror,
  showScrollRail,
}: {
  label: string;
  w: number;
  h: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onDown: (canvas: HTMLCanvasElement, e: React.PointerEvent<HTMLDivElement>) => void;
  onMove: (canvas: HTMLCanvasElement, e: React.PointerEvent<HTMLDivElement>) => void;
  onUp: () => void;
  children: React.ReactNode;
  mirror?: boolean;
  showScrollRail?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-white p-2">
      <div
        className="mx-auto flex items-stretch gap-2"
        style={{ maxWidth: w + (showScrollRail ? 36 : 0) }}
      >
        <div
          className="relative flex-1"
          style={{ aspectRatio: `${w}/${h}`, maxWidth: w, touchAction: "none" }}
          onPointerDown={(e) => {
            const c = canvasRef.current;
            if (c) onDown(c, e);
          }}
          onPointerMove={(e) => {
            const c = canvasRef.current;
            if (c) onMove(c, e);
          }}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <div
            className="absolute inset-0"
            style={{
              pointerEvents: "none",
              ...(mirror ? { transform: "scaleX(-1)" } : {}),
            }}
          >
            <div style={{ width: "100%", height: "100%", pointerEvents: "none" }}>{children}</div>
          </div>
          <canvas ref={canvasRef} width={w} height={h} className="absolute inset-0 h-full w-full" />
        </div>
        {showScrollRail ? (
          <div
            aria-label="Área para rolar a página sem desenhar"
            className="flex w-7 shrink-0 select-none items-center justify-center rounded-md border bg-muted/40"
            style={{ touchAction: "pan-y" }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="h-1 w-3 rounded-full bg-border" />
              <span className="h-1 w-3 rounded-full bg-border" />
              <span className="h-1 w-3 rounded-full bg-border" />
              <span className="h-1 w-3 rounded-full bg-border" />
            </div>
          </div>
        ) : null}
      </div>
      {/* espaco inquebravel depois do travessao: sem isso ele fica sozinho numa
          linha quando o painel e estreito (grade de 3 colunas da evolucao) */}
      <div className="mt-2 text-balance text-center text-[11px] font-semibold leading-tight tracking-wide text-muted-foreground">
        {label.replace(/ — /g, " — ")}
      </div>
    </div>
  );
}

/* ---------- Peças compartilhadas dos desenhos ----------
   As vistas de corpo, mãos, rosto, pés e região glútea são imagens (renders 3D).
   A pélvis é a única que continua vetorial, e é só por causa dela que os
   utilitários de curva abaixo ainda existem.
*/

type Pt = [number, number];

/** Traço único para todos os desenhos do mapa — pintura do paciente vem por cima. */
const SKIN_STROKE = "#1E3A5F";

const rd = (v: number) => Math.round(v * 10) / 10;

/** Curva fechada e suave passando por todos os pontos (Catmull-Rom em Bézier). */
function smoothClosedPath(pts: Pt[]): string {
  const n = pts.length;
  const at = (i: number) => pts[(i + n) % n];
  let d = `M ${rd(pts[0][0])} ${rd(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${rd(c1[0])} ${rd(c1[1])}, ${rd(c2[0])} ${rd(c2[1])}, ${rd(p2[0])} ${rd(p2[1])}`;
  }
  return `${d} Z`;
}

/**
 * Espelha a metade direita e fecha o contorno, garantindo simetria exata — algo
 * impossível de manter ajustando os dois lados à mão. Primeiro e último ponto
 * precisam estar sobre o eixo.
 */
function mirroredOutline(half: Pt[], axis: number): string {
  const mirrored: Pt[] = half
    .slice(1, -1)
    .reverse()
    .map(([x, y]) => [2 * axis - x, y]);
  return smoothClosedPath([...half, ...mirrored]);
}

/**
 * Figura vinda de imagem (renders 3D).
 *
 * object-contain, nunca stretch: as imagens não têm a mesma proporção dos canvas,
 * e esticar deformaria a anatomia. Sobra margem, o que é preferível.
 *
 * `flip` espelha para gerar o lado oposto a partir de uma única imagem — assim a
 * mão esquerda e a direita (e os dois pés) ficam simétricas por construção, em vez
 * de depender de dois renders que a IA gera com escalas diferentes.
 */
function FigureImage({ src, alt, flip }: { src: string; alt: string; flip?: boolean }) {
  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full select-none object-contain"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      draggable={false}
      // a pintura acontece no canvas por cima; a imagem não deve capturar ponteiro
      aria-hidden
    />
  );
}

/**
 * Par de mãos num painel: a segunda é a primeira espelhada, para o par sair
 * simétrico em vez de depender de dois renders com escalas diferentes.
 *
 * `flipSlot` diz qual posição recebe o espelho, e ele muda entre os dois painéis.
 * O mapa é auto-visão: a mão esquerda do paciente fica à esquerda da tela. Olhando
 * a própria palma, o polegar da esquerda aponta para dentro; olhando o dorso, ele
 * aponta para fora. Como as duas imagens de origem têm o polegar do mesmo lado, é
 * o espelhamento que precisa diferir — com um valor único, um dos painéis fica com
 * esquerda e direita invertidas.
 */
function PairPanel({ src, alt, flipSlot }: { src: string; alt: string; flipSlot: 0 | 1 }) {
  return (
    <div className="absolute inset-0 flex items-stretch">
      {(["ESQUERDA", "DIREITA"] as const).map((lado, i) => (
        <div key={lado} className="flex flex-1 flex-col px-2">
          {/* a figura e absoluta dentro deste wrapper; o rotulo fica fora dele,
              senao a imagem cobre o texto */}
          <div className="relative flex-1">
            <FigureImage
              src={src}
              alt={`${alt} — mão ${lado.toLowerCase()}`}
              flip={i === flipSlot}
            />
          </div>
          <span
            className="pt-1 text-center text-[10px] leading-tight tracking-wide"
            style={{ color: SKIN_STROKE, opacity: 0.7 }}
          >
            MÃO {lado}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Mãos, rosto e pés: renders 3D ----------
   Essas vistas usam imagem em vez de vetor. Cada painel recebe uma única imagem;
   o lado oposto (mão/pé esquerdo, perfil direito) é a mesma imagem espelhada, para
   o par sair simétrico.

   Corpo e pélvis seguem vetoriais: não existe render gerado para essas vistas.
*/

function HandsSilhouette({ side }: { side: "palm" | "dorsal" }) {
  return (
    <PairPanel
      src={side === "palm" ? maoPalmaImg : maoDorsoImg}
      alt={side === "palm" ? "Mãos, vista palmar" : "Mãos, vista dorsal"}
      flipSlot={side === "palm" ? 0 : 1}
    />
  );
}

function FaceFront() {
  return <FigureImage src={rostoFrontalImg} alt="Rosto, vista frontal" />;
}

function FaceProfile() {
  return <FigureImage src={rostoPerfilImg} alt="Rosto, perfil" />;
}

function FaceBack() {
  return <FigureImage src={cabecaPosteriorImg} alt="Cabeça, vista posterior" />;
}

function FootTop() {
  return <FigureImage src={peSuperiorImg} alt="Pé, vista superior" />;
}

function FootLateral() {
  return <FigureImage src={peLateralImg} alt="Pé, vista lateral" />;
}

function FootPlantar() {
  return <FigureImage src={pePlantarImg} alt="Pé, vista plantar" />;
}

/* ---------- Pelvis / perineum (M & F) — posição de litotomia ----------
   Vista afastada: paciente em decúbito dorsal com coxas abduzidas.
   As duas coxas aparecem como volumes inteiros (do joelho à pelve),
   com espaço ao redor para o paciente pintar pontos de dor na coxa,
   na virilha, no períneo e na genitália.
*/
const PELVIS_AXIS = PW / 2;

/** Coxas abduzidas em litotomia: massa contínua (púbis + coxas + períneo) com o
    V aberto embaixo. A versão anterior eram dois blocos retos que não liam como
    pernas abertas — foi a reclamação do cliente. */
const PELVIS_HALF: Pt[] = [
  [180, 8],
  [230, 12],
  [278, 26],
  [318, 50],
  [345, 84],
  [358, 124],
  [360, 160],
  [360, 300],
  [352, 356],
  [332, 398],
  [304, 424],
  [274, 436],
  [246, 436],
  [230, 412],
  [220, 388],
  [210, 368],
  [198, 354],
  [188, 348],
  [180, 344],
];

/**
 * Render 3D da posição ginecológica, por sexo. Só existe o feminino; o masculino
 * segue no desenho vetorial abaixo até haver um render equivalente.
 *
 * Os rótulos vêm embutidos na imagem (foi assim que o Gemini gerou). Isso
 * significa que trocar um termo exige gerar a figura de novo — anotado como
 * limitação conhecida, não como escolha.
 */
function PelvisSilhouette({ sex }: { sex: Sex }) {
  if (sex === "female") {
    return <FigureImage src={pelvisFemImg} alt="Posição ginecológica, feminino" />;
  }
  return <PelvisVetorial sex={sex} />;
}

function PelvisVetorial({ sex }: { sex: Sex }) {
  const line = SKIN_STROKE;
  const mucosa = "#9a2a3a";
  const skinDeep = "#f0b8b0";
  const cx = PELVIS_AXIS;
  const lead = { stroke: line, strokeWidth: 0.6, fill: "none" as const, opacity: 0.55 };

  return (
    <svg
      viewBox={`0 0 ${PW} ${PH}`}
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="pelvisFill" gradientUnits="userSpaceOnUse" cx={cx} cy="200" r="200">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e6edf5" />
        </radialGradient>
        {/* pelos em tom suave: a mancha escura da versão anterior dominava o painel */}
        <radialGradient id="hairFill" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#c9b7a6" />
          <stop offset="100%" stopColor="#a8917c" />
        </radialGradient>
      </defs>

      {/* corpo: púbis + coxas abertas + períneo */}
      <path
        d={mirroredOutline(PELVIS_HALF, PELVIS_AXIS)}
        fill="url(#pelvisFill)"
        stroke={line}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* pregas inguinais — separam o púbis das coxas */}
      <g fill="none" stroke={line} strokeWidth="1.2" opacity="0.25" strokeLinecap="round">
        <path d="M228 106 Q216 138 212 172" />
        <path d="M132 106 Q144 138 148 172" />
      </g>

      {sex === "female" ? (
        <>
          {/* monte de vênus */}
          <path
            fill="url(#hairFill)"
            stroke="#8a7461"
            strokeWidth="0.8"
            d="M146 84 Q180 70 214 84 C212 112, 202 138, 190 152 Q180 160 170 152 C158 138, 148 112, 146 84 Z"
          />
          {/* grandes lábios */}
          <g stroke={line} strokeWidth="1.4" strokeLinejoin="round">
            <path
              fill={skinDeep}
              d="M152 156 C140 190, 142 226, 162 250 C172 260, 178 258, 180 254 L180 162 C172 152, 158 150, 152 156 Z"
            />
            <path
              fill={skinDeep}
              d="M208 156 C220 190, 218 226, 198 250 C188 260, 182 258, 180 254 L180 162 C188 152, 202 150, 208 156 Z"
            />
          </g>
          {/* pequenos lábios */}
          <g stroke={mucosa} strokeWidth="0.9" strokeLinejoin="round">
            <path
              fill="#c97585"
              d="M166 172 C158 198, 160 226, 174 244 C178 248, 180 248, 180 244 L180 172 Z"
            />
            <path
              fill="#c97585"
              d="M194 172 C202 198, 200 226, 186 244 C182 248, 180 248, 180 244 L180 172 Z"
            />
          </g>
          <ellipse
            cx={cx}
            cy={178}
            rx="5"
            ry="4"
            fill="#d97a85"
            stroke={mucosa}
            strokeWidth="0.8"
          />
          <circle cx={cx} cy={196} r="2.4" fill={mucosa} />
          <ellipse cx={cx} cy={222} rx="9" ry="17" fill="#5a0f1c" stroke={mucosa} strokeWidth="1" />
          <path d={`M${cx} 252 L${cx} 268`} stroke={line} strokeWidth="1.2" opacity="0.5" />
          <g transform={`translate(${cx} 276)`}>
            <ellipse rx="9" ry="6.5" fill="#7a1f33" stroke={line} strokeWidth="0.9" />
            <path
              d="M-6 0 L6 0 M0 -5 L0 5 M-5 -4 L5 4 M-5 4 L5 -4"
              stroke="#4a0f1f"
              strokeWidth="0.7"
              opacity="0.75"
            />
          </g>

          <g fill={line} stroke="none" fontSize="10" fontFamily="sans-serif">
            <g textAnchor="end">
              <path d="M112 108 L150 116" {...lead} />
              <text x={110} y={110}>
                monte de vênus
              </text>
              <path d="M112 178 L172 178" {...lead} />
              <text x={110} y={181}>
                clitóris
              </text>
              <path d="M112 196 L176 196" {...lead} />
              <text x={110} y={199}>
                uretra
              </text>
              <path d="M112 222 L170 222" {...lead} />
              <text x={110} y={225}>
                vagina
              </text>
              <path d="M112 260 L178 260" {...lead} />
              <text x={110} y={263}>
                períneo
              </text>
              <path d="M112 276 L170 276" {...lead} />
              <text x={110} y={279}>
                ânus
              </text>
              <path d="M60 350 L100 340" {...lead} />
              <text x={58} y={352}>
                coxa D
              </text>
            </g>
            <g>
              <path d="M248 160 L210 168" {...lead} />
              <text x={250} y={162}>
                grandes lábios
              </text>
              <path d="M248 210 L196 208" {...lead} />
              <text x={250} y={212}>
                pequenos lábios
              </text>
              <path d="M300 350 L262 340" {...lead} />
              <text x={302} y={352}>
                coxa E
              </text>
            </g>
          </g>
        </>
      ) : (
        <>
          {/* pelos pubianos */}
          <path
            fill="url(#hairFill)"
            stroke="#8a7461"
            strokeWidth="0.8"
            d="M148 80 Q180 66 212 80 C210 106, 202 128, 192 140 Q180 148, 168 140 C158 128, 150 106, 148 80 Z"
          />
          {/* escroto primeiro: nessa vista o pênis repousa SOBRE o escroto.
              Invertido, o escroto cobria a glande e o rótulo apontava para nada. */}
          <path
            fill={skinDeep}
            stroke={line}
            strokeWidth="1.4"
            d="M138 196 C114 222, 112 272, 144 300 C162 309, 176 309, 180 302 C184 309, 198 309, 216 300 C248 272, 246 222, 222 196 C206 214, 190 219, 180 219 C170 219, 154 214, 138 196 Z"
          />
          <path d={`M${cx} 222 L${cx} 302`} stroke={line} strokeWidth="1" opacity="0.4" />
          {/* corpo do pênis + glande, por cima */}
          <path
            fill={skinDeep}
            stroke={line}
            strokeWidth="1.4"
            d="M161 138 C156 172, 158 200, 166 220 C171 228, 189 228, 194 220 C202 200, 204 172, 199 138 C192 132, 168 132, 161 138 Z"
          />
          <path
            d="M162 214 Q180 220 198 214"
            stroke={line}
            strokeWidth="0.9"
            fill="none"
            opacity="0.5"
          />
          <ellipse
            cx={cx}
            cy={238}
            rx="21"
            ry="15"
            fill="#d97a85"
            stroke={mucosa}
            strokeWidth="1.1"
          />
          <path d="M174 240 L186 240" stroke={mucosa} strokeWidth="1.4" strokeLinecap="round" />
          {/* períneo e ânus */}
          <path d={`M${cx} 306 L${cx} 320`} stroke={line} strokeWidth="1.2" opacity="0.5" />
          <g transform={`translate(${cx} 328)`}>
            <ellipse rx="9" ry="6.5" fill="#7a1f33" stroke={line} strokeWidth="0.9" />
            <path
              d="M-6 0 L6 0 M0 -5 L0 5 M-5 -4 L5 4 M-5 4 L5 -4"
              stroke="#4a0f1f"
              strokeWidth="0.7"
              opacity="0.75"
            />
          </g>

          <g fill={line} stroke="none" fontSize="10" fontFamily="sans-serif">
            <g textAnchor="end">
              <path d="M112 104 L152 110" {...lead} />
              <text x={110} y={106}>
                púbis
              </text>
              <path d="M112 176 L159 176" {...lead} />
              <text x={110} y={179}>
                pênis
              </text>
              <path d="M112 238 L159 238" {...lead} />
              <text x={110} y={241}>
                glande
              </text>
              <path d="M112 312 L176 312" {...lead} />
              <text x={110} y={315}>
                períneo
              </text>
              <path d="M112 328 L170 328" {...lead} />
              <text x={110} y={331}>
                ânus
              </text>
              <path d="M60 372 L104 358" {...lead} />
              <text x={58} y={374}>
                coxa D
              </text>
            </g>
            <g>
              <path d="M262 272 L236 268" {...lead} />
              <text x={264} y={274}>
                escroto
              </text>
              <path d="M300 372 L256 358" {...lead} />
              <text x={302} y={374}>
                coxa E
              </text>
            </g>
          </g>
        </>
      )}

      {/* sem legenda no rodapé: o Panel já rotula a vista, e o texto batia no contorno */}
    </svg>
  );
}

/* ---------- Região glútea com a prega glútea ----------
   Vista posterior afastada: cintura, glúteos arredondados, prega glútea marcada
   e coxas posteriores afilando para baixo. Mesmo espelhamento das demais figuras.
*/

function GluteSilhouette() {
  // A glútea é a mesma para os dois sexos: a diferença anatômica ali é pequena
  // e não justifica um render por sexo.
  return <FigureImage src={gluteaImg} alt="Região glútea, vista posterior" />;
}
