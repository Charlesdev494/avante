import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


/**
 * SF-36 — gráfico de linha sequencial dos 8 domínios.
 * Linha de referência em 50 (meta intermediária). Cada série representa
 * um momento da avaliação (D0, D30, D90...).
 *
 * Cores das linhas seguem as cores de marca:
 *   D0  → cinza  (basal)
 *   D30 → âmbar  (reavaliação)
 *   D90 → verde  (meta)
 *   demais dias → azul-marinho da marca
 */

export interface Sf36Subscales {
  capacidade_funcional?: number;
  limitacao_fisica?: number;
  dor?: number;
  saude_geral?: number;
  vitalidade?: number;
  aspectos_sociais?: number;
  limitacao_emocional?: number;
  saude_mental?: number;
}

export interface Sf36Series {
  /** Rótulo curto (ex: "D0", "D30", "Atual"). */
  label: string;
  /** Subescalas SF-36 (0–100 por domínio). */
  subscales: Sf36Subscales;
}

const DOMAINS: { key: keyof Sf36Subscales; short: string; full: string }[] = [
  { key: "capacidade_funcional", short: "Capac. Func.", full: "Capacidade funcional" },
  { key: "limitacao_fisica", short: "Físicos", full: "Aspectos físicos" },
  { key: "dor", short: "Dor", full: "Dor corporal" },
  { key: "saude_geral", short: "Saúde Geral", full: "Estado geral de saúde" },
  { key: "vitalidade", short: "Vitalidade", full: "Vitalidade" },
  { key: "aspectos_sociais", short: "Sociais", full: "Aspectos sociais" },
  { key: "limitacao_emocional", short: "Emocionais", full: "Aspectos emocionais" },
  { key: "saude_mental", short: "Saúde Mental", full: "Saúde mental" },
];

function colorFor(label: string, index: number): string {
  const l = label.toUpperCase().trim();
  if (l === "D0") return "#94a3b8"; // basal
  if (l === "D30") return "#f59e0b"; // reavaliação
  if (l === "D90") return "#16a34a"; // meta
  // fallback rotativo
  const palette = ["var(--brand-teal)", "#0B2545", "#7c3aed", "#dc2626"];
  return palette[index % palette.length];
}

export function Sf36Chart({
  series,
  height = 320,
  showLegend = true,
}: {
  series: Sf36Series[];
  height?: number;
  showLegend?: boolean;
}) {
  if (!series.length) return null;

  // Constrói dados no formato esperado pelo recharts:
  // [{ domain: "Capac. Func.", full: "...", D0: 42, D30: 58, D90: 78 }, ...]
  const data = DOMAINS.map((d) => {
    const row: Record<string, number | string> = { domain: d.short, full: d.full };
    for (const s of series) {
      const v = s.subscales[d.key];
      if (typeof v === "number") row[s.label] = Math.round(v);
    }
    return row;
  });

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis
            dataKey="domain"
            interval={0}
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={90}
            tickMargin={8}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 11 }}
            label={{
              value: "Escore (0–100)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "#64748b" },
            }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}/100`, ""]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as { full?: string } | undefined;
              return p?.full ?? "";
            }}
            contentStyle={{ fontSize: 12 }}
          />
          <ReferenceLine
            y={50}
            stroke="#0B2545"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: "Meta 50",
              position: "insideTopRight",
              fill: "#0B2545",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          {series.map((s, i) => (
            <Line
              key={s.label}
              type="monotone"
              dataKey={s.label}
              stroke={colorFor(s.label, i)}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * SF-36 — gráfico radar (octógono) dos 8 domínios.
 * Cada eixo é um domínio; o polígono "expande" até a borda (100) e
 * "encolhe" ao centro (0). Permite sobrepor várias datas (D0, D30, D90...)
 * para visualizar evolução. Inclui um octógono tracejado em 50 como meta.
 */
export function Sf36RadarChart({
  series,
  height = 360,
  showLegend = true,
}: {
  series: Sf36Series[];
  height?: number;
  showLegend?: boolean;
}) {
  if (!series.length) return null;

  const data = DOMAINS.map((d) => {
    const row: Record<string, number | string> = { domain: d.short, full: d.full, meta: 50 };
    for (const s of series) {
      const v = s.subscales[d.key];
      if (typeof v === "number") row[s.label] = Math.round(v);
    }
    return row;
  });

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="68%" margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
          <PolarGrid stroke="#cbd5e1" />
          <PolarAngleAxis
            dataKey="domain"
            tick={{ fontSize: 10, fill: "#0B2545" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickCount={5}
          />
          {/* Meta tracejada em 50 */}
          <Radar
            name="Meta 50"
            dataKey="meta"
            stroke="#0B2545"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            fill="transparent"
            isAnimationActive={false}
          />
          {series.map((s, i) => {
            const c = colorFor(s.label, i);
            return (
              <Radar
                key={s.label}
                name={s.label}
                dataKey={s.label}
                stroke={c}
                strokeWidth={2.5}
                fill={c}
                fillOpacity={0.18}
              />
            );
          })}
          <Tooltip
            formatter={(value: number, name: string) => [`${value}/100`, name]}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as { full?: string } | undefined;
              return p?.full ?? "";
            }}
            contentStyle={{ fontSize: 12 }}
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}


/**
 * Lista resumida abaixo do gráfico — destaca o que está abaixo e acima
 * de 50 para a série mais recente. Ajuda o paciente a saber "o que mirar".
 */
export function Sf36DomainSummary({ subscales }: { subscales: Sf36Subscales }) {
  const rows = DOMAINS.map((d) => ({
    full: d.full,
    value: typeof subscales[d.key] === "number" ? Math.round(subscales[d.key] as number) : null,
  })).filter((r) => r.value !== null) as { full: string; value: number }[];

  const below = rows.filter((r) => r.value < 50).sort((a, b) => a.value - b.value);
  const above = rows.filter((r) => r.value >= 50).sort((a, b) => b.value - a.value);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
          A trabalhar (abaixo de 50)
        </div>
        {below.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhum domínio abaixo da meta. 🎉</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {below.map((r) => (
              <li key={r.full} className="flex items-center justify-between gap-2">
                <span className="text-foreground">{r.full}</span>
                <span className="font-semibold tabular-nums text-rose-700">{r.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Pontos fortes (50 ou mais)
        </div>
        {above.length === 0 ? (
          <div className="text-sm text-muted-foreground">Ainda construindo — vamos juntos.</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {above.map((r) => (
              <li key={r.full} className="flex items-center justify-between gap-2">
                <span className="text-foreground">{r.full}</span>
                <span className="font-semibold tabular-nums text-emerald-700">{r.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
