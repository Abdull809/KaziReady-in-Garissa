import React from 'react';

export interface BarChartDatum {
  label: string;
  value: number;
  sublabel?: string;
  color?: string;
}

export function HorizontalBarChart({
  title,
  subtitle,
  data,
  valueFormatter = (v) => String(v),
}: {
  title: string;
  subtitle?: string;
  data: BarChartDatum[];
  valueFormatter?: (val: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-[#10243A]">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">No data available yet.</p>
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const pct = Math.max(4, Math.round((item.value / max) * 100));
            return (
              <div key={item.label}>
                <div className="flex items-baseline justify-between text-xs mb-1.5 gap-2">
                  <span className="font-medium text-[#10243A] truncate">{item.label}</span>
                  <span className="font-mono font-semibold text-[#10243A] tabular-nums shrink-0">
                    {valueFormatter(item.value)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[#F5F8FA]">
                  <div
                    className="h-full rounded-sm transition-all duration-300"
                    style={{
                      width: `${item.value === 0 ? 0 : pct}%`,
                      backgroundColor: item.color || '#0F9D83',
                    }}
                  />
                </div>
                {item.sublabel && (
                  <p className="mt-1 text-[11px] text-slate-500">{item.sublabel}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DonutBreakdownChart({
  title,
  subtitle,
  segments,
}: {
  title: string;
  subtitle?: string;
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-[#10243A]">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#F5F8FA"
              strokeWidth="16"
            />
            {total > 0 &&
              segments.map((seg) => {
                const segLen = (seg.value / total) * circumference;
                const dashArray = `${segLen} ${circumference - segLen}`;
                const dashOffset = -cumulativeOffset;
                cumulativeOffset += segLen;
                if (seg.value === 0) return null;
                return (
                  <circle
                    key={seg.label}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="16"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-xl font-bold text-[#10243A] tabular-nums">
              {total}
            </span>
            <span className="text-[11px] text-slate-500">Total</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2.5">
          {segments.map((seg) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            return (
              <div key={seg.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-slate-700 font-medium truncate">{seg.label}</span>
                </div>
                <span className="font-mono text-[#10243A] font-semibold tabular-nums shrink-0">
                  {seg.value} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
