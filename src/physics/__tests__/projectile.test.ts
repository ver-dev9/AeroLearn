import { solveProjectile, projectilePosition, validateProjectile, PhysicsInputError, G0 } from '../index';

describe('projectile motion (analytic, no drag)', () => {
  it('matches textbook values for v0 = 20 m/s, θ = 45°, g = 9.81', () => {
    const r = solveProjectile({ v0: 20, angleDeg: 45, g: 9.81 });
    // R = v0² / g at 45°
    expect(r.range).toBeCloseTo(400 / 9.81, 9);
    // H = v0² / (4g) at 45°
    expect(r.maxHeight).toBeCloseTo(400 / (4 * 9.81), 9);
    // T = 2 v0 sinθ / g = √2 · 20 / 9.81
    expect(r.timeOfFlight).toBeCloseTo((Math.SQRT2 * 20) / 9.81, 9);
  });

  it('lands back at y = 0 at t = T and x = R', () => {
    const input = { v0: 35, angleDeg: 30, g: G0 };
    const r = solveProjectile(input);
    const p = projectilePosition(input, r.timeOfFlight);
    expect(Math.abs(p.y)).toBeLessThan(1e-9);
    expect(p.x).toBeCloseTo(r.range, 9);
  });

  it('reaches maximum height at T/2', () => {
    const input = { v0: 50, angleDeg: 60, g: 3.71 };
    const r = solveProjectile(input);
    expect(projectilePosition(input, r.timeToApex).y).toBeCloseTo(r.maxHeight, 9);
  });

  it('complementary angles give the same range', () => {
    const a = solveProjectile({ v0: 30, angleDeg: 25, g: 9.81 });
    const b = solveProjectile({ v0: 30, angleDeg: 65, g: 9.81 });
    expect(a.range).toBeCloseTo(b.range, 9);
  });

  it('45° maximises range', () => {
    const best = solveProjectile({ v0: 30, angleDeg: 45, g: 9.81 }).range;
    for (const ang of [10, 30, 44, 46, 60, 80]) {
      expect(solveProjectile({ v0: 30, angleDeg: ang, g: 9.81 }).range).toBeLessThan(best);
    }
  });

  it('range scales as 1/g (Moon vs Earth)', () => {
    const earth = solveProjectile({ v0: 30, angleDeg: 40, g: 9.81 }).range;
    const moon = solveProjectile({ v0: 30, angleDeg: 40, g: 1.62 }).range;
    expect(moon / earth).toBeCloseTo(9.81 / 1.62, 9);
  });

  it('vertical launch has zero range', () => {
    expect(solveProjectile({ v0: 10, angleDeg: 90, g: 9.81 }).range).toBe(0);
  });

  it('samples are monotonic in time and bounded by H', () => {
    const r = solveProjectile({ v0: 40, angleDeg: 50, g: 9.81 }, 60);
    expect(r.samples).toHaveLength(61);
    for (let i = 1; i < r.samples.length; i++) {
      expect(r.samples[i].t).toBeGreaterThan(r.samples[i - 1].t);
      expect(r.samples[i].y).toBeLessThanOrEqual(r.maxHeight + 1e-9);
    }
  });

  it('rejects invalid inputs instead of returning NaN', () => {
    expect(validateProjectile({ v0: 0, angleDeg: 45, g: 9.81 })).toHaveLength(1);
    expect(validateProjectile({ v0: 10, angleDeg: 95, g: 9.81 })).toHaveLength(1);
    expect(validateProjectile({ v0: 10, angleDeg: 45, g: 0 })).toHaveLength(1);
    expect(validateProjectile({ v0: NaN, angleDeg: 45, g: 9.81 })).toHaveLength(1);
    expect(() => solveProjectile({ v0: -5, angleDeg: 45, g: 9.81 })).toThrow(PhysicsInputError);
  });
});
