import { circularSpeed, R_EARTH, MU_EARTH, G0, solveProjectile, liftForce } from '../physics';

export type DiagramKey = 'forces' | 'projectile' | 'circular' | 'gravitation' | 'conics' | 'rocket' | 'airfoil' | 'fourForces';

export interface KnowledgeCheck {
  q: string;
  options: string[];
  correct: number;
  why: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  diagram: DiagramKey;
  sections: { heading: string; body: string }[];
  equations: { eq: string; caption: string }[];
  example: { problem: string; steps: string[]; answer: string };
  checks: KnowledgeCheck[];
  relatedLab?: 'FlightLab' | 'OrbitExplorer' | 'RocketLab' | 'AeroLab';
}

const ex2 = solveProjectile({ v0: 15, angleDeg: 35, g: 9.81 });
const vIss = circularSpeed(R_EARTH + 420e3);
const gIss = G0 * Math.pow(R_EARTH / (R_EARTH + 420e3), 2);

export const LESSONS: Lesson[] = [
  {
    id: 'newton',
    title: "Newton's Laws of Motion",
    subtitle: 'The foundation of every simulation in this app',
    minutes: 6,
    diagram: 'forces',
    sections: [
      { heading: 'First law — inertia', body: 'An object stays at rest, or keeps moving in a straight line at constant speed, unless a net external force acts on it. A spacecraft coasting between planets needs no engine to keep moving.' },
      { heading: 'Second law — F = ma', body: 'The net force on an object equals its mass times its acceleration. Force and acceleration are vectors: they have direction as well as size. Every lab in AeroLearn is built on this law.' },
      { heading: 'Third law — action and reaction', body: 'When body A pushes on body B, B pushes back on A with an equal and opposite force. A rocket pushes exhaust backwards; the exhaust pushes the rocket forwards.' },
    ],
    equations: [
      { eq: 'ΣF = m a', caption: 'Net force (N) = mass (kg) × acceleration (m/s²)' },
      { eq: 'F_AB = −F_BA', caption: 'Third-law force pair' },
      { eq: 'W = m g', caption: 'Weight is the gravitational force on a mass' },
    ],
    example: {
      problem: 'A 1200 kg aircraft accelerates down the runway with 6000 N of net forward force. What is its acceleration?',
      steps: ['Use ΣF = m a and solve for a.', 'a = 6000 N / 1200 kg'],
      answer: 'a = 5.0 m/s²',
    },
    checks: [
      { q: 'A probe drifts in deep space with its engine off. Its velocity will…', options: ['slowly decrease to zero', 'stay constant', 'increase'], correct: 1, why: 'With no net force there is no acceleration (first law).' },
      { q: 'Doubling the net force on a fixed mass makes the acceleration…', options: ['half', 'the same', 'double'], correct: 2, why: 'a = F/m, so a is proportional to F.' },
    ],
  },
  {
    id: 'projectile',
    title: 'Projectile Motion',
    subtitle: 'Two independent motions combined',
    minutes: 7,
    diagram: 'projectile',
    relatedLab: 'FlightLab',
    sections: [
      { heading: 'Split the motion', body: 'Without air resistance, the only force on a projectile is gravity, which acts vertically. So the horizontal velocity never changes, while the vertical velocity decreases at a steady rate g.' },
      { heading: 'The parabola', body: 'Combining constant horizontal motion with uniformly accelerated vertical motion produces a parabolic path. The highest point is reached when the vertical velocity is zero, exactly halfway through the flight (for equal launch and landing heights).' },
      { heading: 'Real life', body: 'Air drag shortens the range and makes the path asymmetric, with a steeper descent. The Flight Lab deliberately ignores drag so you can see the ideal behaviour.' },
    ],
    equations: [
      { eq: 'x(t) = v₀ cos(θ) t', caption: 'Horizontal position' },
      { eq: 'y(t) = v₀ sin(θ) t − ½ g t²', caption: 'Vertical position' },
      { eq: 'T = 2 v₀ sinθ / g   H = v₀² sin²θ / 2g   R = v₀² sin2θ / g', caption: 'Flight time, maximum height, range' },
    ],
    example: {
      problem: 'A ball is thrown at 15 m/s at 35° on Earth. Find the range.',
      steps: ['sin(2 × 35°) = sin 70° ≈ 0.9397', 'R = 15² × 0.9397 / 9.81'],
      answer: `R ≈ ${ex2.range.toFixed(1)} m`,
    },
    checks: [
      { q: 'At the top of its flight, a projectile’s velocity is…', options: ['zero', 'purely horizontal', 'purely vertical'], correct: 1, why: 'Only the vertical component is zero at the apex; horizontal velocity is unchanged.' },
      { q: 'Which launch angle gives maximum range on flat ground (no drag)?', options: ['30°', '45°', '60°'], correct: 1, why: 'sin(2θ) is largest when 2θ = 90°.' },
    ],
  },
  {
    id: 'circular',
    title: 'Circular Motion',
    subtitle: 'Why turning needs a force',
    minutes: 6,
    diagram: 'circular',
    sections: [
      { heading: 'Changing direction is acceleration', body: 'Even at constant speed, an object moving in a circle is accelerating, because the direction of its velocity keeps changing. The acceleration points towards the centre of the circle.' },
      { heading: 'Centripetal force', body: 'Some real force must provide this inward pull: tension in a string, friction on a car’s tyres, the lift of a banked aircraft, or gravity for a satellite. “Centripetal” describes the direction, not a new kind of force.' },
    ],
    equations: [
      { eq: 'a_c = v² / r = ω² r', caption: 'Centripetal acceleration' },
      { eq: 'F_c = m v² / r', caption: 'Required inward force' },
      { eq: 'T = 2π r / v', caption: 'Period of one revolution' },
    ],
    example: {
      problem: 'An aircraft flies a level turn of radius 800 m at 100 m/s. What centripetal acceleration does it experience?',
      steps: ['a = v² / r', 'a = 100² / 800 = 10 000 / 800'],
      answer: 'a = 12.5 m/s² ≈ 1.27 g',
    },
    checks: [
      { q: 'If speed doubles on the same circle, the centripetal force needed…', options: ['doubles', 'quadruples', 'halves'], correct: 1, why: 'F ∝ v².' },
      { q: 'For a satellite, the centripetal force is provided by…', options: ['its engines', 'gravity', 'air pressure'], correct: 1, why: 'Gravity pulls it towards Earth’s centre.' },
    ],
  },
  {
    id: 'gravitation',
    title: 'Gravitation',
    subtitle: "Newton's universal law",
    minutes: 6,
    diagram: 'gravitation',
    relatedLab: 'OrbitExplorer',
    sections: [
      { heading: 'Inverse-square law', body: 'Every mass attracts every other mass with a force proportional to the product of the masses and inversely proportional to the square of the distance between their centres.' },
      { heading: 'Gravity in orbit', body: `At the ISS’s altitude (~420 km) gravity is still about ${((gIss / G0) * 100).toFixed(0)} % of its surface value. Astronauts float because they are in free fall together with the station, not because gravity is absent.` },
      { heading: 'μ = GM', body: 'For orbits it is convenient to combine G and Earth’s mass into one constant, the standard gravitational parameter μ⊕ = 3.986 × 10¹⁴ m³/s², which is known far more precisely than G or M separately.' },
    ],
    equations: [
      { eq: 'F = G M m / r²', caption: 'Newton’s law of gravitation' },
      { eq: 'a = −μ r / |r|³', caption: 'Vector form used in Orbit Explorer' },
      { eq: 'g(h) = g₀ (R / (R + h))²', caption: 'Gravity vs altitude' },
    ],
    example: {
      problem: 'What is gravitational acceleration at 420 km altitude?',
      steps: ['g = g₀ (R⊕ / (R⊕ + h))²', `g = 9.807 × (6371 / 6791)²`],
      answer: `g ≈ ${gIss.toFixed(2)} m/s²`,
    },
    checks: [
      { q: 'If the distance between two masses triples, the force becomes…', options: ['1/3', '1/6', '1/9'], correct: 2, why: 'F ∝ 1/r², and 3² = 9.' },
      { q: 'Astronauts on the ISS are weightless because…', options: ['gravity is zero there', 'they are in free fall', 'they are outside the atmosphere'], correct: 1, why: 'Gravity is ~89 % of surface value; they simply fall around Earth.' },
    ],
  },
  {
    id: 'orbital',
    title: 'Orbital Mechanics',
    subtitle: 'Falling around the Earth',
    minutes: 8,
    diagram: 'conics',
    relatedLab: 'OrbitExplorer',
    sections: [
      { heading: 'Newton’s cannon', body: 'Fire a cannonball horizontally from a high mountain. The faster it goes, the farther it lands — until the ground curves away as fast as the ball falls. Then it never lands: it is in orbit.' },
      { heading: 'Energy decides the shape', body: 'The specific orbital energy ε = v²/2 − μ/r is conserved. Negative energy gives a closed ellipse (or circle), zero gives a parabola, positive gives a hyperbola that escapes.' },
      { heading: 'Kepler’s third law', body: 'For a closed orbit the period depends only on the semi-major axis: higher orbits take longer. A satellite at 400 km circles Earth in about 92 minutes; the Moon takes about 27 days.' },
      { heading: 'Ideal vs real', body: 'Real satellites feel atmospheric drag, Earth’s oblateness, the Moon and Sun, and must perform station-keeping manoeuvres. The Orbit Explorer models only the ideal two-body problem.' },
    ],
    equations: [
      { eq: 'v_circ = √(μ / r)', caption: 'Circular orbit speed' },
      { eq: 'v_esc = √(2μ / r)', caption: 'Escape speed' },
      { eq: 'ε = v²/2 − μ/r = −μ / 2a', caption: 'Specific orbital energy (vis-viva)' },
      { eq: 'T = 2π √(a³ / μ)', caption: 'Kepler’s third law' },
    ],
    example: {
      problem: 'Find the circular orbital speed at 420 km altitude.',
      steps: ['r = 6371 + 420 = 6791 km', 'v = √(3.986×10¹⁴ / 6.791×10⁶)'],
      answer: `v ≈ ${vIss.toFixed(0)} m/s (≈ ${(vIss * 3.6).toFixed(0)} km/h)`,
    },
    checks: [
      { q: 'A satellite in a circular orbit speeds up by 10 % with a short burn. Its new orbit is…', options: ['a larger circle', 'an ellipse with the burn point as periapsis', 'a hyperbola'], correct: 1, why: 'Energy increases but stays negative (escape needs about 41 % more speed), and the burn point becomes the lowest point.' },
      { q: 'Escape speed is how many times circular speed at the same radius?', options: ['2', '√2', '1.5'], correct: 1, why: `√(2μ/r) / √(μ/r) = √2. (μ = ${MU_EARTH.toExponential(3)} m³/s²)` },
    ],
  },
  {
    id: 'rocket',
    title: 'Rocket Propulsion',
    subtitle: 'Throwing mass to go faster',
    minutes: 8,
    diagram: 'rocket',
    relatedLab: 'RocketLab',
    sections: [
      { heading: 'Thrust', body: 'A rocket engine expels exhaust at high speed v_e. The momentum carried away each second, ṁ v_e, is the thrust. It works in a vacuum because the rocket pushes on its own exhaust.' },
      { heading: 'Changing mass', body: 'As propellant burns, the rocket gets lighter, so the same thrust produces ever greater acceleration. This is why rockets accelerate hardest near burnout.' },
      { heading: 'Gravity and drag losses', body: 'Climbing against gravity costs about g every second of burn, and air drag (½ρv²C_dA) costs more in the dense lower atmosphere. Real launches turn sideways early to reduce gravity losses — the Rocket Lab flies straight up for simplicity.' },
      { heading: 'Tsiolkovsky', body: 'The ideal velocity change depends only on exhaust speed and the ratio of full to empty mass. Because of the logarithm, doubling the propellant does not double the Δv — which is why rockets use stages.' },
    ],
    equations: [
      { eq: 'F = ṁ v_e', caption: 'Thrust from exhaust momentum flux' },
      { eq: 'm(t) dv/dt = F − m g − D', caption: 'Vertical equation of motion' },
      { eq: 'Δv = v_e ln(m₀ / m_f)', caption: 'Tsiolkovsky rocket equation' },
      { eq: 'I_sp = v_e / g₀', caption: 'Specific impulse (seconds)' },
    ],
    example: {
      problem: 'An engine with I_sp = 350 s burns until the rocket’s mass falls from 10 t to 4 t. Find the ideal Δv.',
      steps: ['v_e = 350 × 9.80665 ≈ 3432 m/s', 'Δv = 3432 × ln(10/4) = 3432 × 0.916'],
      answer: `Δv ≈ ${(350 * G0 * Math.log(2.5)).toFixed(0)} m/s`,
    },
    checks: [
      { q: 'With constant thrust, a vertical rocket’s acceleration during the burn usually…', options: ['decreases', 'stays constant', 'increases'], correct: 2, why: 'Mass falls while thrust is constant.' },
      { q: 'Thrust-to-weight ratio below 1 at lift-off means…', options: ['the rocket leaves slowly', 'the rocket cannot lift off', 'the rocket flips'], correct: 1, why: 'Thrust must exceed weight for net upward force.' },
    ],
  },
  {
    id: 'aero',
    title: 'Aerodynamics',
    subtitle: 'How air creates lift and drag',
    minutes: 8,
    diagram: 'airfoil',
    relatedLab: 'AeroLab',
    sections: [
      { heading: 'Turning the flow', body: 'A wing at a positive angle of attack deflects air downwards. By Newton’s third law the air pushes the wing up. Equivalently, the flow speeds up over the upper surface and its pressure drops (Bernoulli). Both descriptions are consistent views of the same physics.' },
      { heading: 'The lift equation', body: 'Lift grows with air density, the square of airspeed, wing area, and the lift coefficient C_L, which captures shape and angle of attack. C_L rises roughly linearly with angle of attack — about 0.1 per degree for a typical wing.' },
      { heading: 'Stall', body: 'Beyond the critical angle of attack (often 12–18°) the flow separates from the upper surface, lift drops and drag rises sharply. Stall depends on angle of attack, not directly on speed.' },
      { heading: 'Drag', body: 'Parasite drag comes from skin friction and shape. Induced drag is the price of making lift on a finite wing, caused by wing-tip vortices; it is largest at low speed and high C_L. Long, slender wings (high aspect ratio) reduce it.' },
    ],
    equations: [
      { eq: 'L = ½ ρ v² S C_L', caption: 'Lift' },
      { eq: 'D = ½ ρ v² S C_D', caption: 'Drag' },
      { eq: 'C_D = C_D0 + C_L² / (π e AR)', caption: 'Drag polar (parasite + induced)' },
      { eq: 'C_L ≈ a (α − α₀),  a = 2π / (1 + 2/(e AR))', caption: 'Finite-wing lift slope (simplified)' },
    ],
    example: {
      problem: 'A glider wing (S = 12 m²) flies at 30 m/s at sea level with C_L = 0.9. How much lift?',
      steps: ['q = ½ × 1.225 × 30² = 551 Pa', 'L = q × S × C_L = 551 × 12 × 0.9'],
      answer: `L ≈ ${liftForce(1.225, 30, 12, 0.9).toFixed(0)} N`,
    },
    checks: [
      { q: 'Flying at higher altitude at the same airspeed and C_L, lift…', options: ['increases', 'decreases', 'stays the same'], correct: 1, why: 'Air density ρ decreases with altitude.' },
      { q: 'Induced drag is largest when…', options: ['flying fast', 'flying slowly at high C_L', 'the wing is at zero lift'], correct: 1, why: 'C_Di ∝ C_L², and slow flight needs high C_L.' },
    ],
  },
  {
    id: 'flight',
    title: 'Aircraft Flight Principles',
    subtitle: 'Lift, weight, thrust and drag in balance',
    minutes: 7,
    diagram: 'fourForces',
    relatedLab: 'AeroLab',
    sections: [
      { heading: 'Four forces', body: 'In steady, level, unaccelerated flight, lift balances weight and thrust balances drag. Any imbalance produces acceleration: more thrust than drag speeds the aircraft up; more lift than weight makes it climb.' },
      { heading: 'Controlling lift', body: 'Pilots control lift mainly with angle of attack (elevator) and airspeed (throttle). To fly slower while staying level, the angle of attack must increase — until the stall limits it.' },
      { heading: 'Stall speed', body: 'The minimum level-flight speed occurs at the maximum lift coefficient. Heavier aircraft, thinner air or smaller wings all raise the stall speed, which is why runways at high, hot airports are longer.' },
      { heading: 'Lift-to-drag ratio', body: 'L/D measures aerodynamic efficiency. A glider with L/D = 40 travels 40 m forward for every metre it descends in still air. Airliners cruise near L/D ≈ 17–20.' },
    ],
    equations: [
      { eq: 'L = W,   T = D', caption: 'Steady level flight' },
      { eq: 'V_stall = √(2 W / (ρ S C_L,max))', caption: 'Stall speed' },
      { eq: 'glide ratio = L / D', caption: 'Distance per height lost' },
    ],
    example: {
      problem: 'A 1100 kg aircraft with a 16.2 m² wing and C_L,max = 1.6 flies at sea level. What is its stall speed?',
      steps: ['W = 1100 × 9.807 = 10 788 N', 'V = √(2 × 10 788 / (1.225 × 16.2 × 1.6))'],
      answer: `V_stall ≈ ${Math.sqrt((2 * 1100 * G0) / (1.225 * 16.2 * 1.6)).toFixed(1)} m/s`,
    },
    checks: [
      { q: 'In steady level flight, thrust equals…', options: ['weight', 'lift', 'drag'], correct: 2, why: 'Horizontal forces balance: T = D.' },
      { q: 'Stall speed increases when the aircraft…', options: ['becomes heavier', 'gets a bigger wing', 'flies in denser air'], correct: 0, why: 'V_stall ∝ √W.' },
    ],
  },
];

export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);
