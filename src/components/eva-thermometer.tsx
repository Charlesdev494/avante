import { useRef } from "react";
import { interpretEva } from "@/lib/questionnaires";

/**
 * Termômetro de dor (EVA 0-10).
 * Vertical: 0 em baixo (azul/frio), 10 em cima (vermelho).
 * Toque/arraste no termômetro para ajustar; também pode tocar nos números.
 */

const FACES = ["😀", "🙂", "😐", "😕", "😟", "😣", "😖", "😫", "😩", "😭", "🤬"];
const COLORS = [
  "#1e40af", // 0 deep blue (cold)
  "#2563eb",
  "#0ea5e9",
  "#06b6d4",
  "#10b981",
  "#84cc16", // 5 green-yellow
  "#eab308",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#b91c1c", // 10 deep red
];

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function EvaThermometer({ value, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const setFromY = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = 1 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const v = Math.round(ratio * 10);
    onChange(v);
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setFromY(e.clientY);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    setFromY(e.clientY);
  };
  const onUp = () => {
    draggingRef.current = false;
  };

  const fillPct = (value / 10) * 100;
  const color = COLORS[value];

  return (
    <div className="rounded-lg bg-muted/40 p-5">
      <div className="mb-4 text-center">
        <div className="text-6xl leading-none">{FACES[value]}</div>
        <div className="mt-2 text-5xl font-bold" style={{ color }}>
          {value}
        </div>
        <div className="text-sm font-medium" style={{ color }}>
          {interpretEva(value)}
        </div>
      </div>

      <div className="flex items-stretch justify-center gap-4">
        {/* Number ticks */}
        <div className="flex flex-col-reverse justify-between py-1 text-xs font-semibold text-muted-foreground">
          {Array.from({ length: 11 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
                i === value ? "text-white shadow" : "hover:bg-muted"
              }`}
              style={i === value ? { backgroundColor: COLORS[i] } : undefined}
              aria-label={`Nota ${i}`}
            >
              {i}
            </button>
          ))}
        </div>

        {/* Thermometer */}
        <div className="relative flex flex-col items-center">
          <div
            ref={trackRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="relative h-72 w-10 cursor-pointer touch-none overflow-hidden rounded-full border-2 border-secondary/30 bg-white"
            style={{ touchAction: "none" }}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={value}
          >
            {/* Gradient background reference (faint) */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "linear-gradient(to top, #1e40af, #06b6d4, #10b981, #eab308, #f97316, #b91c1c)",
              }}
            />
            {/* Filled mercury */}
            <div
              className="absolute bottom-0 left-0 right-0 transition-[height] duration-150"
              style={{
                height: `${fillPct}%`,
                background:
                  "linear-gradient(to top, #1e40af, #06b6d4, #10b981, #eab308, #f97316, #b91c1c)",
              }}
            />
            {/* Indicator line */}
            <div
              className="pointer-events-none absolute left-0 right-0 h-1 bg-white shadow"
              style={{ bottom: `calc(${fillPct}% - 2px)` }}
            />
          </div>
          {/* Bulb */}
          <div
            className="-mt-2 h-14 w-14 rounded-full border-2 border-secondary/30 shadow-inner"
            style={{ background: "radial-gradient(circle at 35% 35%, #fca5a5, #b91c1c)" }}
          />
        </div>

        {/* Labels */}
        <div className="flex flex-col justify-between py-1 text-[11px] font-medium text-muted-foreground">
          <span className="text-red-600">Pior dor</span>
          <span className="text-orange-500">Intensa</span>
          <span className="text-yellow-600">Moderada</span>
          <span className="text-emerald-600">Leve</span>
          <span className="text-blue-600">Sem dor</span>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Arraste no termômetro ou toque no número
      </p>
    </div>
  );
}
