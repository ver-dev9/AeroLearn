# V2 Preview — Astronomy Atlas

The initial V2 feature adds a searchable Astronomy Atlas screen registered in the root navigation and linked from Laboratories. The catalogue covers 20 entries: Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Solar System, Asteroid Belt, Comet, Black Hole, Milky Way, Nebula, Pulsar, Supernova, International Space Station, and Hubble Space Telescope. Each entry includes introductory facts, reference notes, and related exploration/mission names. Reference values are educational summaries, not engineering guidance.


# AeroLearn — Technical Documentation of the Scientific Models

All models live in `src/physics/` and are pure TypeScript functions with no UI dependencies. Every quantity is in SI units internally (m, s, kg, N, Pa, rad). The UI converts only for display (km, km/s, degrees, minutes).

Constants (`constants.ts`):

| Symbol | Value | Source |
|---|---|---|
| g₀ | 9.80665 m/s² | standard gravity (exact) |
| μ⊕ = GM⊕ | 3.986004418 × 10¹⁴ m³/s² | IERS 2010 |
| R⊕ | 6.371 × 10⁶ m | mean radius |
| ρ₀, T₀, p₀ | 1.225 kg/m³, 288.15 K, 101 325 Pa | ISA sea level |
| L | 0.0065 K/m | ISA lapse rate |
| R_air | 287.05287 J/(kg·K) | ISA |

---

## 1. Flight Lab — projectile motion (`projectile.ts`)

**Assumptions:** point mass; uniform gravity g; no air resistance or wind; launch and landing at the same height (y = 0); flat ground.

**Equations of motion** (Newton's second law with F = −mg ŷ):

```
x(t) = v₀ cos θ · t
y(t) = v₀ sin θ · t − ½ g t²
vₓ = v₀ cos θ (constant),  v_y = v₀ sin θ − g t
```

**Derived results:**

- Time of flight, from y(T) = 0, T ≠ 0: `T = 2 v₀ sin θ / g`
- Apex at v_y = 0: `t_apex = T/2`, `H = v₀² sin² θ / (2g)`
- Range: `R = vₓ T = v₀² sin 2θ / g`

**Method:** exact closed-form evaluation; the trajectory is sampled at 160 equal time steps for plotting. There is no numerical integration error. The animation replays the computed samples.

**Validation (unit tests):** textbook case (20 m/s, 45°), landing at y = 0 when t = T, apex at T/2, equal range for complementary angles, 45° maximises range, R ∝ 1/g, R = 0 at 90°, invalid inputs rejected.

**Input limits:** 0 < v₀ ≤ 2000 m/s, 0° < θ ≤ 90°, 0.1 ≤ g ≤ 100 m/s².

---

## 2. Orbit Explorer — two-body problem (`orbit.ts`)

**Assumptions:** Earth is a spherically symmetric point mass at the origin; satellite mass negligible; motion confined to one plane; Newtonian gravity is the only force. **Not modelled:** atmospheric drag, J2 oblateness, Moon/Sun third-body effects, solar radiation pressure, relativity, Earth rotation, manoeuvres. Real satellite operations require all of these plus orbit determination from tracking data — the app states this on screen.

**Acceleration:**

```
a(r) = −μ r / |r|³
```

**Initial state:** r₀ = (R⊕ + h, 0); v₀ = v (sin γ, cos γ), where γ is the flight-path angle above local horizontal (γ = 0 → purely tangential).

### Numerical integration: velocity Verlet

```
v_{n+½} = v_n + ½ a(r_n) Δt
r_{n+1} = r_n + v_{n+½} Δt
v_{n+1} = v_{n+½} + ½ a(r_{n+1}) Δt
```

Velocity Verlet is second-order, time-reversible and **symplectic**: it exactly conserves a "shadow" Hamiltonian close to the true energy, so the energy error oscillates within a bounded band instead of drifting (as explicit Euler or even RK4 do over very long runs). It also conserves angular momentum to round-off for central forces. A classical RK4 integrator (`rk4Step`) is included for comparison and testing.

**Time step selection** (`chooseTimeStep`): periapsis is the fastest, most curved point of any conic, so

```
Δt = clamp( min(0.005 · r_p / v_p,  T/2000),  0.05 s,  60 s )
```

which resolves periapsis with ~200 steps per radian of true anomaly. During playback the integrator advances `time-warp × real-frame-time` of simulated time per frame using sub-steps of this size; animation speed never changes Δt.

**Stopping conditions:** |r| ≤ R⊕ → *impact*; |r| ≥ 1.6 × view radius → *escaped*; any non-finite value → simulation halted with an error message (numerical instability guard).

### Analytic quantities shown alongside the simulation

```
ε = v²/2 − μ/r                    specific orbital energy (J/kg)
h = |r × v|                        specific angular momentum
e = √(1 + 2 ε h² / μ²)             eccentricity
a = −μ / (2ε)                      semi-major axis
r_p = h² / (μ (1 + e)),  r_a = a(1 + e)
T = 2π √(a³/μ)                     period (bound orbits only)
e⃗ = ((v² − μ/r) r − (r·v) v) / μ  eccentricity vector (periapsis direction)
```

Classification: e < 0.01 circular; ε < 0 elliptical; |e − 1| < 10⁻³ parabolic; ε > 0 hyperbolic; and "sub-orbital" when the periapsis lies inside Earth on a bound path (or an inbound unbound path). The predicted conic r(ν) = p/(1 + e cos ν), p = h²/μ, is drawn as a faint dashed curve; the integrated trail should lie on top of it. The screen also reports the **relative energy drift** of the integration as a live accuracy indicator.

**Validation (unit tests):** surface gravity ≈ 9.82 m/s²; v_circ(400 km) = 7672.6 m/s and T ≈ 92.4 min; escape speed = √2·v_circ with ε ≈ 0; vis-viva identity; circular radius constant to 10⁻⁵ over one period; closed orbit returns to the start within 10⁻³ of r after one Kepler period; energy conserved to 10⁻⁴ and angular momentum to 10⁻⁹ over 10 orbits with e ≈ 0.43; Verlet vs RK4 agree within 50 m after 10 minutes; impact and escape detection; analytic conic passes through the integrated positions.

---

## 3. Rocket Lab — variable-mass vertical rocket (`rocket.ts`)

**Assumptions:** 1-D vertical flight (no gravity turn, guidance or wind); single stage; constant thrust F and constant mass-flow rate during the burn; thrust independent of altitude; constant drag coefficient (no Mach effects); exponential atmosphere; no heating or structural limits. The UI states explicitly that this is **not a launch prediction**.

**Model** (Newton's second law with thrust treated as an external force on the variable-mass body):

```
m(t) dv/dt = F(t) − m(t) g(h) − D(h, v)
dh/dt = v

m(t) = m₀ − ṁ t  (t ≤ t_b),  m_dry  (t > t_b),   ṁ = m_fuel / t_b
F(t) = F  (t < t_b),  0 afterwards
g(h) = g₀ (R⊕ / (R⊕ + h))²         (toggle: constant g₀)
D = ½ ρ(h) v |v| C_d A,   A = π d² / 4   (toggle on/off; sign opposes motion)
ρ(h) = ρ₀ e^(−h/H),  H = 8500 m
```

Derived: effective exhaust velocity v_e = F/ṁ, specific impulse I_sp = v_e/g₀, ideal Δv = v_e ln(m₀/m_dry) (Tsiolkovsky), lift-off thrust-to-weight F/(m₀ g₀). The app reports gravity + drag losses as Δv_ideal − v_burnout.

**Ground contact:** while on the pad, if the net force is downward the pad supplies a normal force (a = 0). This means a rocket whose initial T/W < 1 can still lift off later in the burn once enough propellant has been consumed — physically correct and covered by a test.

**Method:** classical RK4 with Δt = min(0.05 s, t_b/200). The step that crosses burnout is shortened so thrust cut-off is resolved exactly. Ground impact is located by linear interpolation within the final step. Non-finite values abort with an error. Samples every ~0.25 s are kept for plotting and animation.

**Validation (unit tests)** with drag off and constant g:

- burnout velocity equals `v_e ln(m₀/m_f) − g t_b`;
- burnout altitude equals the analytic integral `v_e [t_b − (m_f/ṁ) ln(m₀/m_f)] − ½ g t_b²`;
- coasting apogee equals `h_b + v_b² / (2g)`;
- mass decreases linearly and then stays at dry mass;
- drag lowers apogee; no lift-off when thrust never exceeds dry weight; late lift-off when it eventually does; landing detection; invalid inputs (fuel ≥ initial mass, zero burn time, negative thrust) rejected.

---

## 4. Aerodynamics Lab — simplified wing (`aerodynamics.ts`, `atmosphere.ts`)

**Assumptions:** steady, incompressible flow (reasonable below ~100 m/s); wing only (no fuselage, tail, flaps or ground effect); generic cambered aerofoil with zero-lift angle α₀ = −2°, stall at 15°, Oswald efficiency e = 0.8, parasite drag C_D0 = 0.025; no Reynolds-number effects. The airflow picture is explicitly a schematic, not CFD.

**ISA atmosphere** (0–11 km troposphere, 11–20 km isothermal layer):

```
T = T₀ − L h
p = p₀ (T/T₀)^(g₀ / (R L))
ρ = p / (R T)
above 11 km: p = p₁₁ exp(−g₀ (h − 11 km) / (R T₁₁))
```

**Lift:**

```
L = ½ ρ v² S C_L
C_L = a (α − α₀)        for α ≤ α_stall
a = a₀ / (1 + a₀ / (π e AR)),   a₀ = 2π rad⁻¹     (lifting-line / Helmbold correction)
```

Beyond the stall angle the attached-flow model is not valid. The app shows an *illustrative* post-stall drop (C_L decreasing 0.05 per degree, floored at 50 % of C_L,max) plus a separation drag increment, and labels it as such.

**Drag:**

```
D = ½ ρ v² S C_D,    C_D = C_D0 + C_L² / (π e AR)   (+ stall increment)
```

**Flight-mechanics readouts:** weight W = m g₀; L − W (climb/descend indicator in this idealisation); thrust required for steady level flight T = D; L/D; stall speed `V_s = √(2W / (ρ S C_L,max))`.

**Validation (unit tests):** ISA sea level (288.15 K, 101 325 Pa, 1.225 kg/m³); ρ(5 km) = 0.7364, T(11 km) = 216.65 K, ρ(11 km) = 0.3639, ρ(20 km) = 0.0880 kg/m³ (published tables); L ∝ v² and ∝ S; finite-wing slope < 2π and → 2π as AR → ∞; C_L = 0 at α₀; stall flag; light-aircraft sanity check (Cessna-class wing at 55 m/s gives L/W ≈ 1); lift equals weight at the computed stall speed.

---

## 5. Challenges and lessons

Numeric challenge answers are **computed from the same physics functions** when the app loads (e.g. the geostationary altitude from Kepler's third law with T = 86 164.1 s gives ≈ 35 786 km). Answers within a stated relative tolerance (1–2 %) are accepted to allow for rounding. An integrity test checks every answer is finite, accepts itself, rejects a 10 % error, and that every multiple-choice key points at a real option.

---

## 6. Simulation vs animation

- **Flight Lab, Rocket Lab:** the full solution is computed first; the animation only interpolates between computed samples (`useAnimationClock`, `sampleAt`).
- **Orbit Explorer:** the integrator is stepped live; the time warp chooses how much simulated time to advance per frame, never the step size.
- **Aerodynamics Lab:** values are algebraic and update instantly; the moving streamlines are decorative and labelled "schematic".

## 7. Input validation and error handling

Every model exposes `validate*()` returning field-level messages; `solve*/simulate*` throw `PhysicsInputError` if called with invalid input. The UI validates typed values against slider ranges before passing them to a model, disables Run/Launch while inputs are invalid, and an error boundary prevents a rendering failure from crashing the app. Stored progress is merged defensively on load so a corrupted save cannot crash startup.


---

## V2 Preview build and Astronomy Atlas

### Build provenance
- Android release build: GitHub Actions workflow run #7 (successful)
- Source commit: `557ed21b9a8e1016553747095a06679064cffce7`
- Expo SDK: 58; application source uses React Native and TypeScript
- Android packaging: Expo prebuild followed by Gradle release APK assembly in CI
- CI artifact: `AeroLearn-Android-APK` (temporary artifact; retention is controlled by GitHub Actions)

### V2 palette
The shared theme uses a graphite/charcoal base with violet and warm-metal accents. This is a token-based theme update rather than a wholesale component redesign; older screens may still need further visual refinement.

### Astronomy Atlas
A typed navigation route and Laboratories entry lead to the Atlas screen. Its searchable catalogue includes 20 entries: Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Solar System, Asteroid Belt, Comet, Black Hole, Milky Way, Nebula, Pulsar, Supernova, International Space Station, and Hubble Space Telescope. Each entry provides summary facts, reference notes, and related exploration/mission names. The Atlas is educational content and does not currently simulate full orbital or astrophysical behavior for each entry.


### Preview limitations / planned work
The current V2 preview does not yet include a full interactive 3D astronomy engine, complete rocket/spacecraft model library, expanded mission explorer, or the planned advanced challenge expansion. The successful CI build confirms compilation and packaging; it is not a substitute for device QA or a scientific validation pass of new Atlas content.


## V2.1 — Rocket Hangar and warm visual system

- Added a dedicated Rocket Hangar bottom-navigation tab in place of the learning-library destination; the existing Laboratories remain available separately.
- Added an embedded WebView using Google's model-viewer component to display original NASA GLB models with orbit, zoom and pan controls.
- Initial models: Saturn V and Space Shuttle (A), sourced from NASA Science 3D Resources.
- Added component briefings for Saturn V stages, F-1 engines and Apollo spacecraft systems, plus Shuttle orbiter, external tank, solid rocket boosters, main engines and OMS.
- The exploded engineering guide separates components into selectable explanatory entries. The original GLB is retained intact; this guide is not a mesh-level exploded animation.
- Replaced blue/violet accents with warm graphite, bronze, sand and ivory tokens. Added subtle, low-opacity animated star and planet ambience behind app content.
- App version 2.1.0; Android versionCode 2.
- Interactive model assets stream from NASA and require network access. NASA source pages: https://science.nasa.gov/3d-resources/saturn-v/ and https://science.nasa.gov/3d-resources/space-shuttle-a/.


## 8. Gravity & Magnetism Lab (2.2.0)

### Universal gravitation

The interactive screen uses Newton's universal law for two point masses:

```
F = G m₁ m₂ / r²
G = 6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻²
```

Mass sliders are displayed in scaled units (10²⁴ kg and 10³ kg); separation is displayed in 10⁶ m. Values are converted to SI before evaluation. The diagram scales the two mass markers for legibility and indicates the equal-magnitude, opposite-direction force pair. The model assumes isolated point masses and neglects additional bodies and relativistic effects.

### Magnetic field and compass

The magnetic instrument exposes field strength (µT) and a planar field direction (degrees). The compass needle is drawn aligned to the selected uniform field vector. The field-line ellipses are a qualitative schematic, not a numerical solution of a dipole field. The torque relationship is τ = μ × B; the equilibrium needle direction is parallel or antiparallel to the field according to the compass pole convention.

### UI and presentation

The Home screen is an introduction-only surface with low-contrast star points, orbital paths, a stylised planet and slow decorative orbital motion. It intentionally omits dashboard progress and recent activity. The shared palette uses graphite and deep navy surfaces with bronze, ivory and distinct data-series accents. Profile progress no longer reports lesson-completion totals; lesson content and its local state remain intact.
