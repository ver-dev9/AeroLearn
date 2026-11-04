/** Number formatting helpers that never print NaN/Infinity to the user. */
export function fmt(value: number, digits = 2): string {
  if (value === Infinity) return '∞';
  if (value === -Infinity) return '−∞';
  if (!Number.isFinite(value)) return '—';
  const a = Math.abs(value);
  if (a !== 0 && (a >= 1e6 || a < 1e-3)) return value.toExponential(digits);
  return value.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

/** Format with an SI prefix, e.g. 12 300 N → "12.3 kN". */
export function fmtSI(value: number, unit: string, digits = 3): string {
  if (!Number.isFinite(value)) return value === Infinity ? `∞ ${unit}` : '—';
  const a = Math.abs(value);
  const prefixes: [number, string][] = [
    [1e9, 'G'],
    [1e6, 'M'],
    [1e3, 'k'],
  ];
  for (const [p, s] of prefixes) {
    if (a >= p) return `${Number((value / p).toPrecision(digits))} ${s}${unit}`;
  }
  return `${Number(value.toPrecision(digits))} ${unit}`;
}

export function fmtDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return '—';
  if (seconds < 120) return `${fmt(seconds, 1)} s`;
  if (seconds < 7200) return `${fmt(seconds / 60, 1)} min`;
  if (seconds < 172800) return `${fmt(seconds / 3600, 2)} h`;
  return `${fmt(seconds / 86400, 2)} days`;
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

export function relativeDate(iso: string): string {
  const then = new Date(iso);
  const diff = (Date.now() - then.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return then.toLocaleDateString();
}

/** "Nice" axis ticks (1, 2, 5 × 10ⁿ). */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0];
  if (max === min) {
    max = min + 1;
  }
  const span = max - min;
  const raw = span / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const start = Math.ceil(min / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 1e-6; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return ticks;
}

export function tickLabel(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e6) return `${Number((v / 1e6).toPrecision(3))}M`;
  if (a >= 1e4) return `${Number((v / 1e3).toPrecision(3))}k`;
  if (a !== 0 && a < 0.01) return v.toExponential(0);
  return `${Number(v.toPrecision(3))}`;
}
