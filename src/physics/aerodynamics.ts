/**
 * Simplified fixed-wing aerodynamics (Aerodynamics Lab).
 *
 *   Lift:  L = ½ ρ v² S C_L
 *   Drag:  D = ½ ρ v² S C_D
 *
 * Lift coefficient — thin-aerofoil theory corrected for a finite wing
 * (Helmbold / lifting-line approximation):
 *   a₀ = 2π per radian (2-D lift-curve slope)
 *   a  = a₀ / (1 + a₀ / (π e AR))
 *   C_L = a (α − α₀)                       for α ≤ α_stall
 * Past the stall angle the attached-flow model is invalid; we show a crude
 * post-stall drop purely to illustrate that lift collapses, and flag it.
 *
 * Drag polar:  C_D = C_D0 + C_L² / (π e AR)   (parasite + induced drag)
 *
 * Air density from the ISA model (see atmosphere.ts).
 *
 * Limits: incompressible, steady, no Reynolds-number or Mach effects, no
 * flaps, no fuselage/tail contributions. Not a substitute for wind-tunnel
 * data or CFD.
 */
import { DEG, G0 } from './constants';
import { isa } from './atmosphere';
import { checkRange, collect, PhysicsInputError, ValidationIssue } from './validation';

export interface WingInput {
  /** True airspeed, m/s */
  airspeed: number;
  /** Wing reference area S, m² */
  wingArea: number;
  /** Angle of attack α, degrees */
  angleOfAttackDeg: number;
  /** Pressure altitude, m (ISA) */
  altitude: number;
  /** Aircraft mass, kg (for weight comparison) */
  mass: number;
  /** Aspect ratio AR = b²/S */
  aspectRatio: number;
  /** Zero-lift angle α₀, degrees (negative for cambered aerofoils) */
  zeroLiftAngleDeg?: number;
  /** Oswald efficiency e */
  oswald?: number;
  /** Parasite drag coefficient C_D0 */
  cd0?: number;
  /** Stall angle, degrees */
  stallAngleDeg?: number;
}

export interface WingResult {
  density: number;
  dynamicPressure: number;
  liftCurveSlope: number; // per radian
  cl: number;
  cd: number;
  clMax: number;
  lift: number;
  drag: number;
  inducedDrag: number;
  weight: number;
  liftToDrag: number;
  /** Lift minus weight, N (positive → would climb in this idealisation) */
  netVertical: number;
  /** Speed at which L = W at C_L,max, m/s */
  stallSpeed: number;
  /** Thrust needed to balance drag in steady level flight, N */
  thrustRequired: number;
  stalled: boolean;
}

export const WING_LIMITS = {
  airspeed: { min: 0, max: 300 },
  wingArea: { min: 0.1, max: 1000 },
  angleOfAttackDeg: { min: -10, max: 25 },
  altitude: { min: 0, max: 20000 },
  mass: { min: 0.1, max: 600000 },
  aspectRatio: { min: 1, max: 40 },
};

export function validateWing(i: WingInput): ValidationIssue[] {
  return collect(
    checkRange('airspeed', 'Airspeed', i.airspeed, WING_LIMITS.airspeed, 'm/s'),
    checkRange('wingArea', 'Wing area', i.wingArea, WING_LIMITS.wingArea, 'm²'),
    checkRange('angleOfAttackDeg', 'Angle of attack', i.angleOfAttackDeg, WING_LIMITS.angleOfAttackDeg, '°'),
    checkRange('altitude', 'Altitude', i.altitude, WING_LIMITS.altitude, 'm'),
    checkRange('mass', 'Mass', i.mass, WING_LIMITS.mass, 'kg'),
    checkRange('aspectRatio', 'Aspect ratio', i.aspectRatio, WING_LIMITS.aspectRatio),
  );
}

export function liftCurveSlope(aspectRatio: number, oswald = 0.8): number {
  const a0 = 2 * Math.PI;
  return a0 / (1 + a0 / (Math.PI * oswald * aspectRatio));
}

export function liftCoefficient(alphaDeg: number, aspectRatio: number, opts: { zeroLiftAngleDeg?: number; oswald?: number; stallAngleDeg?: number } = {}): { cl: number; stalled: boolean; clMax: number } {
  const a = liftCurveSlope(aspectRatio, opts.oswald ?? 0.8);
  const a0 = opts.zeroLiftAngleDeg ?? -2;
  const stall = opts.stallAngleDeg ?? 15;
  const clMax = a * (stall - a0) * DEG;
  if (alphaDeg <= stall) return { cl: a * (alphaDeg - a0) * DEG, stalled: false, clMax };
  // Illustrative post-stall: C_L falls ~0.05 per degree beyond stall, not below 50 % of C_L,max.
  const cl = Math.max(clMax * 0.5, clMax - 0.05 * (alphaDeg - stall));
  return { cl, stalled: true, clMax };
}

export function liftForce(rho: number, v: number, S: number, cl: number): number {
  return 0.5 * rho * v * v * S * cl;
}

export function analyseWing(i: WingInput): WingResult {
  const issues = validateWing(i);
  if (issues.length) throw new PhysicsInputError(issues);
  const e = i.oswald ?? 0.8;
  const cd0 = i.cd0 ?? 0.025;
  const { density } = isa(i.altitude);
  const q = 0.5 * density * i.airspeed * i.airspeed;
  const { cl, stalled, clMax } = liftCoefficient(i.angleOfAttackDeg, i.aspectRatio, {
    zeroLiftAngleDeg: i.zeroLiftAngleDeg,
    oswald: e,
    stallAngleDeg: i.stallAngleDeg,
  });
  const cdi = (cl * cl) / (Math.PI * e * i.aspectRatio);
  // Separated flow adds a large pressure-drag increment; again illustrative only.
  const cdStall = stalled ? 0.02 * (i.angleOfAttackDeg - (i.stallAngleDeg ?? 15)) : 0;
  const cd = cd0 + cdi + cdStall;
  const lift = q * i.wingArea * cl;
  const drag = q * i.wingArea * cd;
  const weight = i.mass * G0;
  const stallSpeed = Math.sqrt((2 * weight) / (density * i.wingArea * clMax));
  return {
    density,
    dynamicPressure: q,
    liftCurveSlope: liftCurveSlope(i.aspectRatio, e),
    cl,
    cd,
    clMax,
    lift,
    drag,
    inducedDrag: q * i.wingArea * cdi,
    weight,
    liftToDrag: drag > 0 ? lift / drag : 0,
    netVertical: lift - weight,
    stallSpeed,
    thrustRequired: drag,
    stalled,
  };
}

/** Lift vs airspeed sweep for charting (all other inputs fixed). */
export function liftSweep(i: WingInput, vMax: number, n = 40): { v: number; lift: number }[] {
  const out: { v: number; lift: number }[] = [];
  for (let k = 0; k <= n; k++) {
    const v = (vMax * k) / n;
    out.push({ v, lift: analyseWing({ ...i, airspeed: v }).lift });
  }
  return out;
}

/** C_L vs α sweep for charting. */
export function clSweep(aspectRatio: number, from = -6, to = 25, step = 0.5): { alpha: number; cl: number }[] {
  const out: { alpha: number; cl: number }[] = [];
  for (let a = from; a <= to + 1e-9; a += step) out.push({ alpha: a, cl: liftCoefficient(a, aspectRatio).cl });
  return out;
}
