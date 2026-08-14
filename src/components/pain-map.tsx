import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eraser, RotateCcw } from "lucide-react";
import gluteBackImg from "@/assets/glute-back.png";

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

export type PainMapValue = {
  front: string;
  back: string;
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
};

interface Props {
  value?: PainMapValue | null;
  onChange?: (v: PainMapValue) => void;
  readOnly?: boolean;
}

type View = "body" | "hands" | "face" | "feet" | "pelvis";
type Sex = "female" | "male";

const PALETTE: { color: string; label: string }[] = [
  { color: "#fde047", label: "Amarelo — formigamento" },
  { color: "#fb923c", label: "Laranja — leve" },
  { color: "#ef4444", label: "Vermelho — moderada" },
  { color: "#7f1d1d", label: "Bordô — intensa" },
  { color: "#1e3a8a", label: "Azul — queimação/fria" },
  { color: "#000000", label: "Preto — pior dor" },
];

export function PainMap({ value, onChange, readOnly }: Props) {
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
  const [sex, setSex] = useState<Sex>("female");
  const drawing = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const restore = (canvas: HTMLCanvasElement | null, url: string | undefined, w: number, h: number) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);
      if (!url) return;
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, w, h);
      img.src = url;
    };
    restore(frontRef.current, value?.front, W, H);
    restore(backRef.current, value?.back, W, H);
    restore(handsRef.current, value?.hands, HW, HH);
    restore(handsBackRef.current, value?.handsBack, HW, HH);
    restore(faceRef.current, value?.face, FW, FH);
    restore(faceProfileRef.current, value?.faceProfile, FW, FH);
    restore(faceBackRef.current, value?.faceBack, FW, FH);
    restore(footTopRef.current, value?.footTop, FTW, FTH);
    restore(footLateralRef.current, value?.footLateral, FTW, FTH);
    restore(footPlantarRef.current, value?.footPlantar, FTW, FTH);
    restore(footTopLRef.current, value?.footTopL, FTW, FTH);
    restore(footLateralLRef.current, value?.footLateralL, FTW, FTH);
    restore(footPlantarLRef.current, value?.footPlantarL, FTW, FTH);
    restore(faceProfileRRef.current, value?.faceProfileR, FW, FH);
    restore(pelvisRef.current, value?.pelvis, PW, PH);
    restore(pelvisGluteRef.current, value?.pelvisGlute, PW, PH);
  }, [value]);

  const emit = () => {
    if (!onChange) return;
    onChange({
      front: frontRef.current?.toDataURL("image/png") ?? "",
      back: backRef.current?.toDataURL("image/png") ?? "",
      hands: handsRef.current?.toDataURL("image/png") ?? "",
      handsBack: handsBackRef.current?.toDataURL("image/png") ?? "",
      face: faceRef.current?.toDataURL("image/png") ?? "",
      faceProfile: faceProfileRef.current?.toDataURL("image/png") ?? "",
      faceBack: faceBackRef.current?.toDataURL("image/png") ?? "",
      footTop: footTopRef.current?.toDataURL("image/png") ?? "",
      footLateral: footLateralRef.current?.toDataURL("image/png") ?? "",
      footPlantar: footPlantarRef.current?.toDataURL("image/png") ?? "",
      footTopL: footTopLRef.current?.toDataURL("image/png") ?? "",
      footLateralL: footLateralLRef.current?.toDataURL("image/png") ?? "",
      footPlantarL: footPlantarLRef.current?.toDataURL("image/png") ?? "",
      faceProfileR: faceProfileRRef.current?.toDataURL("image/png") ?? "",
      pelvis: pelvisRef.current?.toDataURL("image/png") ?? "",
      pelvisGlute: pelvisGluteRef.current?.toDataURL("image/png") ?? "",
    });
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
    const nativePoints = typeof e.nativeEvent.getCoalescedEvents === "function"
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


  const clearCanvas = (c: HTMLCanvasElement | null, w: number, h: number) => {
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, w, h);
  };
  const clearAll = () => {
    clearCanvas(frontRef.current, W, H);
    clearCanvas(backRef.current, W, H);
    clearCanvas(handsRef.current, HW, HH);
    clearCanvas(handsBackRef.current, HW, HH);
    clearCanvas(faceRef.current, FW, FH);
    clearCanvas(faceProfileRef.current, FW, FH);
    clearCanvas(faceProfileRRef.current, FW, FH);
    clearCanvas(faceBackRef.current, FW, FH);
    clearCanvas(footTopRef.current, FTW, FTH);
    clearCanvas(footLateralRef.current, FTW, FTH);
    clearCanvas(footPlantarRef.current, FTW, FTH);
    clearCanvas(footTopLRef.current, FTW, FTH);
    clearCanvas(footLateralLRef.current, FTW, FTH);
    clearCanvas(footPlantarLRef.current, FTW, FTH);
    clearCanvas(pelvisRef.current, PW, PH);
    clearCanvas(pelvisGluteRef.current, PW, PH);
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
            <Panel label="FRENTE" w={W} h={H} canvasRef={frontRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly}>
              <BodySilhouette />
            </Panel>
            <Panel label="COSTAS" w={W} h={H} canvasRef={backRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly}>
              <BodySilhouette back />
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="hands" forceMount className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel label="MÃOS — PALMA (ABERTAS)" w={HW} h={HH} canvasRef={handsRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly}>
              <HandsSilhouette side="palm" />
            </Panel>
            <Panel label="MÃOS — DORSO" w={HW} h={HH} canvasRef={handsBackRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly}>
              <HandsSilhouette side="dorsal" />
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="face" forceMount className="data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Panel label="ROSTO — FRONTAL" w={FW} h={FH} canvasRef={faceRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly}>
              <FaceFront />
            </Panel>
            <Panel label="ROSTO — PERFIL ESQ." w={FW} h={FH} canvasRef={faceProfileRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly}>
              <FaceProfile />
            </Panel>
            <Panel label="ROSTO — PERFIL DIR." w={FW} h={FH} canvasRef={faceProfileRRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly} mirror>
              <FaceProfile />
            </Panel>
            <Panel label="CABEÇA — POSTERIOR" w={FW} h={FH} canvasRef={faceBackRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly}>
              <FaceBack />
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="feet" forceMount className="data-[state=inactive]:hidden">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Panel label="PÉ DIR. — SUPERIOR" w={FTW} h={FTH} canvasRef={footTopRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly}>
                <FootTop />
              </Panel>
              <Panel label="PÉ DIR. — LATERAL" w={FTW} h={FTH} canvasRef={footLateralRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly}>
                <FootLateral />
              </Panel>
              <Panel label="PÉ DIR. — PLANTAR" w={FTW} h={FTH} canvasRef={footPlantarRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly}>
                <FootPlantar />
              </Panel>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Panel label="PÉ ESQ. — SUPERIOR" w={FTW} h={FTH} canvasRef={footTopLRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly} mirror>
                <FootTop />
              </Panel>
              <Panel label="PÉ ESQ. — LATERAL" w={FTW} h={FTH} canvasRef={footLateralLRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly} mirror>
                <FootLateral />
              </Panel>
              <Panel label="PÉ ESQ. — PLANTAR" w={FTW} h={FTH} canvasRef={footPlantarLRef} onDown={onDown} onMove={onMove} onUp={onUp} showScrollRail={!readOnly} mirror>
                <FootPlantar />
              </Panel>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pelvis" forceMount className="data-[state=inactive]:hidden">
          {!readOnly && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Sexo:</span>
              <Button type="button" size="sm" variant={sex === "female" ? "default" : "outline"} onClick={() => setSex("female")}>
                Feminino
              </Button>
              <Button type="button" size="sm" variant={sex === "male" ? "default" : "outline"} onClick={() => setSex("male")}>
                Masculino
              </Button>
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
  label, w, h, canvasRef, onDown, onMove, onUp, children, mirror, showScrollRail,
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
      <div className="mx-auto flex items-stretch gap-2" style={{ maxWidth: w + (showScrollRail ? 36 : 0) }}>
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
            <div style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
              {children}
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={w}
            height={h}
            className="absolute inset-0 h-full w-full"
          />
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
      <div className="mt-2 text-center text-xs font-semibold tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}


/* ---------- Body ---------- */

function BodySilhouette({ back }: { back?: boolean }) {
  const stroke = "#0B2545";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="140" cy="55" rx="30" ry="36" />
        <path d="M126 88 Q140 100 154 88 L156 110 Q140 116 124 110 Z" />
        <path d="M78 122 Q105 110 124 110 Q140 116 156 110 Q175 110 202 122
                 Q216 145 218 175 L210 230 L202 285 Q200 320 196 348
                 L84 348 Q80 320 78 285 L70 230 L62 175 Q64 145 78 122 Z" />
        <path d="M78 122 Q60 145 52 185 Q44 230 42 275 Q40 315 44 345 Q50 365 56 372
                 Q66 372 70 360 Q72 320 78 280 Q86 230 92 195 Q98 165 100 140 Z" />
        <path d="M202 122 Q220 145 228 185 Q236 230 238 275 Q240 315 236 345 Q230 365 224 372
                 Q214 372 210 360 Q208 320 202 280 Q194 230 188 195 Q182 165 180 140 Z" />
        <AnatHand cx={56} cy={372} />
        <AnatHand cx={224} cy={372} flip />

        <path d="M84 348 Q90 380 96 430 L92 530 Q92 580 100 595 L132 595 Q140 580 140 540 L140 380 Z" />
        <path d="M196 348 Q190 380 184 430 L188 530 Q188 580 180 595 L148 595 Q140 580 140 540 L140 380 Z" />
        <path d="M96 595 Q88 612 92 628 Q104 638 122 636 Q130 632 132 615 Q130 600 124 595 Z" />
        <path d="M184 595 Q192 612 188 628 Q176 638 158 636 Q150 632 148 615 Q150 600 156 595 Z" />
        {!back && (
          <g fill="#f8fafc" stroke={stroke} strokeWidth="1">
            <ellipse cx="116" cy="628" rx="3.5" ry="3" />
            <ellipse cx="109" cy="630" rx="2.8" ry="2.6" />
            <ellipse cx="103" cy="631" rx="2.4" ry="2.3" />
            <ellipse cx="98" cy="631" rx="2.1" ry="2" />
            <ellipse cx="94" cy="630" rx="1.8" ry="1.7" />
            <ellipse cx="164" cy="628" rx="3.5" ry="3" />
            <ellipse cx="171" cy="630" rx="2.8" ry="2.6" />
            <ellipse cx="177" cy="631" rx="2.4" ry="2.3" />
            <ellipse cx="182" cy="631" rx="2.1" ry="2" />
            <ellipse cx="186" cy="630" rx="1.8" ry="1.7" />
          </g>
        )}
      </g>
      <g fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round">
        {back ? (
          <>
            <path d="M140 118 L140 348" strokeDasharray="2,3" opacity="0.5" />
            <path d="M100 175 Q140 168 180 175" opacity="0.45" />
            <path d="M95 240 Q140 234 185 240" opacity="0.35" />
            <path d="M100 305 Q140 300 180 305" opacity="0.35" />
            <path d="M105 155 Q120 180 135 175" opacity="0.5" />
            <path d="M175 155 Q160 180 145 175" opacity="0.5" />
            {/* sulco interglúteo + pregas glúteas */}
            <path d="M140 348 L140 430" strokeDasharray="2,3" opacity="0.55" />
            <path d="M96 432 Q118 446 138 438" opacity="0.7" />
            <path d="M184 432 Q162 446 142 438" opacity="0.7" />
          </>

        ) : (
          <>
            <path d="M100 122 Q140 132 180 122" opacity="0.55" />
            <path d="M140 132 L140 220" strokeDasharray="3,4" opacity="0.4" />
            <path d="M105 145 Q125 175 140 180" opacity="0.45" />
            <path d="M175 145 Q155 175 140 180" opacity="0.45" />
            <circle cx="118" cy="172" r="2" opacity="0.55" />
            <circle cx="162" cy="172" r="2" opacity="0.55" />
            <path d="M100 200 Q140 212 180 200" opacity="0.3" />
            <path d="M100 220 Q140 232 180 220" opacity="0.3" />
            <circle cx="140" cy="265" r="2.5" opacity="0.6" />
            <path d="M140 230 L140 330" strokeDasharray="2,4" opacity="0.35" />
            <path d="M92 330 Q140 345 188 330" opacity="0.4" />
            <ellipse cx="118" cy="475" rx="12" ry="7" opacity="0.4" />
            <ellipse cx="162" cy="475" rx="12" ry="7" opacity="0.4" />
          </>
        )}
      </g>
    </svg>
  );
}

function AnatHand({ cx, cy, flip }: { cx: number; cy: number; flip?: boolean }) {
  const dir = flip ? -1 : 1;
  // Mão integrada ao punho: topo do punho em y=0, palma desce até y=24, dedos até y≈50.
  return (
    <g transform={`translate(${cx} ${cy}) scale(${dir} 1)`}>
      {/* punho/palma conectada ao braço (topo aberto, sem linha de corte) */}
      <path d="M-13 0 L13 0 L15 12 Q14 22 12 28 L-12 28 Q-14 22 -15 12 Z" />
      {/* polegar lateral */}
      <path d="M-15 6 Q-24 10 -25 20 Q-22 26 -16 24" />
      {/* dedos */}
      <path d="M-10 28 Q-11 40 -10 50" />
      <path d="M-3 28 Q-4 42 -3 54" />
      <path d="M4 28 Q5 42 4 52" />
      <path d="M11 28 Q12 38 11 46" />
    </g>
  );
}


/* ---------- Hands (open, palm + dorsal) ----------
   View do paciente (espelho): à ESQUERDA da tela = MÃO DIREITA, à DIREITA = MÃO ESQUERDA.
   Polegares ficam mediais (apontando ao centro) na vista DORSAL e laterais na PALMA.
*/

function HandsSilhouette({ side }: { side: "palm" | "dorsal" }) {
  const stroke = "#0B2545";
  const leftX = 130;   // MÃO ESQUERDA do paciente
  const rightX = 390;  // MÃO DIREITA do paciente
  return (
    <svg viewBox={`0 0 ${HW} ${HH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {/* Palma: polegares mediais (apontando ao centro). Dorso: polegares laterais (para fora). */}
        <OpenHand x={leftX} side={side} flip={side === "dorsal"} />
        <OpenHand x={rightX} side={side} flip={side === "palm"} />
      </g>
      <g fill={stroke} stroke="none" fontSize="11">
        <text x={leftX} y={400} textAnchor="middle">MÃO ESQUERDA</text>
        <text x={rightX} y={400} textAnchor="middle">MÃO DIREITA</text>
      </g>
    </svg>
  );
}


function OpenHand({
  x,
  flip,
  side,
}: {
  x: number;
  flip?: boolean;
  side: "palm" | "dorsal";
}) {
  const dir = flip ? -1 : 1;
  const stroke = "#0B2545";
  return (
    <g transform={`translate(${x} 230) scale(${dir} 1)`}>
      <path d="M-30 130 Q-32 155 -26 170 L26 170 Q32 155 30 130 Z" />
      <path
        d="M-50 35 Q-58 90 -44 130 L46 130 Q58 90 50 35
           Q44 5 32 -8 L-32 -8 Q-44 5 -50 35 Z"
      />
      <path
        d="M-50 40 Q-90 55 -100 95 Q-95 120 -75 122 Q-58 112 -48 90 Q-46 70 -48 55 Z"
      />
      <path d="M-32 -8 Q-40 -70 -34 -118 Q-24 -126 -16 -120 Q-12 -65 -12 -8 Z" />
      <path d="M-10 -10 Q-10 -80 -2 -132 Q6 -138 14 -132 Q14 -78 12 -10 Z" />
      <path d="M14 -10 Q16 -72 24 -120 Q32 -126 38 -120 Q34 -65 30 -10 Z" />
      <path d="M32 -8 Q40 -55 50 -90 Q60 -94 62 -86 Q56 -50 52 -8 Z" />

      {side === "palm" ? (
        <g fill="none" stroke={stroke} strokeWidth="1" opacity="0.35">
          <path d="M-36 35 Q-8 55 36 40" />
          <path d="M-34 65 Q0 85 36 70" />
          <path d="M-42 95 Q-20 120 -10 130" />
          <path d="M-28 -2 Q0 8 32 -2" strokeDasharray="2,3" />
        </g>
      ) : (
        <>
          <g fill={stroke} stroke="none" opacity="0.55">
            <circle cx="-22" cy="-5" r="3" />
            <circle cx="-2" cy="-8" r="3.2" />
            <circle cx="22" cy="-7" r="3" />
            <circle cx="42" cy="-3" r="2.8" />
            <rect x="-24" y="-122" width="14" height="10" rx="3" opacity="0.5" />
            <rect x="-6" y="-136" width="14" height="10" rx="3" opacity="0.5" />
            <rect x="20" y="-124" width="14" height="10" rx="3" opacity="0.5" />
            <rect x="42" y="-94" width="12" height="9" rx="3" opacity="0.5" />
            <rect x="-92" y="-2" width="14" height="10" rx="3" opacity="0.5" transform="rotate(-25 -85 3)" />
          </g>
          <g fill="none" stroke={stroke} strokeWidth="1" opacity="0.3">
            <path d="M-20 10 L-18 110" />
            <path d="M0 8 L0 115" />
            <path d="M20 8 L20 110" />
            <path d="M40 12 L36 105" />
          </g>
        </>
      )}
    </g>
  );
}

/* ---------- Face — frontal, perfil, posterior ---------- */

function FaceFront() {
  const stroke = "#0B2545";
  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M150 20 Q85 30 75 130 Q73 200 95 255 Q125 310 150 320 Q175 310 205 255 Q227 200 225 130 Q215 30 150 20 Z" />
        <ellipse cx="115" cy="150" rx="14" ry="7" />
        <ellipse cx="185" cy="150" rx="14" ry="7" />
        <circle cx="115" cy="150" r="2.5" fill={stroke} />
        <circle cx="185" cy="150" r="2.5" fill={stroke} />
        <path d="M150 155 Q146 195 140 215 Q150 222 160 215 Q154 195 150 155" fill="none" />
        <path d="M125 255 Q150 268 175 255" fill="none" />
        <path d="M77 170 Q67 190 77 215" fill="none" />
        <path d="M223 170 Q233 190 223 215" fill="none" />
      </g>
      <g fill="none" stroke={stroke} strokeWidth="1">
        <path d="M90 95 Q150 60 210 95" opacity="0.4" />
        <path d="M100 132 Q115 124 130 132" />
        <path d="M170 132 Q185 124 200 132" />
        <path d="M150 20 L150 320" strokeDasharray="3,4" opacity="0.2" />
        <circle cx="85" cy="195" r="3" opacity="0.4" />
        <circle cx="215" cy="195" r="3" opacity="0.4" />
      </g>
    </svg>
  );
}

function FaceProfile() {
  const stroke = "#0B2545";
  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {/* contorno crânio + testa + nariz + lábios + queixo, perfil voltado à direita */}
        <path d="M90 90 Q90 30 165 25 Q230 30 244 95 Q252 130 246 150
                 L240 160
                 Q252 172 262 192 Q268 206 258 214 Q250 218 242 216
                 L240 218
                 Q239 224 236 228
                 L246 230 Q250 234 244 238 L234 238
                 Q236 244 232 248
                 L246 252 Q250 258 240 262 L228 262
                 Q230 274 224 282
                 Q220 294 200 300
                 L150 304 Q128 300 118 286
                 Q108 270 105 240
                 Q88 220 92 195 Q80 170 85 140 Q86 115 90 90 Z" />
        {/* narina (sombra) */}
        <ellipse cx="248" cy="216" rx="3.5" ry="1.6" fill={stroke} opacity="0.5" stroke="none" />
        {/* fissura labial */}
        <path d="M232 244 Q240 246 246 244" fill="none" />
        {/* filtro nasolabial */}
        <path d="M238 222 L236 230" fill="none" opacity="0.4" />
        {/* sulco mentolabial */}
        <path d="M226 268 Q234 274 226 282" fill="none" opacity="0.55" />
        {/* mandíbula */}
        <path d="M220 290 Q190 296 160 298" fill="none" opacity="0.5" />
        {/* orelha (pavilhão auricular) — posicionada mais posterior */}
        <path d="M128 168 Q108 174 110 202 Q116 224 136 222 Q144 217 140 202 Q144 182 136 170 Z"
              fill="#f8fafc" />
        <path d="M126 180 Q120 196 130 212" fill="none" opacity="0.55" />
        <path d="M128 190 Q124 202 132 209" fill="none" opacity="0.4" />
        <ellipse cx="134" cy="217" rx="3.5" ry="2.5" fill="#f8fafc" />

      </g>
      <g fill="none" stroke={stroke} strokeWidth="1">
        {/* olho de perfil */}
        <path d="M195 152 Q205 148 215 152 Q210 158 200 158 Q195 156 195 152 Z" />
        <circle cx="206" cy="154" r="2" fill={stroke} />
        {/* sobrancelha */}
        <path d="M192 138 Q205 132 220 138" />
        {/* linha cabelo */}
        <path d="M100 95 Q150 70 235 100" opacity="0.4" />
        {/* ATM */}
        <circle cx="170" cy="195" r="3" opacity="0.5" />
      </g>
      <g fill={stroke} stroke="none" fontSize="9" opacity="0.6">
        <text x={125} y={162} textAnchor="middle">orelha</text>
        <text x={170} y={210}>ATM</text>
        <text x={270} y={200}>nariz</text>
        <text x={260} y={246}>boca</text>
      </g>
    </svg>
  );
}

function FaceBack() {
  const stroke = "#0B2545";
  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {/* crânio posterior (occipital) */}
        <path d="M150 25 Q80 35 72 130 Q70 200 92 255 L100 280 L200 280 L208 255
                 Q230 200 228 130 Q220 35 150 25 Z" />
        {/* orelhas (vistas por trás) */}
        <path d="M78 165 Q66 175 70 200 Q78 218 92 215 Q96 200 92 185 Q92 175 86 168 Z" />
        <path d="M222 165 Q234 175 230 200 Q222 218 208 215 Q204 200 208 185 Q208 175 214 168 Z" />
        {/* pescoço */}
        <path d="M118 280 Q116 300 120 318 L180 318 Q184 300 182 280" />
        {/* trapézio + ombros */}
        <path d="M120 318 Q90 320 50 332 Q30 338 18 340 L18 340" fill="none" />
        <path d="M180 318 Q210 320 250 332 Q270 338 282 340" fill="none" />
        <path d="M18 340 Q60 326 120 318 L180 318 Q240 326 282 340 L282 340" />
      </g>
      <g fill={stroke} stroke="none" opacity="0.55">
        {/* cabelo curto — massa contínua do alto da cabeça até a prega da nuca */}
        <path d="M88 80 Q92 50 130 35 Q150 28 170 35 Q210 50 222 85
                 Q230 130 228 175 Q224 220 212 258
                 Q205 274 188 278
                 L112 278 Q95 274 88 258
                 Q76 220 72 175 Q70 130 78 95 Z"
              fill={stroke} opacity="0.45" stroke="none" />
        {/* fios texturizados sobre a massa */}
        <path d="M95 70 Q100 60 108 68 M115 60 Q120 50 128 58 M138 55 Q144 46 152 54
                 M162 55 Q168 46 176 54 M188 60 Q194 50 202 58 M208 70 Q214 60 222 68
                 M88 110 Q94 102 102 110 M118 102 Q124 94 132 102 M148 98 Q154 90 162 98
                 M178 98 Q184 90 192 98 M208 102 Q214 94 222 102
                 M92 160 Q100 154 108 162 M120 156 Q128 150 136 158
                 M156 156 Q164 150 172 158 M188 156 Q196 150 204 162
                 M96 220 Q104 214 112 222 M124 218 Q132 212 140 220
                 M160 218 Q168 212 176 220 M188 220 Q196 214 204 222
                 M108 262 Q116 256 124 264 M140 262 Q148 256 156 264
                 M172 262 Q180 256 188 264"
              fill="none" stroke={stroke} strokeWidth="1.1" opacity="0.7" />
      </g>
      <g fill="none" stroke={stroke} strokeWidth="1">
        {/* linha cabelo posterior */}
        <path d="M85 105 Q150 90 215 105" opacity="0.4" />
        {/* sutura sagital / linha média */}
        <path d="M150 25 L150 280" strokeDasharray="3,4" opacity="0.25" />
        {/* protuberância occipital */}
        <circle cx="150" cy="195" r="4" opacity="0.5" />
        {/* base do crânio */}
        <path d="M105 250 Q150 268 195 250" opacity="0.35" />
        {/* coluna cervical */}
        <path d="M150 280 L150 320" strokeDasharray="2,3" opacity="0.5" />
        {/* trapézio — fibras */}
        <path d="M150 295 Q120 320 60 335" opacity="0.35" />
        <path d="M150 295 Q180 320 240 335" opacity="0.35" />
      </g>
      <g fill={stroke} stroke="none" fontSize="9" opacity="0.6">
        <text x={150} y={210} textAnchor="middle">occipital</text>
        <text x={150} y={310} textAnchor="middle">nuca</text>
        <text x={40} y={332} textAnchor="middle">trapézio</text>
      </g>
    </svg>
  );
}

/* ---------- Feet — superior, lateral, plantar ---------- */

function FootTop() {
  const stroke = "#0B2545";
  return (
    <svg viewBox={`0 0 ${FTW} ${FTH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {/* dorso do pé direito visto de cima — hálux à esquerda (medial) */}
        <path d="M80 90
                 Q72 130 78 180
                 Q86 235 110 268
                 Q140 285 168 270
                 Q188 250 192 215
                 Q198 175 192 135
                 Q188 105 178 88
                 L178 88 Z" />
        {/* dedos — alinhados na borda anterior, decrescentes do hálux ao 5º */}
        <path d="M80 90 Q70 60 82 38 Q102 26 118 38 Q124 60 118 84 Z" />
        <path d="M120 80 Q116 52 128 38 Q142 30 154 40 Q156 60 150 82 Z" />
        <path d="M152 80 Q150 56 160 46 Q172 40 180 48 Q182 64 176 84 Z" />
        <path d="M178 86 Q176 64 184 56 Q194 52 200 60 Q200 74 194 90 Z" />
        <path d="M196 92 Q196 76 204 70 Q212 68 216 76 Q214 90 208 102 Z" />
        {/* unhas */}
        <g fill="#fff" opacity="0.85" stroke={stroke} strokeWidth="0.8">
          <ellipse cx="100" cy="42" rx="14" ry="6" />
          <ellipse cx="138" cy="40" rx="10" ry="4.5" />
          <ellipse cx="166" cy="48" rx="8" ry="3.8" />
          <ellipse cx="188" cy="60" rx="7" ry="3.2" />
          <ellipse cx="206" cy="76" rx="5.5" ry="2.8" />
        </g>
      </g>
      <g fill="none" stroke={stroke} strokeWidth="1" opacity="0.35">
        {/* tendões extensores (metatarsos) */}
        <path d="M100 108 Q108 170 118 230" />
        <path d="M132 100 Q138 170 144 230" />
        <path d="M160 108 Q164 175 166 232" />
        <path d="M184 120 Q184 180 182 232" />
        {/* linha do tornozelo */}
        <path d="M96 260 Q140 274 184 258" />
      </g>
      <g fill={stroke} stroke="none" fontSize="9" opacity="0.6">
        <text x={88} y={108}>hálux</text>
        <text x={216} y={92}>5º dedo</text>
        <text x={140} y={300} textAnchor="middle">PÉ DIREITO — vista superior (dorso)</text>
      </g>
    </svg>
  );
}

function FootLateral() {
  const stroke = "#0B2545";
  return (
    <svg viewBox={`0 0 ${FTW} ${FTH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g fill="#f8fafc" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {/* perna (panturrilha + tíbia) — termina acima do tornozelo deixando articulação visível */}
        <path d="M70 20 Q56 80 60 150
                 Q60 170 70 182
                 L120 182
                 Q130 170 130 150
                 Q134 80 120 20 Z" />
        {/* tornozelo — articulação estreita entre perna e pé */}
        <path d="M70 182 Q78 198 78 212 L122 212 Q122 198 130 182 Z" />
        {/* pé (da base do tornozelo até os dedos) */}
        <path d="M50 212 Q40 222 42 240
                 Q50 258 80 262
                 L220 262
                 Q246 258 250 240
                 Q250 228 238 224
                 Q220 220 200 216
                 L160 206
                 Q130 202 110 200
                 Q90 200 78 208
                 L50 212 Z" />
        {/* maléolo lateral — grande e bem visível na lateral do tornozelo */}
        <circle cx="100" cy="208" r="14" fill="#f8fafc" />
        <circle cx="100" cy="208" r="6" fill={stroke} opacity="0.35" stroke="none" />
        {/* arco plantar */}
        <path d="M80 262 Q140 240 210 260" fill="none" opacity="0.55" />
        {/* hálux destacado */}
        <path d="M220 262 Q248 254 252 240 Q250 230 238 226 Q224 232 218 244 Z" />
      </g>
      <g fill="none" stroke={stroke} strokeWidth="1" opacity="0.5">
        {/* tíbia (osso anterior) */}
        <path d="M118 30 Q120 100 122 180" />
        {/* tendão de Aquiles — visível atrás do tornozelo */}
        <path d="M68 150 Q62 180 72 210" strokeDasharray="3,3" />
        {/* linha de articulação tíbio-társica */}
        <path d="M70 200 Q100 195 130 200" opacity="0.4" />
      </g>
      <g fill={stroke} stroke="none" fontSize="9" opacity="0.75">
        <text x={120} y={212}>maléolo lateral</text>
        <text x={48} y={172}>Aquiles</text>
        <text x={134} y={110}>tíbia</text>
        <text x={236} y={278} textAnchor="middle">hálux</text>
        <text x={140} y={300} textAnchor="middle">PÉ DIREITO — vista lateral</text>
      </g>
    </svg>
  );
}


function FootPlantar() {
  const stroke = "#0B2545";
  return (
    <svg viewBox={`0 0 ${FTW} ${FTH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g fill="#fde9d8" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {/* sola do pé direito */}
        <path d="M95 40 Q70 70 70 130 Q72 200 95 250 Q120 275 145 270 Q175 260 180 220 Q188 170 182 120 Q175 70 155 45 Q125 30 95 40 Z" />
        <ellipse cx="105" cy="48" rx="20" ry="22" />
        <ellipse cx="135" cy="38" rx="13" ry="16" />
        <ellipse cx="155" cy="42" rx="11" ry="14" />
        <ellipse cx="172" cy="50" rx="10" ry="12" />
        <ellipse cx="186" cy="62" rx="9" ry="11" />
      </g>
      <g fill="none" stroke={stroke} strokeWidth="1" opacity="0.45">
        {/* coxim metatarsal */}
        <path d="M90 95 Q130 105 180 100" />
        {/* arco plantar — linha medial */}
        <path d="M90 130 Q110 170 110 220" />
        {/* calcâneo */}
        <ellipse cx="125" cy="248" rx="32" ry="20" />
        {/* região medial / lateral */}
        <path d="M75 180 Q130 195 180 180" strokeDasharray="2,3" />
      </g>
      <g fill={stroke} stroke="none" fontSize="9" opacity="0.6">
        <text x={125} y={252} textAnchor="middle">calcâneo</text>
        <text x={130} y={140} textAnchor="middle" opacity="0.55">coxim metatarsal</text>
        <text x={130} y={295} textAnchor="middle">PÉ DIREITO — plantar</text>
      </g>
    </svg>
  );
}

/* ---------- Pelvis / perineum (M & F) — posição de litotomia ----------
   Vista afastada: paciente em decúbito dorsal com coxas abduzidas.
   As duas coxas aparecem como volumes inteiros (do joelho à pelve),
   com espaço ao redor para o paciente pintar pontos de dor na coxa,
   na virilha, no períneo e na genitália.
*/
function PelvisSilhouette({ sex }: { sex: Sex }) {
  const outline = "#7a1f33";
  const line = "#0B2545";
  const skinDeep = "#f4b6ad";
  const mucosa = "#9a2a3a";
  const cx = PW / 2;
  // Layout based on user's reference (Sanarmed lithotomy view):
  // two large thigh/buttock volumes spread in a V; genitalia centered between them.
  return (
    <svg viewBox={`0 0 ${PW} ${PH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="thighFill" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#fdeee6" />
          <stop offset="100%" stopColor={skinDeep} />
        </radialGradient>
        <radialGradient id="hairFill" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#6b4226" />
          <stop offset="100%" stopColor="#3a2414" />
        </radialGradient>
      </defs>

      {/* ===== COXAS (vista de litotomia) — duas massas grandes em V ===== */}
      <g stroke={outline} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        {/* coxa/glúteo DIREITO (lado esquerdo da tela) */}
        <path fill="url(#thighFill)" d="
          M 0 30
          C 40 10, 110 35, 150 130
          C 165 170, 172 210, 175 250
          C 178 290, 175 330, 170 380
          C 155 420, 80 430, 30 425
          L 0 425 Z
        " />
        {/* coxa/glúteo ESQUERDO (lado direito da tela) */}
        <path fill="url(#thighFill)" d="
          M 360 30
          C 320 10, 250 35, 210 130
          C 195 170, 188 210, 185 250
          C 182 290, 185 330, 190 380
          C 205 420, 280 430, 330 425
          L 360 425 Z
        " />
        {/* prega inguinal/sulco entre coxa e pelve */}
        <path d="M 35 80 Q 95 90 145 130" fill="none" stroke={outline} strokeWidth="0.9" opacity="0.4" />
        <path d="M 325 80 Q 265 90 215 130" fill="none" stroke={outline} strokeWidth="0.9" opacity="0.4" />
      </g>

      {sex === "female" ? (
        <>
          {/* MONTE DE VÊNUS — triângulo de pelos */}
          <path fill="url(#hairFill)" stroke="#2a1808" strokeWidth="0.6" d="
            M 140 110
            Q 180 95 220 110
            C 218 140, 210 175, 195 200
            Q 180 210 165 200
            C 150 175, 142 140, 140 110 Z
          " />
          {/* textura de pelos (pequenos traços) */}
          <g stroke="#2a1808" strokeWidth="0.4" opacity="0.55">
            {Array.from({ length: 18 }).map((_, i) => {
              const a = (i / 17) * Math.PI;
              const r1 = 38, r2 = 46;
              const x1 = 180 + Math.cos(a + Math.PI) * r1;
              const y1 = 150 + Math.sin(a + Math.PI) * r1 * 0.7;
              const x2 = 180 + Math.cos(a + Math.PI) * r2;
              const y2 = 150 + Math.sin(a + Math.PI) * r2 * 0.7;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>

          {/* GRANDES LÁBIOS — dois volumes carnudos simétricos */}
          <g stroke={outline} strokeWidth="1.4" strokeLinejoin="round">
            <path fill={skinDeep} d="
              M 152 200
              C 138 230, 138 280, 158 320
              C 170 335, 178 335, 180 332
              L 180 210
              C 172 202, 160 198, 152 200 Z
            " />
            <path fill={skinDeep} d="
              M 208 200
              C 222 230, 222 280, 202 320
              C 190 335, 182 335, 180 332
              L 180 210
              C 188 202, 200 198, 208 200 Z
            " />
          </g>

          {/* PEQUENOS LÁBIOS — internos, mais escuros/rosados */}
          <g stroke={mucosa} strokeWidth="0.9" strokeLinejoin="round">
            <path fill="#c97585" d="
              M 168 215
              C 160 240, 162 280, 174 310
              C 178 314, 180 314, 180 310
              L 180 215 Z
            " />
            <path fill="#c97585" d="
              M 192 215
              C 200 240, 198 280, 186 310
              C 182 314, 180 314, 180 310
              L 180 215 Z
            " />
          </g>

          {/* CLITÓRIS */}
          <ellipse cx={cx} cy={222} rx="4" ry="3" fill="#d97a85" stroke={mucosa} strokeWidth="0.8" />

          {/* URETRA */}
          <circle cx={cx} cy={245} r="1.8" fill={mucosa} />

          {/* ABERTURA DA VAGINA — óvalo escuro alongado */}
          <ellipse cx={cx} cy={275} rx="6" ry="14" fill="#5a0f1c" stroke={mucosa} strokeWidth="0.9" />

          {/* PERÍNEO */}
          <path d="M 180 320 L 180 348" stroke={outline} strokeWidth="1" opacity="0.5" />

          {/* ÂNUS — pequena estrela */}
          <g transform={`translate(${cx} 358)`}>
            <ellipse cx="0" cy="0" rx="7" ry="5" fill="#7a1f33" stroke={outline} strokeWidth="0.8" />
            <path d="M -5 0 L 5 0 M 0 -4 L 0 4 M -4 -3 L 4 3 M -4 3 L 4 -3"
                  stroke="#4a0f1f" strokeWidth="0.6" opacity="0.75" />
          </g>

          {/* === Rótulos anatômicos === */}
          <g fill={line} stroke="none" fontSize="9" fontFamily="sans-serif">
            {/* lado esquerdo (D do paciente) */}
            <g textAnchor="end">
              <line x1={132} y1={130} x2={155} y2={140} stroke={line} strokeWidth="0.5" />
              <text x={130} y={132}>monte de vênus</text>
              <line x1={132} y1={222} x2={170} y2={222} stroke={line} strokeWidth="0.5" />
              <text x={130} y={224}>clitóris</text>
              <line x1={132} y1={245} x2={176} y2={245} stroke={line} strokeWidth="0.5" />
              <text x={130} y={247}>uretra</text>
              <line x1={132} y1={275} x2={172} y2={275} stroke={line} strokeWidth="0.5" />
              <text x={130} y={277}>vagina</text>
              <line x1={132} y1={335} x2={178} y2={335} stroke={line} strokeWidth="0.5" />
              <text x={130} y={337}>períneo</text>
              <line x1={132} y1={358} x2={172} y2={358} stroke={line} strokeWidth="0.5" />
              <text x={130} y={360}>ânus</text>
              <line x1={60} y1={250} x2={90} y2={250} stroke={line} strokeWidth="0.5" />
              <text x={58} y={252}>coxa D</text>
            </g>
            {/* lado direito (E do paciente) */}
            <g>
              <line x1={228} y1={200} x2={210} y2={210} stroke={line} strokeWidth="0.5" />
              <text x={230} y={202}>grandes lábios</text>
              <line x1={228} y1={260} x2={196} y2={260} stroke={line} strokeWidth="0.5" />
              <text x={230} y={262}>pequenos lábios</text>
              <line x1={300} y1={250} x2={270} y2={250} stroke={line} strokeWidth="0.5" />
              <text x={302} y={252}>coxa E</text>
            </g>
          </g>
        </>
      ) : (
        <>
          {/* === GENITÁLIA MASCULINA — vista frontal entre as coxas === */}
          {/* Pelos pubianos */}
          <path fill="url(#hairFill)" stroke="#2a1808" strokeWidth="0.6" d="
            M 145 115
            Q 180 100 215 115
            C 213 140, 205 165, 195 180
            Q 180 188 165 180
            C 155 165, 147 140, 145 115 Z
          " />
          <g stroke="#2a1808" strokeWidth="0.4" opacity="0.5">
            {Array.from({ length: 14 }).map((_, i) => {
              const a = (i / 13) * Math.PI;
              const x1 = 180 + Math.cos(a + Math.PI) * 36;
              const y1 = 150 + Math.sin(a + Math.PI) * 28;
              const x2 = 180 + Math.cos(a + Math.PI) * 44;
              const y2 = 150 + Math.sin(a + Math.PI) * 32;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>

          {/* Corpo do pênis — pendente */}
          <path fill={skinDeep} stroke={outline} strokeWidth="1.4" d="
            M 162 180
            C 158 215, 160 250, 168 275
            C 172 282, 188 282, 192 275
            C 200 250, 202 215, 198 180
            C 192 175, 168 175, 162 180 Z
          " />
          {/* Sulco bálano-prepucial */}
          <path d="M 162 268 Q 180 273 198 268" stroke={outline} strokeWidth="0.9" fill="none" opacity="0.55" />
          {/* Glande */}
          <ellipse cx={cx} cy={286} rx="18" ry="13" fill="#d97a85" stroke={mucosa} strokeWidth="1.1" />
          {/* Meato uretral */}
          <path d="M 175 288 L 185 288" stroke={mucosa} strokeWidth="1.3" strokeLinecap="round" />

          {/* Escroto — duas bolsas testiculares */}
          <path fill={skinDeep} stroke={outline} strokeWidth="1.4" d="
            M 140 230
            C 118 250, 116 295, 145 320
            C 162 328, 175 328, 180 322
            C 185 328, 198 328, 215 320
            C 244 295, 242 250, 220 230
            C 205 245, 190 250, 180 250
            C 170 250, 155 245, 140 230 Z
          " />
          {/* Rafe mediana */}
          <path d="M 180 252 L 180 322" stroke={outline} strokeWidth="1" opacity="0.5" />

          {/* Períneo + ânus */}
          <path d="M 180 326 L 180 345" stroke={outline} strokeWidth="1" opacity="0.5" />
          <g transform={`translate(${cx} 358)`}>
            <ellipse cx="0" cy="0" rx="7" ry="5" fill="#7a1f33" stroke={outline} strokeWidth="0.8" />
            <path d="M -5 0 L 5 0 M 0 -4 L 0 4 M -4 -3 L 4 3 M -4 3 L 4 -3"
                  stroke="#4a0f1f" strokeWidth="0.6" opacity="0.75" />
          </g>

          {/* Rótulos */}
          <g fill={line} stroke="none" fontSize="9" fontFamily="sans-serif">
            <g textAnchor="end">
              <line x1={132} y1={130} x2={155} y2={140} stroke={line} strokeWidth="0.5" />
              <text x={130} y={132}>púbis</text>
              <line x1={132} y1={225} x2={165} y2={225} stroke={line} strokeWidth="0.5" />
              <text x={130} y={227}>pênis</text>
              <line x1={132} y1={286} x2={165} y2={286} stroke={line} strokeWidth="0.5" />
              <text x={130} y={288}>glande</text>
              <line x1={132} y1={345} x2={178} y2={345} stroke={line} strokeWidth="0.5" />
              <text x={130} y={347}>períneo</text>
              <line x1={132} y1={358} x2={172} y2={358} stroke={line} strokeWidth="0.5" />
              <text x={130} y={360}>ânus</text>
              <line x1={60} y1={250} x2={90} y2={250} stroke={line} strokeWidth="0.5" />
              <text x={58} y={252}>coxa D</text>
            </g>
            <g>
              <line x1={228} y1={285} x2={210} y2={285} stroke={line} strokeWidth="0.5" />
              <text x={230} y={287}>escroto</text>
              <line x1={300} y1={250} x2={270} y2={250} stroke={line} strokeWidth="0.5" />
              <text x={302} y={252}>coxa E</text>
            </g>
          </g>
        </>
      )}

      {/* rodapé */}
      <text x={cx} y={PH - 6} textAnchor="middle" fontSize="9" fill={line} opacity="0.7">
        posição ginecológica</text>

      <text x={cx} y={18} textAnchor="middle" fontSize="9" fill={line} opacity="0.65">
        posição ginecológica — {sex === "female" ? "feminino" : "masculino"}
      </text>
    </svg>
  );
}

/* ---------- Região glútea com a prega glútea ----------
   Vista posterior afastada: cintura, glúteos arredondados,
   prega glútea bem marcada e coxas posteriores afilando para baixo.
*/
function GluteSilhouette() {
  return (
    <img
      src={gluteBackImg}
      alt="Região glútea — vista posterior"
      className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none"
      draggable={false}
    />
  );
}



