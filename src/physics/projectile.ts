/**
 * Projectile motion (Flight Lab).
 *
 * Model: point mass, uniform gravitational field g, no air resistance,
 * launch and landing at the same elevation (y = 0).
 *
 *   x(t) = v₀ cos(θ) t
 *   y(t) = v₀ sin(θ) t − ½ g t²
 *
 * Closed-form results (derived by setting y(T) = 0 and dy/dt = 0):
 *   T  = 2 v₀ sin θ / g            (time of flight)
 *   H  = v₀² sin² θ / (2 g)        (maximum height, at t = T/2)
 *   R  = v₀² sin 2θ / g            (horizontal range)
 */
import { DEG } from './constants';
import { checkRange, collect, PhysicsInputError, ValidationIssue } from './validation';

export interface ProjectileInput {
  /** Launch speed v₀, m/s */
  v0: number;
  /** Launch angle θ above horizontal, degrees */
  angleDeg: number;
  /** Gravitational acceleration g, m/s² */
  g: number;
}

export interface ProjectileSample {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface ProjectileResult {
  timeOfFlight: number;
  maxHeight: number;
  range: number;
  timeToApex: number;
  samples: ProjectileSample[];
}

export const PROJECTILE_LIMITS = {
  v0: { min: 0, max: 2000, exclusiveMin: true },
  angleDeg: { min: 0, max: 90, exclusiveMin: true },
  g: { min: 0.1, max: 100 },
};

export function validateProjectile(i: ProjectileInput): ValidationIssue[] {
  return collect(
    checkRange('v0', 'Initial velocity', i.v0, PROJECTILE_LIMITS.v0, 'm/s'),
    checkRange('angleDeg', 'Launch angle', i.angleDeg, PROJECTILE_LIMITS.angleDeg, '°'),
    checkRange('g', 'Gravity', i.g, PROJECTILE_LIMITS.g, 'm/s²'),
  );
}

export function projectilePosition(i: ProjectileInput, t: number): { x: number; y: number } {
  const th = i.angleDeg * DEG;
  return {
    x: i.v0 * Math.cos(th) * t,
    y: i.v0 * Math.sin(th) * t - 0.5 * i.g * t * t,
  };
}

export function solveProjectile(i: ProjectileInput, sampleCount = 120): ProjectileResult {
  const issues = validateProjectile(i);
  if (issues.length) throw new PhysicsInputError(issues);

  const th = i.angleDeg * DEG;
  const vx = i.v0 * Math.cos(th);
  const vy0 = i.v0 * Math.sin(th);
  const T = (2 * vy0) / i.g;
  const H = (vy0 * vy0) / (2 * i.g);
  // At exactly 90° cos θ is ~6e-17, so clamp range to 0 to avoid a misleading tiny value.
  const R = i.angleDeg >= 90 ? 0 : (i.v0 * i.v0 * Math.sin(2 * th)) / i.g;

  const n = Math.max(2, Math.floor(sampleCount));
  const samples: ProjectileSample[] = [];
  for (let k = 0; k <= n; k++) {
    const t = (T * k) / n;
    const p = projectilePosition(i, t);
    samples.push({ t, x: p.x, y: k === n ? 0 : Math.max(0, p.y), vx, vy: vy0 - i.g * t });
  }
  return { timeOfFlight: T, maxHeight: H, range: R, timeToApex: T / 2, samples };
}
