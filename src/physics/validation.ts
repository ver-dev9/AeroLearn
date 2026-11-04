/**
 * Input validation helpers shared by all models.
 * Every model validates its inputs before computing and returns
 * human-readable messages instead of producing NaN or Infinity.
 */

export interface Range {
  min: number;
  max: number;
  /** When true, the minimum itself is not allowed (strictly greater than). */
  exclusiveMin?: boolean;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export function checkRange(field: string, label: string, value: number, range: Range, unit = ''): ValidationIssue | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { field, message: `${label} must be a number.` };
  }
  const u = unit ? ` ${unit}` : '';
  if (range.exclusiveMin ? value <= range.min : value < range.min) {
    return { field, message: `${label} must be ${range.exclusiveMin ? 'greater than' : 'at least'} ${range.min}${u}.` };
  }
  if (value > range.max) {
    return { field, message: `${label} must be at most ${range.max}${u}.` };
  }
  return null;
}

export function collect(...issues: (ValidationIssue | null)[]): ValidationIssue[] {
  return issues.filter((i): i is ValidationIssue => i !== null);
}

export class PhysicsInputError extends Error {
  issues: ValidationIssue[];
  constructor(issues: ValidationIssue[]) {
    super(issues.map((i) => i.message).join(' '));
    this.name = 'PhysicsInputError';
    this.issues = issues;
  }
}

/** Parse user-typed text into a finite number, or null. Accepts "1e3", " 12.5 ". */
export function parseNumber(text: string): number | null {
  const t = text.trim().replace(',', '.');
  if (t === '' || t === '-' || t === '.') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
