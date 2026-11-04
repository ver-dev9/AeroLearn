import type { ProgressState } from '../store/progress';
import { CHALLENGES } from './challenges';
import { LESSONS } from './lessons';

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  /** Returns progress 0..1 */
  progress: (s: ProgressState) => number;
}

const topicSolved = (s: ProgressState, topic: string) => {
  const ids = CHALLENGES.filter((c) => c.topic === topic).map((c) => c.id);
  return ids.filter((id) => s.solvedChallenges.includes(id)).length / ids.length;
};

// Badges reward understanding and exploration, never speed.
export const BADGES: BadgeDef[] = [
  { id: 'first-launch', title: 'First Launch', description: 'Run any simulation', progress: (s) => (s.simRuns.length > 0 ? 1 : 0) },
  {
    id: 'lab-explorer',
    title: 'Lab Explorer',
    description: 'Run all four labs',
    progress: (s) => Object.values(s.labRunCounts).filter((n) => n > 0).length / 4,
  },
  { id: 'scholar', title: 'Scholar', description: 'Complete 4 lessons', progress: (s) => Math.min(1, s.completedLessons.length / 4) },
  { id: 'librarian', title: 'Full Library', description: 'Complete every lesson', progress: (s) => s.completedLessons.length / LESSONS.length },
  { id: 'ballistician', title: 'Ballistician', description: 'Solve all projectile challenges', progress: (s) => topicSolved(s, 'projectile') },
  { id: 'orbital', title: 'Orbital Mechanic', description: 'Solve all orbit challenges', progress: (s) => topicSolved(s, 'orbit') },
  { id: 'propulsion', title: 'Propulsion Engineer', description: 'Solve all rocket challenges', progress: (s) => topicSolved(s, 'rocket') },
  { id: 'aerodynamicist', title: 'Aerodynamicist', description: 'Solve all aerodynamics challenges', progress: (s) => topicSolved(s, 'aero') },
  {
    id: 'persistent',
    title: 'Persistent Thinker',
    description: 'Solve a challenge after a wrong first attempt',
    progress: (s) =>
      s.solvedChallenges.some((id) => s.challengeHistory.some((a) => a.challengeId === id && !a.correct)) ? 1 : 0,
  },
  { id: 'archivist', title: 'Lab Notebook', description: 'Save 3 experiments', progress: (s) => Math.min(1, s.savedExperiments.length / 3) },
];
