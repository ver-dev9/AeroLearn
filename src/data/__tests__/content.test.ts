import { CHALLENGES, checkNumeric, dailyChallenge, NumericChallenge } from '../challenges';
import { LESSONS } from '../lessons';

describe('challenge bank integrity', () => {
  it('has unique ids and covers every topic', () => {
    const ids = CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of ['projectile', 'orbit', 'rocket', 'aero', 'concept']) {
      expect(CHALLENGES.some((c) => c.topic === t)).toBe(true);
    }
  });

  it('numeric answers are finite and accept themselves but reject 10 % errors', () => {
    for (const c of CHALLENGES.filter((x): x is NumericChallenge => x.kind === 'numeric')) {
      expect(Number.isFinite(c.answer)).toBe(true);
      expect(checkNumeric(c, c.answer)).toBe(true);
      expect(checkNumeric(c, c.answer * 1.1)).toBe(false);
    }
  });

  it('multiple-choice answers point at a real option', () => {
    for (const c of CHALLENGES) {
      if (c.kind === 'mcq') expect(c.correctIndex).toBeLessThan(c.options.length);
    }
  });

  it('known reference values', () => {
    const geo = CHALLENGES.find((c) => c.id === 'orbit-geo') as NumericChallenge;
    expect(geo.answer).toBeGreaterThan(35700);
    expect(geo.answer).toBeLessThan(35900); // ≈ 35 786 km above the equator
    const vc = CHALLENGES.find((c) => c.id === 'orbit-vc-leo') as NumericChallenge;
    expect(vc.answer).toBeCloseTo(7672.6, 0);
  });

  it('daily challenge is always defined', () => {
    for (const d of [-5, 0, 1, 200, 365, 1000]) expect(dailyChallenge(d)).toBeDefined();
  });
});

describe('lesson library integrity', () => {
  it('has the eight required topics with complete content', () => {
    expect(LESSONS.map((l) => l.id)).toEqual(['newton', 'projectile', 'circular', 'gravitation', 'orbital', 'rocket', 'aero', 'flight']);
    for (const l of LESSONS) {
      expect(l.sections.length).toBeGreaterThan(0);
      expect(l.equations.length).toBeGreaterThan(0);
      expect(l.example.steps.length).toBeGreaterThan(0);
      expect(l.checks.length).toBeGreaterThan(0);
      for (const c of l.checks) expect(c.correct).toBeLessThan(c.options.length);
      expect(l.example.answer).not.toMatch(/NaN|Infinity/);
    }
  });
});
