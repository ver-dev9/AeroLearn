/**
 * Local progress store. Everything is persisted on-device with AsyncStorage;
 * no account or network is required.
 */
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LabId = 'flight' | 'orbit' | 'rocket' | 'aero';

export interface SavedExperiment {
  id: string;
  lab: LabId;
  title: string;
  params: Record<string, number | boolean | string>;
  summary: string;
  savedAt: string;
}

export interface ChallengeAttempt {
  challengeId: string;
  correct: boolean;
  answer: string;
  at: string;
}

export interface SimRun {
  lab: LabId;
  summary: string;
  at: string;
}

export interface ProgressState {
  version: 1;
  profileName: string;
  createdAt: string;
  completedLessons: string[];
  lessonChecks: Record<string, boolean>;
  lastLessonId: string | null;
  simRuns: SimRun[];
  labRunCounts: Record<LabId, number>;
  challengeHistory: ChallengeAttempt[];
  solvedChallenges: string[];
  savedExperiments: SavedExperiment[];
}

const KEY = 'aerolearn.progress.v1';

const initial = (): ProgressState => ({
  version: 1,
  profileName: 'Explorer',
  createdAt: new Date().toISOString(),
  completedLessons: [],
  lessonChecks: {},
  lastLessonId: null,
  simRuns: [],
  labRunCounts: { flight: 0, orbit: 0, rocket: 0, aero: 0 },
  challengeHistory: [],
  solvedChallenges: [],
  savedExperiments: [],
});

/** Defensive merge so a corrupted or older save never crashes the app. */
function hydrate(raw: unknown): ProgressState {
  const base = initial();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<ProgressState>;
  const arr = <T,>(v: unknown, d: T[]): T[] => (Array.isArray(v) ? (v as T[]) : d);
  return {
    ...base,
    profileName: typeof r.profileName === 'string' && r.profileName.trim() ? r.profileName : base.profileName,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : base.createdAt,
    completedLessons: arr(r.completedLessons, []),
    lessonChecks: r.lessonChecks && typeof r.lessonChecks === 'object' ? r.lessonChecks : {},
    lastLessonId: typeof r.lastLessonId === 'string' ? r.lastLessonId : null,
    simRuns: arr(r.simRuns, []),
    labRunCounts: { ...base.labRunCounts, ...(r.labRunCounts ?? {}) },
    challengeHistory: arr(r.challengeHistory, []),
    solvedChallenges: arr(r.solvedChallenges, []),
    savedExperiments: arr(r.savedExperiments, []),
  };
}

interface Ctx {
  state: ProgressState;
  ready: boolean;
  setProfileName: (name: string) => void;
  openLesson: (id: string) => void;
  completeLesson: (id: string) => void;
  recordLessonCheck: (key: string, correct: boolean) => void;
  recordSimRun: (lab: LabId, summary: string) => void;
  recordChallenge: (challengeId: string, answer: string, correct: boolean) => void;
  saveExperiment: (e: Omit<SavedExperiment, 'id' | 'savedAt'>) => void;
  deleteExperiment: (id: string) => void;
  resetAll: () => void;
}

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(initial);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((s) => {
        if (!alive) return;
        if (s) {
          try {
            setState(hydrate(JSON.parse(s)));
          } catch {
            setState(initial());
          }
        }
      })
      .catch(() => {})
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // Debounced persistence.
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
    }, 300);
  }, [state, ready]);

  const update = useCallback((fn: (s: ProgressState) => ProgressState) => setState((s) => fn(s)), []);

  const api = useMemo<Ctx>(
    () => ({
      state,
      ready,
      setProfileName: (name) => update((s) => ({ ...s, profileName: name.slice(0, 40) || 'Explorer' })),
      openLesson: (id) => update((s) => ({ ...s, lastLessonId: id })),
      completeLesson: (id) =>
        update((s) => (s.completedLessons.includes(id) ? s : { ...s, completedLessons: [...s.completedLessons, id], lastLessonId: id })),
      recordLessonCheck: (key, correct) => update((s) => ({ ...s, lessonChecks: { ...s.lessonChecks, [key]: correct || !!s.lessonChecks[key] } })),
      recordSimRun: (lab, summary) =>
        update((s) => ({
          ...s,
          simRuns: [{ lab, summary, at: new Date().toISOString() }, ...s.simRuns].slice(0, 30),
          labRunCounts: { ...s.labRunCounts, [lab]: (s.labRunCounts[lab] ?? 0) + 1 },
        })),
      recordChallenge: (challengeId, answer, correct) =>
        update((s) => ({
          ...s,
          challengeHistory: [{ challengeId, answer, correct, at: new Date().toISOString() }, ...s.challengeHistory].slice(0, 200),
          solvedChallenges: correct && !s.solvedChallenges.includes(challengeId) ? [...s.solvedChallenges, challengeId] : s.solvedChallenges,
        })),
      saveExperiment: (e) =>
        update((s) => ({
          ...s,
          savedExperiments: [{ ...e, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, savedAt: new Date().toISOString() }, ...s.savedExperiments].slice(0, 50),
        })),
      deleteExperiment: (id) => update((s) => ({ ...s, savedExperiments: s.savedExperiments.filter((x) => x.id !== id) })),
      resetAll: () => setState(initial()),
    }),
    [state, ready, update],
  );

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Ctx {
  const c = useContext(ProgressContext);
  if (!c) throw new Error('useProgress must be used inside ProgressProvider');
  return c;
}
