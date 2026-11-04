/**
 * Simplified single-stage vertical rocket (Rocket Lab).
 *
 * Equation of motion (1-D, positive up), from Newton's second law applied to
 * the variable-mass system with thrust treated as an external force:
 *
 *   m(t) dv/dt = F(t) − m(t) g(h) − D(h, v)
 *
 *   m(t) = m₀ − ṁ t   for t ≤ t_b,   ṁ = m_fuel / t_b   (constant burn rate)
 *   F(t) = F          for t ≤ t_b, 0 afterwards
 *   g(h) = g₀ (R⊕ / (R⊕ + h))²                         (inverse-square gravity)
 *   D    = ½ ρ(h) v |v| C_d A                          (quadratic drag, opposes v)
 *   ρ(h) = ρ₀ e^(−h/H)                                 (exponential atmosphere)
 *
 * Effective exhaust velocity v_e = F / ṁ and specific impulse I_sp = v_e / g₀.
 * Without drag and with constant g, the burnout speed is the Tsiolkovsky
 * result minus gravity loss:  v_b = v_e ln(m₀/m_f) − g t_b  (used in tests).
 *
 * Integrated with classical RK4 at a fixed step; the burnout instant is hit
 * exactly by shortening the step that crosses it.
 *
 * Not modelled: pitch/gravity turn, staging, wind, thrust variation with
 * altitude, Mach-dependent drag, structural limits, guidance. This is an
 * educational model, NOT a launch prediction tool.
 */
import { G0, R_EARTH } from './constants';
import { exponentialDensity } from './atmosphere';
import { checkRange, collect, PhysicsInputError, ValidationIssue } from './validation';

export interface RocketInput {
  /** Initial (lift-off) mass including fuel, kg */
  initialMass: number;
  /** Fuel (propellant) mass, kg — must be less than the initial mass */
  fuelMass: number;
  /** Engine thrust, N (constant while fuel remains) */
  thrust: number;
  /** Burn duration, s */
  burnTime: number;
  /** Drag coefficient C_d (dimensionless) */
  dragCoefficient: number;
  /** Body diameter used for reference area A = π d²/4, m */
  diameter: number;
  /** Include aerodynamic drag */
  dragEnabled: boolean;
  /** Use inverse-square gravity (true) or constant g₀ (false) */
  variableGravity?: boolean;
}

export interface RocketSample {
  t: number;
  altitude: number;
  velocity: number;
  acceleration: number;
  mass: number;
  fuelRemaining: number;
  thrust: number;
  drag: number;
}

export interface RocketResult {
  samples: RocketSample[];
  maxAltitude: number;
  timeAtApogee: number;
  maxVelocity: number;
  burnoutAltitude: number;
  burnoutVelocity: number;
  maxAcceleration: number;
  flightTime: number;
  exhaustVelocity: number;
  specificImpulse: number;
  idealDeltaV: number;
  thrustToWeight: number;
  liftedOff: boolean;
  landed: boolean;
}

export const ROCKET_LIMITS = {
  initialMass: { min: 0.05, max: 1e7 },
  fuelMass: { min: 0, max: 1e7 },
  thrust: { min: 0, max: 1e8 },
  burnTime: { min: 0, max: 1000, exclusiveMin: true },
  dragCoefficient: { min: 0, max: 2 },
  diameter: { min: 0.01, max: 20 },
};

export function validateRocket(i: RocketInput): ValidationIssue[] {
  const issues = collect(
    checkRange('initialMass', 'Initial mass', i.initialMass, ROCKET_LIMITS.initialMass, 'kg'),
    checkRange('fuelMass', 'Fuel mass', i.fuelMass, ROCKET_LIMITS.fuelMass, 'kg'),
    checkRange('thrust', 'Thrust', i.thrust, ROCKET_LIMITS.thrust, 'N'),
    checkRange('burnTime', 'Burn time', i.burnTime, ROCKET_LIMITS.burnTime, 's'),
    checkRange('dragCoefficient', 'Drag coefficient', i.dragCoefficient, ROCKET_LIMITS.dragCoefficient),
    checkRange('diameter', 'Diameter', i.diameter, ROCKET_LIMITS.diameter, 'm'),
  );
  if (!issues.length && i.fuelMass >= i.initialMass) {
    issues.push({ field: 'fuelMass', message: 'Fuel mass must be less than the initial mass (the rocket needs a dry structure).' });
  }
  return issues;
}

interface Deriv {
  dh: number;
  dv: number;
}

export function simulateRocket(i: RocketInput, opts: { dt?: number; maxTime?: number } = {}): RocketResult {
  const issues = validateRocket(i);
  if (issues.length) throw new PhysicsInputError(issues);

  const dt = opts.dt ?? Math.min(0.05, i.burnTime / 200);
  const maxTime = opts.maxTime ?? 3600;
  const mdot = i.fuelMass / i.burnTime;
  const area = (Math.PI * i.diameter * i.diameter) / 4;
  const dryMass = i.initialMass - i.fuelMass;
  const variableG = i.variableGravity ?? true;

  const massAt = (t: number) => (t < i.burnTime ? i.initialMass - mdot * t : dryMass);
  const thrustAt = (t: number) => (t < i.burnTime && i.fuelMass > 0 ? i.thrust : 0);
  const gAt = (h: number) => (variableG ? G0 * Math.pow(R_EARTH / (R_EARTH + Math.max(0, h)), 2) : G0);
  const dragAt = (h: number, v: number) =>
    i.dragEnabled ? 0.5 * exponentialDensity(h) * v * Math.abs(v) * i.dragCoefficient * area : 0;

  // Ground contact: before lift-off (or after landing) the pad supplies a normal force,
  // so the rocket cannot accelerate downward through the ground.
  let onGround = true;
  const deriv = (t: number, h: number, v: number): Deriv => {
    const m = massAt(t);
    const a = (thrustAt(t) - m * gAt(h) - dragAt(h, v)) / m;
    if (onGround && h <= 0 && a <= 0 && v <= 0) return { dh: 0, dv: 0 };
    return { dh: v, dv: a };
  };

  const samples: RocketSample[] = [];
  let t = 0;
  let h = 0;
  let v = 0;
  let liftedOff = false;
  let landed = false;
  let maxAltitude = 0;
  let timeAtApogee = 0;
  let maxVelocity = 0;
  let maxAcceleration = 0;
  let burnoutAltitude = 0;
  let burnoutVelocity = 0;
  let burnoutRecorded = false;

  const record = () => {
    const d = deriv(t, h, v);
    const m = massAt(t);
    samples.push({
      t,
      altitude: h,
      velocity: v,
      acceleration: d.dv,
      mass: m,
      fuelRemaining: Math.max(0, m - dryMass),
      thrust: thrustAt(t),
      drag: dragAt(h, v),
    });
    maxAcceleration = Math.max(maxAcceleration, Math.abs(d.dv));
  };
  record();

  let stepCount = 0;
  while (t < maxTime) {
    let step = dt;
    // Land exactly on the burnout instant so thrust cut-off is resolved precisely.
    if (t < i.burnTime && t + step > i.burnTime) step = i.burnTime - t;
    if (step <= 1e-12) step = dt;

    const k1 = deriv(t, h, v);
    const k2 = deriv(t + step / 2, h + (k1.dh * step) / 2, v + (k1.dv * step) / 2);
    const k3 = deriv(t + step / 2, h + (k2.dh * step) / 2, v + (k2.dv * step) / 2);
    const k4 = deriv(t + step, h + k3.dh * step, v + k3.dv * step);
    let hn = h + (step / 6) * (k1.dh + 2 * k2.dh + 2 * k3.dh + k4.dh);
    let vn = v + (step / 6) * (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv);
    let tn = t + step;

    if (!Number.isFinite(hn) || !Number.isFinite(vn)) {
      throw new Error('Numerical instability in rocket integration.');
    }

    if (hn > 0) {
      onGround = false;
      liftedOff = true;
    }

    if (liftedOff && hn <= 0) {
      // Linear interpolation to the ground-impact instant.
      const frac = h / (h - hn);
      tn = t + step * frac;
      vn = v + (vn - v) * frac;
      hn = 0;
      t = tn;
      h = hn;
      v = vn;
      record();
      landed = true;
      break;
    }

    t = tn;
    h = hn;
    v = vn;

    if (h > maxAltitude) {
      maxAltitude = h;
      timeAtApogee = t;
    }
    maxVelocity = Math.max(maxVelocity, v);
    if (!burnoutRecorded && t >= i.burnTime - 1e-9) {
      burnoutAltitude = h;
      burnoutVelocity = v;
      burnoutRecorded = true;
    }

    stepCount++;
    // Keep ~ every 0.25 s of samples for charts; always keep the burnout point.
    if (stepCount % Math.max(1, Math.round(0.25 / dt)) === 0 || Math.abs(t - i.burnTime) < 1e-9) record();

    // Never lifted off and engine is out: nothing else will happen.
    if (!liftedOff && t >= i.burnTime) break;
  }

  const exhaustVelocity = mdot > 0 ? i.thrust / mdot : 0;
  return {
    samples,
    maxAltitude,
    timeAtApogee,
    maxVelocity,
    burnoutAltitude,
    burnoutVelocity,
    maxAcceleration,
    flightTime: t,
    exhaustVelocity,
    specificImpulse: exhaustVelocity / G0,
    idealDeltaV: exhaustVelocity * Math.log(i.initialMass / dryMass),
    thrustToWeight: i.thrust / (i.initialMass * G0),
    liftedOff,
    landed,
  };
}
