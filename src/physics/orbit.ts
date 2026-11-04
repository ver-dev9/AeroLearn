/**
 * Two-body orbital mechanics (Orbit Explorer).
 *
 * Model: a satellite of negligible mass moving in the plane of a single
 * spherically symmetric Earth (point mass at the origin). Only Newtonian
 * gravity acts:
 *
 *   a = −μ r / |r|³,   μ = GM⊕
 *
 * Not modelled: atmospheric drag, Earth's oblateness (J2), the Moon/Sun,
 * solar radiation pressure, relativity, manoeuvres. Real satellite
 * operations must account for all of these.
 *
 * Integrator: velocity Verlet (a.k.a. leapfrog / Störmer–Verlet).
 * It is second-order, time-reversible and symplectic, so the energy error
 * stays bounded over many orbits instead of drifting like explicit Euler.
 * An RK4 integrator is also provided for comparison and testing.
 */
import { MU_EARTH, R_EARTH } from './constants';
import { add, cross, dot, norm, scale, Vec2, vec } from './vector';
import { checkRange, collect, PhysicsInputError, ValidationIssue } from './validation';

export interface OrbitState {
  /** Position relative to Earth's centre, m */
  r: Vec2;
  /** Velocity, m/s */
  v: Vec2;
  /** Simulated time, s */
  t: number;
}

export type OrbitClass = 'circular' | 'elliptical' | 'parabolic' | 'hyperbolic' | 'suborbital';

export interface OrbitElements {
  /** Specific orbital energy ε = v²/2 − μ/r, J/kg */
  energy: number;
  /** Specific angular momentum h = |r × v|, m²/s */
  angularMomentum: number;
  /** Eccentricity e */
  eccentricity: number;
  /** Semi-major axis a = −μ / (2ε), m (Infinity for parabolic, negative for hyperbolic) */
  semiMajorAxis: number;
  /** Periapsis radius r_p = h² / (μ (1 + e)), m */
  periapsis: number;
  /** Apoapsis radius r_a = a (1 + e), m (Infinity if unbound) */
  apoapsis: number;
  /** Orbital period T = 2π √(a³/μ), s (null if unbound) */
  period: number | null;
  classification: OrbitClass;
}

export interface OrbitInput {
  /** Initial altitude above the mean surface, m */
  altitude: number;
  /** Initial speed, m/s */
  speed: number;
  /** Flight-path angle above local horizontal, degrees (0 = purely tangential) */
  flightPathAngleDeg: number;
  /** Gravitational parameter, m³/s² (defaults to Earth) */
  mu?: number;
  /** Body radius, m (defaults to Earth) */
  bodyRadius?: number;
}

export const ORBIT_LIMITS = {
  altitude: { min: 100e3, max: 100000e3 },
  speed: { min: 0, max: 20000, exclusiveMin: true },
  flightPathAngleDeg: { min: -60, max: 60 },
};

export function validateOrbit(i: OrbitInput): ValidationIssue[] {
  return collect(
    checkRange('altitude', 'Altitude', i.altitude, ORBIT_LIMITS.altitude, 'm'),
    checkRange('speed', 'Initial speed', i.speed, ORBIT_LIMITS.speed, 'm/s'),
    checkRange('flightPathAngleDeg', 'Flight-path angle', i.flightPathAngleDeg, ORBIT_LIMITS.flightPathAngleDeg, '°'),
  );
}

/** Gravitational acceleration a = −μ r / |r|³ */
export function gravity(r: Vec2, mu = MU_EARTH): Vec2 {
  const d = norm(r);
  if (d === 0) throw new Error('Gravity is singular at r = 0.');
  return scale(r, -mu / (d * d * d));
}

/** Initial state: satellite on the +x axis, velocity rotated from +y by the flight-path angle. */
export function initialState(i: OrbitInput): OrbitState {
  const issues = validateOrbit(i);
  if (issues.length) throw new PhysicsInputError(issues);
  const R = i.bodyRadius ?? R_EARTH;
  const gamma = (i.flightPathAngleDeg * Math.PI) / 180;
  return {
    r: vec(R + i.altitude, 0),
    v: vec(i.speed * Math.sin(gamma), i.speed * Math.cos(gamma)),
    t: 0,
  };
}

export function circularSpeed(radius: number, mu = MU_EARTH): number {
  return Math.sqrt(mu / radius);
}

export function escapeSpeed(radius: number, mu = MU_EARTH): number {
  return Math.sqrt((2 * mu) / radius);
}

export function specificEnergy(s: { r: Vec2; v: Vec2 }, mu = MU_EARTH): number {
  return dot(s.v, s.v) / 2 - mu / norm(s.r);
}

/** Classical orbital elements derived analytically from a state vector. */
export function orbitalElements(s: { r: Vec2; v: Vec2 }, mu = MU_EARTH, bodyRadius = R_EARTH): OrbitElements {
  const energy = specificEnergy(s, mu);
  const h = Math.abs(cross(s.r, s.v));
  // e² = 1 + 2εh²/μ²; clamp tiny negative round-off.
  const e = Math.sqrt(Math.max(0, 1 + (2 * energy * h * h) / (mu * mu)));
  const periapsis = (h * h) / (mu * (1 + e));
  let a: number;
  let apoapsis: number;
  let period: number | null;
  let classification: OrbitClass;
  const PARABOLIC_TOL = 1e-3;

  if (Math.abs(e - 1) < PARABOLIC_TOL) {
    a = Infinity;
    apoapsis = Infinity;
    period = null;
    classification = 'parabolic';
  } else if (energy < 0) {
    a = -mu / (2 * energy);
    apoapsis = a * (1 + e);
    period = 2 * Math.PI * Math.sqrt((a * a * a) / mu);
    classification = e < 0.01 ? 'circular' : 'elliptical';
  } else {
    a = -mu / (2 * energy);
    apoapsis = Infinity;
    period = null;
    classification = 'hyperbolic';
  }
  if (periapsis < bodyRadius && classification !== 'hyperbolic' && classification !== 'parabolic') {
    classification = 'suborbital';
  } else if (periapsis < bodyRadius) {
    // Unbound, but the trajectory still intersects the surface if moving inward.
    if (dot(s.r, s.v) < 0) classification = 'suborbital';
  }
  return { energy, angularMomentum: h, eccentricity: e, semiMajorAxis: a, periapsis, apoapsis, period, classification };
}

/** Eccentricity vector e = ((v² − μ/r) r − (r·v) v) / μ, pointing to periapsis. */
export function eccentricityVector(s: { r: Vec2; v: Vec2 }, mu = MU_EARTH): Vec2 {
  const r = norm(s.r);
  const v2 = dot(s.v, s.v);
  const rv = dot(s.r, s.v);
  return scale(add(scale(s.r, v2 - mu / r), scale(s.v, -rv)), 1 / mu);
}

/**
 * Points on the analytic conic r(ν) = p / (1 + e cos ν), rotated to the
 * periapsis direction. Used to draw the predicted orbit next to the
 * numerically integrated trail. Points beyond maxR are omitted.
 */
export function conicPoints(s: { r: Vec2; v: Vec2 }, maxR: number, n = 240, mu = MU_EARTH): Vec2[][] {
  const h = cross(s.r, s.v);
  const p = (h * h) / mu;
  const ev = eccentricityVector(s, mu);
  const e = norm(ev);
  const w = e > 1e-9 ? Math.atan2(ev.y, ev.x) : Math.atan2(s.r.y, s.r.x);
  const segments: Vec2[][] = [];
  let cur: Vec2[] = [];
  for (let k = 0; k <= n; k++) {
    const nu = -Math.PI + (2 * Math.PI * k) / n;
    const denom = 1 + e * Math.cos(nu);
    const r = denom > 1e-6 ? p / denom : Infinity;
    if (r > maxR || !Number.isFinite(r)) {
      if (cur.length > 1) segments.push(cur);
      cur = [];
      continue;
    }
    const ang = nu + w;
    cur.push({ x: r * Math.cos(ang), y: r * Math.sin(ang) });
  }
  if (cur.length > 1) segments.push(cur);
  return segments;
}

/** One velocity-Verlet step of size dt. */
export function verletStep(s: OrbitState, dt: number, mu = MU_EARTH): OrbitState {
  const a0 = gravity(s.r, mu);
  const vHalf = add(s.v, scale(a0, dt / 2));
  const r1 = add(s.r, scale(vHalf, dt));
  const a1 = gravity(r1, mu);
  const v1 = add(vHalf, scale(a1, dt / 2));
  return { r: r1, v: v1, t: s.t + dt };
}

/** One classical fourth-order Runge–Kutta step of size dt. */
export function rk4Step(s: OrbitState, dt: number, mu = MU_EARTH): OrbitState {
  const f = (r: Vec2, v: Vec2) => ({ dr: v, dv: gravity(r, mu) });
  const k1 = f(s.r, s.v);
  const k2 = f(add(s.r, scale(k1.dr, dt / 2)), add(s.v, scale(k1.dv, dt / 2)));
  const k3 = f(add(s.r, scale(k2.dr, dt / 2)), add(s.v, scale(k2.dv, dt / 2)));
  const k4 = f(add(s.r, scale(k3.dr, dt)), add(s.v, scale(k3.dv, dt)));
  const r = add(s.r, scale(add(add(k1.dr, scale(k2.dr, 2)), add(scale(k3.dr, 2), k4.dr)), dt / 6));
  const v = add(s.v, scale(add(add(k1.dv, scale(k2.dv, 2)), add(scale(k3.dv, 2), k4.dv)), dt / 6));
  return { r, v, t: s.t + dt };
}

/**
 * Pick a stable time step. The fastest, most curved part of any conic is
 * periapsis, so we resolve the periapsis passage with ~200 steps per radian
 * of true anomaly (dt ≈ 0.005 · r_p / v_p), and cap it for long orbits.
 */
export function chooseTimeStep(s: OrbitState, mu = MU_EARTH): number {
  const el = orbitalElements(s, mu);
  const rp = Math.max(el.periapsis, 1);
  const vp = el.angularMomentum > 0 ? el.angularMomentum / rp : norm(s.v);
  let dt = (0.005 * rp) / Math.max(vp, 1);
  if (el.period) dt = Math.min(dt, el.period / 2000);
  return Math.min(Math.max(dt, 0.05), 60);
}

export interface OrbitRunOptions {
  dt?: number;
  method?: 'verlet' | 'rk4';
  mu?: number;
  bodyRadius?: number;
  /** Stop once the satellite is farther than this from the centre, m */
  maxRadius?: number;
}

export type StopReason = 'none' | 'impact' | 'escaped';

/**
 * Advance a state by `duration` seconds using fixed sub-steps.
 * Stops early (and reports why) if the satellite hits the surface or leaves the view.
 */
export function propagate(
  s: OrbitState,
  duration: number,
  opts: OrbitRunOptions = {},
): { state: OrbitState; stop: StopReason; path: Vec2[] } {
  const mu = opts.mu ?? MU_EARTH;
  const R = opts.bodyRadius ?? R_EARTH;
  const maxR = opts.maxRadius ?? Infinity;
  const dt = opts.dt ?? chooseTimeStep(s, mu);
  const step = opts.method === 'rk4' ? rk4Step : verletStep;
  let cur = s;
  const path: Vec2[] = [];
  const steps = Math.max(1, Math.ceil(duration / dt));
  const h = duration / steps;
  for (let k = 0; k < steps; k++) {
    cur = step(cur, h, mu);
    const d = norm(cur.r);
    if (!Number.isFinite(d)) throw new Error('Numerical instability: state became non-finite.');
    if (d <= R) return { state: cur, stop: 'impact', path };
    if (d >= maxR) return { state: cur, stop: 'escaped', path };
    if (k % 4 === 0) path.push(cur.r);
  }
  path.push(cur.r);
  return { state: cur, stop: 'none', path };
}
