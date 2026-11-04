import {
  MU_EARTH,
  R_EARTH,
  circularSpeed,
  escapeSpeed,
  initialState,
  orbitalElements,
  propagate,
  specificEnergy,
  verletStep,
  rk4Step,
  norm,
  gravity,
  chooseTimeStep,
  validateOrbit,
} from '../index';

const LEO = 400e3;
const r0 = R_EARTH + LEO;

describe('two-body gravity', () => {
  it('a = −μ r/|r|³ has magnitude μ/r² pointing at the centre', () => {
    const a = gravity({ x: r0, y: 0 });
    expect(a.x).toBeCloseTo(-MU_EARTH / (r0 * r0), 9);
    expect(Math.abs(a.y)).toBe(0);
  });

  it('surface gravity ≈ 9.82 m/s² for the mean radius', () => {
    expect(norm(gravity({ x: R_EARTH, y: 0 }))).toBeCloseTo(9.82, 2);
  });
});

describe('analytic orbital elements', () => {
  it('circular speed at 400 km ≈ 7.67 km/s with period ≈ 92.4 min', () => {
    const vc = circularSpeed(r0);
    expect(vc).toBeCloseTo(7672.6, 0);
    const el = orbitalElements(initialState({ altitude: LEO, speed: vc, flightPathAngleDeg: 0 }));
    expect(el.classification).toBe('circular');
    expect(el.eccentricity).toBeLessThan(1e-9);
    expect(el.period! / 60).toBeCloseTo(92.4, 0);
    expect(el.semiMajorAxis).toBeCloseTo(r0, 0);
  });

  it('escape speed gives a parabolic trajectory with ε ≈ 0', () => {
    const ve = escapeSpeed(r0);
    expect(ve / circularSpeed(r0)).toBeCloseTo(Math.SQRT2, 12);
    const s = initialState({ altitude: LEO, speed: ve, flightPathAngleDeg: 0 });
    const el = orbitalElements(s);
    expect(el.classification).toBe('parabolic');
    expect(Math.abs(specificEnergy(s))).toBeLessThan(1e-3);
  });

  it('faster than escape is hyperbolic, slower than circular from the top is elliptical', () => {
    expect(orbitalElements(initialState({ altitude: LEO, speed: 12000, flightPathAngleDeg: 0 })).classification).toBe('hyperbolic');
    const ell = orbitalElements(initialState({ altitude: 20000e3, speed: 3000, flightPathAngleDeg: 0 }));
    expect(ell.classification).toBe('elliptical');
    // Started at apoapsis with a tangential velocity.
    expect(ell.apoapsis).toBeCloseTo(R_EARTH + 20000e3, -1);
  });

  it('flags trajectories whose periapsis is inside the Earth', () => {
    const el = orbitalElements(initialState({ altitude: LEO, speed: 5000, flightPathAngleDeg: 0 }));
    expect(el.classification).toBe('suborbital');
  });

  it('vis-viva holds: v² = μ(2/r − 1/a)', () => {
    const s = initialState({ altitude: 1000e3, speed: 8200, flightPathAngleDeg: 5 });
    const el = orbitalElements(s);
    const v2 = s.v.x ** 2 + s.v.y ** 2;
    expect(v2).toBeCloseTo(MU_EARTH * (2 / norm(s.r) - 1 / el.semiMajorAxis), 3);
  });
});

describe('velocity Verlet integrator', () => {
  it('keeps a circular orbit at constant radius over one full period', () => {
    const s0 = initialState({ altitude: LEO, speed: circularSpeed(r0), flightPathAngleDeg: 0 });
    const T = orbitalElements(s0).period!;
    const dt = chooseTimeStep(s0);
    let s = s0;
    let maxDev = 0;
    while (s.t < T) {
      s = verletStep(s, dt);
      maxDev = Math.max(maxDev, Math.abs(norm(s.r) - r0) / r0);
    }
    expect(maxDev).toBeLessThan(1e-5);
  });

  it('returns to the start point after one Kepler period (closed orbit)', () => {
    const s0 = initialState({ altitude: 2000e3, speed: 7500, flightPathAngleDeg: 0 });
    const el = orbitalElements(s0);
    expect(el.classification).toBe('elliptical');
    const { state } = propagate(s0, el.period!);
    const err = Math.hypot(state.r.x - s0.r.x, state.r.y - s0.r.y);
    expect(err / norm(s0.r)).toBeLessThan(1e-3);
  });

  it('conserves specific energy and angular momentum over 10 eccentric orbits', () => {
    const s0 = initialState({ altitude: 500e3, speed: 9500, flightPathAngleDeg: 0 }); // e ≈ 0.43
    const el0 = orbitalElements(s0);
    expect(el0.eccentricity).toBeGreaterThan(0.3);
    const { state } = propagate(s0, 10 * el0.period!);
    const el1 = orbitalElements(state);
    expect(Math.abs((el1.energy - el0.energy) / el0.energy)).toBeLessThan(1e-4);
    expect(Math.abs((el1.angularMomentum - el0.angularMomentum) / el0.angularMomentum)).toBeLessThan(1e-9);
  });

  it('agrees with RK4 over a short arc', () => {
    const s0 = initialState({ altitude: LEO, speed: 8000, flightPathAngleDeg: 2 });
    let a = s0;
    let b = s0;
    for (let k = 0; k < 600; k++) {
      a = verletStep(a, 1);
      b = rk4Step(b, 1);
    }
    expect(Math.hypot(a.r.x - b.r.x, a.r.y - b.r.y)).toBeLessThan(50); // metres after 10 min
  });

  it('detects impact for a sub-orbital throw', () => {
    const s0 = initialState({ altitude: LEO, speed: 3000, flightPathAngleDeg: 0 });
    expect(propagate(s0, 3600).stop).toBe('impact');
  });

  it('detects escape beyond the view radius', () => {
    const s0 = initialState({ altitude: LEO, speed: 13000, flightPathAngleDeg: 0 });
    expect(propagate(s0, 86400 * 3, { maxRadius: 20 * R_EARTH }).stop).toBe('escaped');
  });

  it('validates inputs', () => {
    expect(validateOrbit({ altitude: 0, speed: 7000, flightPathAngleDeg: 0 })).toHaveLength(1);
    expect(validateOrbit({ altitude: 400e3, speed: -1, flightPathAngleDeg: 0 })).toHaveLength(1);
    expect(validateOrbit({ altitude: 400e3, speed: 7000, flightPathAngleDeg: 90 })).toHaveLength(1);
  });
});

describe('analytic conic for drawing', () => {
  it('the predicted ellipse passes through the start point and the integrated path stays on it', () => {
    const { conicPoints, eccentricityVector } = require('../orbit');
    const s0 = initialState({ altitude: 1000e3, speed: 8500, flightPathAngleDeg: 10 });
    const el = orbitalElements(s0);
    const e = eccentricityVector(s0);
    expect(Math.hypot(e.x, e.y)).toBeCloseTo(el.eccentricity, 9);
    const pts = conicPoints(s0, 1e9, 2000).flat();
    const dist = (p: { x: number; y: number }) => Math.min(...pts.map((q: { x: number; y: number }) => Math.hypot(p.x - q.x, p.y - q.y)));
    expect(dist(s0.r) / norm(s0.r)).toBeLessThan(0.005);
    const later = propagate(s0, el.period! / 3).state;
    expect(dist(later.r) / norm(later.r)).toBeLessThan(0.005);
  });
});
