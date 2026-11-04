import { fmt, fmtSI, niceTicks, fmtDuration } from '../format';
import { sampleAt } from '../useAnimationClock';

describe('formatting never leaks NaN to the UI', () => {
  it('fmt', () => {
    expect(fmt(NaN)).toBe('—');
    expect(fmt(Infinity)).toBe('∞');
    expect(fmt(1234.567, 1)).toBe('1,234.6');
  });
  it('fmtSI', () => {
    expect(fmtSI(12300, 'N')).toBe('12.3 kN');
    expect(fmtSI(5, 'm')).toBe('5 m');
  });
  it('fmtDuration', () => {
    expect(fmtDuration(30)).toBe('30 s');
    expect(fmtDuration(5545)).toBe('92.4 min');
  });
  it('niceTicks covers the range with round steps', () => {
    const t = niceTicks(0, 87, 4);
    expect(t[0]).toBe(0);
    expect(t).toEqual([0, 20, 40, 60, 80]);
  });
});

describe('sampleAt interpolation', () => {
  const s = [
    { t: 0, v: 0 },
    { t: 1, v: 10 },
    { t: 2, v: 30 },
  ];
  it('interpolates linearly and clamps at the ends', () => {
    expect(sampleAt(s, 0.5, ['v']).v).toBe(5);
    expect(sampleAt(s, 1.5, ['v']).v).toBe(20);
    expect(sampleAt(s, -1, ['v']).v).toBe(0);
    expect(sampleAt(s, 9, ['v']).v).toBe(30);
  });
});
