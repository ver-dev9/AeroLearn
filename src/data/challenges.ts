/**
 * Challenge bank. Numeric answers are COMPUTED from the physics engine
 * (never hard-coded), so the answer key is always consistent with the labs.
 */
import { solveProjectile, circularSpeed, escapeSpeed, orbitalElements, initialState, MU_EARTH, R_EARTH, G0, liftForce, isa } from '../physics';

export type Topic = 'projectile' | 'orbit' | 'rocket' | 'aero' | 'concept';

interface Base {
  id: string;
  topic: Topic;
  title: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  equations: string[];
  explanation: string;
}

export interface NumericChallenge extends Base {
  kind: 'numeric';
  unit: string;
  /** Exact answer from the model */
  answer: number;
  /** Relative tolerance accepted (e.g. 0.02 = ±2 %) */
  tolerance: number;
}

export interface McqChallenge extends Base {
  kind: 'mcq';
  options: string[];
  correctIndex: number;
}

export type Challenge = NumericChallenge | McqChallenge;

export const TOPIC_LABEL: Record<Topic, string> = {
  projectile: 'Projectile',
  orbit: 'Orbits',
  rocket: 'Rockets',
  aero: 'Aerodynamics',
  concept: 'Concepts',
};

const p1 = solveProjectile({ v0: 25, angleDeg: 40, g: 9.81 });
const p2 = solveProjectile({ v0: 18, angleDeg: 70, g: 1.62 });
const p3 = solveProjectile({ v0: 30, angleDeg: 30, g: 9.81 });
const r400 = R_EARTH + 400e3;
const geoT = 86164.1; // sidereal day, s
const geoR = Math.cbrt((MU_EARTH * geoT * geoT) / (4 * Math.PI * Math.PI));
const ellipse = orbitalElements(initialState({ altitude: 500e3, speed: 9000, flightPathAngleDeg: 0 }));
const isp = 300;
const dvRocket = isp * G0 * Math.log(5000 / 2000);
const rho3000 = isa(3000).density;

export const CHALLENGES: Challenge[] = [
  {
    id: 'proj-range-1',
    topic: 'projectile',
    kind: 'numeric',
    difficulty: 1,
    title: 'Range of a kicked ball',
    prompt: 'A ball is kicked at 25 m/s at 40° above level ground (g = 9.81 m/s², no air resistance). How far does it travel horizontally before landing?',
    unit: 'm',
    answer: p1.range,
    tolerance: 0.02,
    equations: ['R = v₀² sin(2θ) / g'],
    explanation: `R = 25² × sin(80°) / 9.81 = 625 × 0.9848 / 9.81 ≈ ${p1.range.toFixed(1)} m. The sin(2θ) term peaks at θ = 45°, so 40° gives slightly less than the maximum range.`,
  },
  {
    id: 'proj-height-moon',
    topic: 'projectile',
    kind: 'numeric',
    difficulty: 2,
    title: 'Apex on the Moon',
    prompt: 'An astronaut throws a rock at 18 m/s and 70° on the Moon (g = 1.62 m/s²). What maximum height does it reach above the launch point?',
    unit: 'm',
    answer: p2.maxHeight,
    tolerance: 0.02,
    equations: ['H = v₀² sin²(θ) / (2g)'],
    explanation: `The vertical velocity component is 18 sin 70° ≈ 16.91 m/s. It reaches zero when all its kinetic energy per unit mass has become potential energy: H = (16.91)² / (2 × 1.62) ≈ ${p2.maxHeight.toFixed(1)} m.`,
  },
  {
    id: 'proj-time',
    topic: 'projectile',
    kind: 'numeric',
    difficulty: 1,
    title: 'Time of flight',
    prompt: 'A projectile is launched at 30 m/s at 30° on Earth (g = 9.81 m/s²) and lands at the same height. How long is it in the air?',
    unit: 's',
    answer: p3.timeOfFlight,
    tolerance: 0.02,
    equations: ['T = 2 v₀ sin(θ) / g'],
    explanation: `Setting y(T) = 0 in y = v₀ sinθ t − ½gt² gives T = 2 × 30 × 0.5 / 9.81 ≈ ${p3.timeOfFlight.toFixed(2)} s.`,
  },
  {
    id: 'proj-concept-45',
    topic: 'projectile',
    kind: 'mcq',
    difficulty: 1,
    title: 'Same range, different angle',
    prompt: 'Without air resistance, a projectile launched at 30° lands 50 m away. At which other angle (same speed) would it land at the same distance?',
    options: ['45°', '60°', '15°', '90°'],
    correctIndex: 1,
    equations: ['sin(2θ) = sin(180° − 2θ)'],
    explanation: 'Range depends on sin(2θ). sin(60°) = sin(120°), so θ = 30° and θ = 60° (complementary angles) give the same range — the 60° shot flies higher and longer.',
  },
  {
    id: 'orbit-vc-leo',
    topic: 'orbit',
    kind: 'numeric',
    difficulty: 1,
    title: 'Circular speed at 400 km',
    prompt: 'What speed does a satellite need for a circular orbit 400 km above Earth’s mean surface? Use μ = 3.986×10¹⁴ m³/s² and R⊕ = 6371 km. Answer in m/s.',
    unit: 'm/s',
    answer: circularSpeed(r400),
    tolerance: 0.01,
    equations: ['v = √(μ / r)', 'r = R⊕ + h'],
    explanation: `For a circular orbit gravity supplies exactly the centripetal force: μ/r² = v²/r, so v = √(μ/r) = √(3.986×10¹⁴ / 6.771×10⁶) ≈ ${circularSpeed(r400).toFixed(0)} m/s.`,
  },
  {
    id: 'orbit-escape',
    topic: 'orbit',
    kind: 'numeric',
    difficulty: 2,
    title: 'Escape speed from LEO',
    prompt: 'What is the escape speed from a radius of 6771 km (400 km altitude)? Answer in m/s.',
    unit: 'm/s',
    answer: escapeSpeed(r400),
    tolerance: 0.01,
    equations: ['ε = v²/2 − μ/r = 0', 'v_esc = √(2μ / r) = √2 · v_circ'],
    explanation: `Escape means the specific orbital energy is zero. Solving v²/2 = μ/r gives v = √(2μ/r) ≈ ${escapeSpeed(r400).toFixed(0)} m/s — exactly √2 times the circular speed.`,
  },
  {
    id: 'orbit-geo',
    topic: 'orbit',
    kind: 'numeric',
    difficulty: 3,
    title: 'Geostationary altitude',
    prompt: 'A geostationary orbit has a period of one sidereal day (86 164 s). What is its altitude above Earth’s mean surface, in km?',
    unit: 'km',
    answer: (geoR - R_EARTH) / 1000,
    tolerance: 0.01,
    equations: ['T = 2π √(a³ / μ)', 'a = ∛(μ T² / 4π²)'],
    explanation: `Rearranging Kepler’s third law: a = ∛(3.986×10¹⁴ × 86164² / 4π²) ≈ ${(geoR / 1000).toFixed(0)} km from Earth’s centre. Subtracting R⊕ gives ≈ ${((geoR - R_EARTH) / 1000).toFixed(0)} km.`,
  },
  {
    id: 'orbit-ecc',
    topic: 'orbit',
    kind: 'numeric',
    difficulty: 3,
    title: 'Eccentricity from a burn',
    prompt: 'A satellite at 500 km altitude moves horizontally at 9000 m/s. What is the eccentricity of its orbit? (dimensionless, 3 decimal places)',
    unit: '',
    answer: ellipse.eccentricity,
    tolerance: 0.02,
    equations: ['ε = v²/2 − μ/r', 'h = r v (horizontal velocity)', 'e = √(1 + 2εh²/μ²)'],
    explanation: `Faster than circular (≈7613 m/s) at that radius, so this point is the periapsis. ε = ${(ellipse.energy / 1e6).toFixed(2)} MJ/kg, h = ${(ellipse.angularMomentum / 1e10).toFixed(3)}×10¹⁰ m²/s, giving e ≈ ${ellipse.eccentricity.toFixed(3)}.`,
  },
  {
    id: 'orbit-concept-energy',
    topic: 'orbit',
    kind: 'mcq',
    difficulty: 2,
    title: 'Energy sign',
    prompt: 'A spacecraft has a negative specific orbital energy. What can you conclude?',
    options: ['It will escape Earth', 'It is on a bound (closed) orbit or will hit Earth', 'It is on a parabolic trajectory', 'It must be in a circular orbit'],
    correctIndex: 1,
    equations: ['ε = v²/2 − μ/r', 'ε < 0 ⇒ bound,  ε = 0 ⇒ parabolic,  ε > 0 ⇒ hyperbolic'],
    explanation: 'Negative energy means kinetic energy is not enough to climb out of the gravity well, so the path is an ellipse (circle as a special case). If its periapsis is below the surface it will impact.',
  },
  {
    id: 'rocket-dv',
    topic: 'rocket',
    kind: 'numeric',
    difficulty: 2,
    title: 'Tsiolkovsky Δv',
    prompt: 'A rocket stage has a lift-off mass of 5000 kg, burns 3000 kg of propellant, and its engine has a specific impulse of 300 s. What is its ideal Δv (no gravity or drag)?',
    unit: 'm/s',
    answer: dvRocket,
    tolerance: 0.01,
    equations: ['Δv = I_sp g₀ ln(m₀ / m_f)', 'v_e = I_sp g₀'],
    explanation: `v_e = 300 × 9.80665 ≈ 2942 m/s. Mass ratio = 5000 / 2000 = 2.5, ln 2.5 ≈ 0.916, so Δv ≈ ${dvRocket.toFixed(0)} m/s.`,
  },
  {
    id: 'rocket-twr',
    topic: 'rocket',
    kind: 'numeric',
    difficulty: 1,
    title: 'Lift-off acceleration',
    prompt: 'A 2000 kg rocket has 50 kN of thrust at lift-off. What is its initial upward acceleration (ignore drag, g = 9.81 m/s²)?',
    unit: 'm/s²',
    answer: 50000 / 2000 - 9.81,
    tolerance: 0.02,
    equations: ['m a = F − m g', 'a = F/m − g'],
    explanation: `Newton’s second law on the free-body diagram: a = 50 000/2000 − 9.81 = ${(50000 / 2000 - 9.81).toFixed(2)} m/s². Thrust-to-weight ratio is 2.55.`,
  },
  {
    id: 'rocket-concept-mass',
    topic: 'rocket',
    kind: 'mcq',
    difficulty: 1,
    title: 'Why acceleration grows',
    prompt: 'With constant thrust and vertical flight, why does a rocket’s acceleration usually increase during the burn?',
    options: ['Gravity gets stronger', 'Its mass decreases as propellant is expelled', 'Drag always increases', 'Thrust increases with speed'],
    correctIndex: 1,
    equations: ['a = (F − D)/m(t) − g', 'm(t) = m₀ − ṁ t'],
    explanation: 'The same force acting on a smaller mass gives a larger acceleration. Gravity actually weakens slightly with altitude, and drag first rises then falls as the air thins.',
  },
  {
    id: 'aero-lift',
    topic: 'aero',
    kind: 'numeric',
    difficulty: 1,
    title: 'Lift at sea level',
    prompt: 'A wing of area 16 m² flies at 60 m/s at sea level (ρ = 1.225 kg/m³) with C_L = 0.4. What lift does it generate, in newtons?',
    unit: 'N',
    answer: liftForce(1.225, 60, 16, 0.4),
    tolerance: 0.01,
    equations: ['L = ½ ρ v² S C_L'],
    explanation: `L = 0.5 × 1.225 × 60² × 16 × 0.4 = ${liftForce(1.225, 60, 16, 0.4).toFixed(0)} N — enough to support about ${(liftForce(1.225, 60, 16, 0.4) / 9.81).toFixed(0)} kg in level flight.`,
  },
  {
    id: 'aero-speed-double',
    topic: 'aero',
    kind: 'mcq',
    difficulty: 1,
    title: 'Double the speed',
    prompt: 'If an aircraft doubles its airspeed while keeping the same angle of attack and altitude, its lift becomes…',
    options: ['the same', 'twice as large', 'four times as large', 'half as large'],
    correctIndex: 2,
    equations: ['L ∝ v²'],
    explanation: 'Lift depends on dynamic pressure q = ½ρv², which scales with the square of airspeed: (2v)² = 4v².',
  },
  {
    id: 'aero-altitude',
    topic: 'aero',
    kind: 'numeric',
    difficulty: 2,
    title: 'Air density at 3 km',
    prompt: 'Using the International Standard Atmosphere, what is the air density at 3000 m? (kg/m³, 3 decimal places)',
    unit: 'kg/m³',
    answer: rho3000,
    tolerance: 0.01,
    equations: ['T = 288.15 − 0.0065 h', 'p = 101325 (T/288.15)^5.256', 'ρ = p / (R T),  R = 287.05 J/(kg·K)'],
    explanation: `T = 268.65 K, p ≈ 70 109 Pa, so ρ = 70 109 / (287.05 × 268.65) ≈ ${rho3000.toFixed(3)} kg/m³ — about 74 % of sea-level density, so lift at a given airspeed drops by the same factor.`,
  },
  {
    id: 'aero-stall',
    topic: 'aero',
    kind: 'mcq',
    difficulty: 2,
    title: 'What is a stall?',
    prompt: 'An aerodynamic stall happens when…',
    options: ['the engine stops', 'airspeed reaches zero', 'the angle of attack exceeds the critical angle and flow separates', 'the aircraft climbs too high'],
    correctIndex: 2,
    equations: ['C_L rises ≈ linearly with α up to α_crit, then falls'],
    explanation: 'A stall is about angle of attack, not engine power or speed directly. Beyond the critical angle (often ~15°) the boundary layer separates from the upper surface and lift drops sharply. It can happen at any airspeed.',
  },
  {
    id: 'concept-newton3',
    topic: 'concept',
    kind: 'mcq',
    difficulty: 1,
    title: 'Rockets in a vacuum',
    prompt: 'How does a rocket accelerate in the vacuum of space, where there is no air to push against?',
    options: ['It cannot', 'By pushing exhaust backwards: the exhaust pushes the rocket forwards (Newton’s 3rd law)', 'Solar wind pushes it', 'Gravity from the Sun pulls it'],
    correctIndex: 1,
    equations: ['F = ṁ v_e  (momentum flux of the exhaust)'],
    explanation: 'The engine exerts a force on the exhaust gas, and the gas exerts an equal and opposite force on the engine. No external medium is needed — in fact thrust is slightly higher in vacuum.',
  },
  {
    id: 'concept-weightless',
    topic: 'concept',
    kind: 'mcq',
    difficulty: 2,
    title: 'Weightless in orbit?',
    prompt: 'Astronauts on the ISS (≈400 km up) float because…',
    options: ['there is no gravity there', 'gravity there is about 10 % of the surface value', 'they and the station are in continuous free fall together', 'the station spins'],
    correctIndex: 2,
    equations: ['g(h) = g₀ (R⊕/(R⊕+h))² ≈ 0.89 g₀ at 400 km'],
    explanation: 'Gravity at the ISS is still ~89 % of surface gravity. Everything aboard falls around Earth at the same rate, so there is no contact force — that is what “weightlessness” really means.',
  },
];

export function checkNumeric(c: NumericChallenge, input: number): boolean {
  if (!Number.isFinite(input)) return false;
  if (c.answer === 0) return Math.abs(input) < 1e-6;
  return Math.abs(input - c.answer) / Math.abs(c.answer) <= c.tolerance;
}

export function dailyChallenge(dayIndex: number): Challenge {
  return CHALLENGES[((dayIndex % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length];
}
