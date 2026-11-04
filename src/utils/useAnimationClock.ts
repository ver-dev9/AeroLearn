import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Plays back a PRE-COMPUTED simulation over `duration` seconds of
 * simulated time. The animation only chooses which already-computed sample
 * to show; it never alters the physics.
 *
 * @param duration   simulated seconds to play
 * @param playSeconds real seconds the playback should take
 */
export function useAnimationClock(duration: number, playSeconds: number) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  const tRef = useRef(0);

  const stop = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
    last.current = null;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const rate = duration / Math.max(0.1, playSeconds);
    const tick = (now: number) => {
      if (last.current === null) last.current = now;
      const dt = (now - last.current) / 1000;
      last.current = now;
      const next = Math.min(duration, tRef.current + dt * rate);
      tRef.current = next;
      setT(next);
      if (next >= duration) {
        setPlaying(false);
        stop();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return stop;
  }, [playing, duration, playSeconds, stop]);

  const play = useCallback(() => {
    if (tRef.current >= duration) {
      tRef.current = 0;
      setT(0);
    }
    setPlaying(true);
  }, [duration]);

  const pause = useCallback(() => setPlaying(false), []);

  const reset = useCallback(() => {
    setPlaying(false);
    stop();
    tRef.current = 0;
    setT(0);
  }, [stop]);

  const finish = useCallback(() => {
    setPlaying(false);
    stop();
    tRef.current = duration;
    setT(duration);
  }, [duration, stop]);

  /** Rewind to t = 0 and play (used whenever a new result is computed). */
  const restart = useCallback(() => {
    stop();
    tRef.current = 0;
    setT(0);
    setPlaying(false);
    requestAnimationFrame(() => setPlaying(true));
  }, [stop]);

  return { t, playing, play, pause, reset, finish, restart };
}

/** Linear interpolation into a time-sorted sample array. */
export function sampleAt<T extends { t: number }>(samples: T[], t: number, keys: (keyof T)[]): Partial<Record<keyof T, number>> {
  if (!samples.length) return {};
  if (t <= samples[0].t) return Object.fromEntries(keys.map((k) => [k, samples[0][k] as unknown as number])) as Partial<Record<keyof T, number>>;
  const lastS = samples[samples.length - 1];
  if (t >= lastS.t) return Object.fromEntries(keys.map((k) => [k, lastS[k] as unknown as number])) as Partial<Record<keyof T, number>>;
  let lo = 0;
  let hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].t <= t) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const f = (t - a.t) / (b.t - a.t || 1);
  return Object.fromEntries(keys.map((k) => [k, (a[k] as unknown as number) + ((b[k] as unknown as number) - (a[k] as unknown as number)) * f])) as Partial<Record<keyof T, number>>;
}
