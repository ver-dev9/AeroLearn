import { simulateRocket, validateRocket, G0, RocketInput } from '../index';

const base: RocketInput = {
  initialMass: 1000,
  fuelMass: 600,
  thrust: 30000,
  burnTime: 60,
  dragCoefficient: 0.5,
  diameter: 0.5,
  dragEnabled: false,
  variableGravity: false,
};

describe('variable-mass rocket', () => {
  it('burnout velocity matches Tsiolkovsky minus gravity loss (no drag, constant g)', () => {
    const r = simulateRocket(base, { dt: 0.01 });
    const mdot = base.fuelMass / base.burnTime;
    const ve = base.thrust / mdot;
    const expected = ve * Math.log(base.initialMass / (base.initialMass - base.fuelMass)) - G0 * base.burnTime;
    expect(r.burnoutVelocity).toBeCloseTo(expected, 2);
    expect(r.exhaustVelocity).toBeCloseTo(3000, 9);
    expect(r.specificImpulse).toBeCloseTo(3000 / G0, 9);
  });

  it('burnout altitude matches the analytic integral (no drag, constant g)', () => {
    const r = simulateRocket(base, { dt: 0.01 });
    const mdot = base.fuelMass / base.burnTime;
    const ve = base.thrust / mdot;
    const m0 = base.initialMass;
    const tb = base.burnTime;
    const mf = m0 - mdot * tb;
    // h(t_b) = v_e [ t_b − (m_f/ṁ) ln(m0/m_f) ] − ½ g t_b²
    const expected = ve * (tb - (mf / mdot) * Math.log(m0 / mf)) - 0.5 * G0 * tb * tb;
    expect(r.burnoutAltitude / expected).toBeCloseTo(1, 4);
  });

  it('coasting apogee matches ballistic formula h_b + v_b²/(2g)', () => {
    const r = simulateRocket(base, { dt: 0.01 });
    const expected = r.burnoutAltitude + (r.burnoutVelocity ** 2) / (2 * G0);
    expect(r.maxAltitude / expected).toBeCloseTo(1, 4);
  });

  it('mass decreases linearly then stays at dry mass', () => {
    const r = simulateRocket(base, { dt: 0.05 });
    const mid = r.samples.find((s) => s.t >= 30)!;
    expect(mid.mass).toBeCloseTo(1000 - 10 * mid.t, 6);
    const late = r.samples.find((s) => s.t > 70)!;
    expect(late.mass).toBe(400);
    expect(late.fuelRemaining).toBe(0);
    expect(late.thrust).toBe(0);
  });

  it('drag lowers apogee', () => {
    const noDrag = simulateRocket(base);
    const withDrag = simulateRocket({ ...base, dragEnabled: true });
    expect(withDrag.maxAltitude).toBeLessThan(noDrag.maxAltitude);
    expect(withDrag.maxAltitude).toBeGreaterThan(0);
  });

  it('stays on the pad when thrust never exceeds weight (even at dry mass)', () => {
    // Dry weight = 400 kg × g ≈ 3923 N, so 3000 N can never lift it.
    const r = simulateRocket({ ...base, thrust: 3000 });
    expect(r.thrustToWeight).toBeLessThan(1);
    expect(r.liftedOff).toBe(false);
    expect(r.maxAltitude).toBe(0);
  });

  it('lifts off late once burning propellant makes thrust exceed weight', () => {
    // 5000 N < initial weight 9807 N, but > weight once mass < 510 kg (t ≈ 49 s).
    const r = simulateRocket({ ...base, thrust: 5000 });
    expect(r.thrustToWeight).toBeLessThan(1);
    expect(r.liftedOff).toBe(true);
    const firstUp = r.samples.find((s) => s.altitude > 0)!;
    expect(firstUp.t).toBeGreaterThan(48);
  });

  it('lands and reports landing', () => {
    const r = simulateRocket({ ...base, dragEnabled: true, variableGravity: true });
    expect(r.landed).toBe(true);
    expect(r.samples[r.samples.length - 1].altitude).toBe(0);
  });

  it('rejects physically impossible input', () => {
    expect(validateRocket({ ...base, fuelMass: 1000 })).toHaveLength(1);
    expect(validateRocket({ ...base, burnTime: 0 })).toHaveLength(1);
    expect(validateRocket({ ...base, thrust: -1 })).toHaveLength(1);
  });
});
