import { isa, analyseWing, liftForce, liftCoefficient, liftCurveSlope, exponentialDensity, validateWing, WingInput } from '../index';

describe('ISA atmosphere', () => {
  it('sea level: 288.15 K, 101325 Pa, 1.225 kg/m³', () => {
    const s = isa(0);
    expect(s.temperature).toBeCloseTo(288.15, 6);
    expect(s.pressure).toBeCloseTo(101325, 3);
    expect(s.density).toBeCloseTo(1.225, 3);
  });

  it('matches published ISA tables', () => {
    expect(isa(5000).density).toBeCloseTo(0.7364, 3);
    expect(isa(11000).temperature).toBeCloseTo(216.65, 6);
    expect(isa(11000).density).toBeCloseTo(0.3639, 3);
    expect(isa(20000).density).toBeCloseTo(0.0880, 3);
  });

  it('exponential model equals ρ0 at sea level and ρ0/e at one scale height', () => {
    expect(exponentialDensity(0)).toBeCloseTo(1.225, 9);
    expect(exponentialDensity(8500)).toBeCloseTo(1.225 / Math.E, 9);
  });
});

describe('lift equation', () => {
  it('L = ½ρv²SC_L', () => {
    expect(liftForce(1.225, 50, 16, 0.5)).toBeCloseTo(0.5 * 1.225 * 2500 * 16 * 0.5, 9);
  });

  it('lift scales with v² and linearly with S', () => {
    const a = liftForce(1.225, 40, 10, 0.6);
    expect(liftForce(1.225, 80, 10, 0.6) / a).toBeCloseTo(4, 12);
    expect(liftForce(1.225, 40, 30, 0.6) / a).toBeCloseTo(3, 12);
  });

  it('finite-wing slope is below 2π and tends to 2π as AR → ∞', () => {
    expect(liftCurveSlope(8)).toBeLessThan(2 * Math.PI);
    expect(liftCurveSlope(1e6)).toBeCloseTo(2 * Math.PI, 3);
  });

  it('C_L is zero at the zero-lift angle and flags stall beyond α_stall', () => {
    expect(liftCoefficient(-2, 8).cl).toBeCloseTo(0, 12);
    expect(liftCoefficient(10, 8).stalled).toBe(false);
    const s = liftCoefficient(20, 8);
    expect(s.stalled).toBe(true);
    expect(s.cl).toBeLessThan(s.clMax);
  });
});

describe('wing analysis', () => {
  const cessna: WingInput = { airspeed: 55, wingArea: 16.2, angleOfAttackDeg: 4, altitude: 0, mass: 1100, aspectRatio: 7.4 };

  it('a light aircraft at cruise produces lift of the same order as its weight', () => {
    const r = analyseWing(cessna);
    expect(r.lift / r.weight).toBeGreaterThan(0.7);
    expect(r.lift / r.weight).toBeLessThan(1.6);
    expect(r.liftToDrag).toBeGreaterThan(5);
  });

  it('at the stall speed and C_L,max lift equals weight', () => {
    const r = analyseWing(cessna);
    const L = liftForce(r.density, r.stallSpeed, cessna.wingArea, r.clMax);
    expect(L).toBeCloseTo(r.weight, 6);
  });

  it('higher altitude → lower density → less lift at the same airspeed', () => {
    expect(analyseWing({ ...cessna, altitude: 3000 }).lift).toBeLessThan(analyseWing(cessna).lift);
  });

  it('validates inputs', () => {
    expect(validateWing({ ...cessna, wingArea: 0 })).toHaveLength(1);
    expect(validateWing({ ...cessna, angleOfAttackDeg: 40 })).toHaveLength(1);
  });
});
