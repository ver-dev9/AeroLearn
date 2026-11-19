## V2 Preview — Astronomy Atlas

AeroLearn V2 development is underway. The first integrated V2 feature is an **Astronomy Atlas** reachable from the Laboratories screen. It includes searchable entries for 20 celestial and astronomical objects, detail panels with key facts, reference notes, and related mission/exploration links.


# AeroLearn

### Understand the Science. Explore the Sky.

AeroLearn is an interactive aerospace learning laboratory for high-school students, physics enthusiasts and beginner aerospace engineers. Instead of only reading about aerospace concepts, you change physical parameters, run real simulations, watch the outcome, and see the mathematics behind every number.

Built with **React Native + Expo (SDK 58) + TypeScript**. Runs on Android and iOS. No accounts, no paid APIs, no network required — progress is stored on the device.

---

## V2 Preview (Android)

The first V2 preview build is available from the [successful GitHub Actions run #7](https://github.com/ver-dev9/AeroLearn/actions/runs/44220331184). It introduces the graphite/violet/warm-metal theme and a searchable Astronomy Atlas with 20 catalogue entries. See [V2 release notes and technical details](RELEASE-V2-PREVIEW.md).


## Download

A ready-to-install Android APK is in [`releases/AeroLearn-v1.0.0-arm64.apk`](releases/AeroLearn-v1.0.0-arm64.apk) (v1.0.0, about 26 MB).

- Built for **arm64-v8a**, which covers nearly all Android phones from about 2017 onward. Android 7.0 (API 24) or newer.
- Signed with a debug key, so it is fine for sideloading but not for the Play Store. Enable "Install unknown apps" for your browser or file manager, then open the APK.

## Features

| Module | What it does | Model |
|---|---|---|
| **Flight Lab** | Projectile motion with adjustable v₀, θ, g (Earth/Moon/Mars/Jupiter presets). Animated trajectory, previous-run overlay, trajectory / position-vs-time / velocity graphs. | Closed-form analytic solution |
| **Orbit Explorer** | 2-D two-body orbits around Earth. Adjustable altitude, speed and flight-path angle. Start / pause / reset, time warp, live readouts of speed, distance, period, energy, eccentricity, periapsis/apoapsis. Circular, elliptical, escape and sub-orbital presets. Numerical path drawn over the analytic conic. | Velocity-Verlet (symplectic) integration of a = −μr/\|r\|³ |
| **Rocket Lab** | Single-stage vertical rocket. Adjustable initial mass, fuel mass, thrust, burn time, C_d, diameter; drag and inverse-square gravity toggles. Animated launch, fuel gauge, altitude / velocity / acceleration graphs, Tsiolkovsky Δv and gravity/drag losses. | RK4 integration of m(t)·dv/dt = F − m g(h) − D |
| **Aerodynamics Lab** | Airspeed, angle of attack, wing area, altitude, mass, aspect ratio. Animated schematic airflow with lift/weight/thrust/drag arrows, stall detection, lift-vs-airspeed and C_L-vs-α charts. | L = ½ρv²SC_L, finite-wing lift slope, drag polar, ISA atmosphere |
| **Challenges** | 18 problems (projectile, orbits, rockets, aerodynamics, concepts), numeric and multiple-choice. Full reasoning and equations after each attempt. Answer keys are *computed by the physics engine*, never hard-coded. | — |
| **Learning Library** | 8 lessons: Newton's laws, projectile motion, circular motion, gravitation, orbital mechanics, rocket propulsion, aerodynamics, aircraft flight. Each has explanations, equations, an SVG diagram, a worked example and a knowledge check. | — |
| **Profile & Progress** | Editable name, completed lessons, simulations run, challenge history, saved experiments (re-open in the lab), 10 achievement badges. | AsyncStorage |

Badges reward understanding and exploration (e.g. *Persistent Thinker*: solve a challenge after a wrong first attempt). There are no timers or speed rewards.

Features not in this version are labelled **Coming Soon** in the app (cloud sync / accounts).

---

## Project structure

```
AeroLearn/
├── App.tsx                     # Providers + navigator
├── app.json                    # Expo config (name, icons, package id)
├── src/
│   ├── physics/                # Pure TypeScript physics engine (no UI imports)
│   │   ├── constants.ts        # SI constants (μ⊕, R⊕, g₀, ISA)
│   │   ├── validation.ts       # Range checks, PhysicsInputError
│   │   ├── vector.ts           # 2-D vector maths
│   │   ├── projectile.ts       # Flight Lab model
│   │   ├── orbit.ts            # Two-body model, Verlet + RK4, orbital elements, conics
│   │   ├── rocket.ts           # Variable-mass rocket, RK4
│   │   ├── atmosphere.ts       # ISA + exponential atmosphere
│   │   ├── aerodynamics.ts     # Lift/drag model
│   │   └── __tests__/          # Unit tests against analytic solutions
│   ├── screens/                # One file per screen
│   ├── components/             # Design system: ui, ParamSlider, LineChart, Diagrams, Icons…
│   ├── navigation/             # Bottom tabs + native stack
│   ├── store/progress.tsx      # Local persistence (AsyncStorage)
│   ├── data/                   # Lessons, challenges, badges (+ integrity tests)
│   ├── theme/                  # Colours, spacing, typography tokens
│   └── utils/                  # Formatting, animation clock
└── docs/TECHNICAL.md           # Scientific models, numerical methods, validation
```

The physics engine never imports React. Screens call it, render the results, and animate **pre-computed** results (or, in Orbit Explorer, step the integrator live). Animation never changes the physics.

---

## Running the project

Requirements: Node.js 20+ and npm.

```bash
npm install
npx expo start          # then press "a" for Android, or scan the QR code
```

> AeroLearn uses `react-native-svg`, `react-native-screens` and AsyncStorage, all of which are included in Expo Go, so you can run it in **Expo Go** for development.

Useful scripts:

```bash
npm test                # run the 55+ unit tests (Jest, jest-expo preset)
npm run typecheck       # TypeScript strict check
```

---

## Building an Android APK

### Option A — Expo EAS cloud build (no Android SDK needed)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview     # produces an installable .apk
```

`eas.json` already contains a `preview` profile with `"buildType": "apk"`. When the build finishes EAS gives you a download link for the APK.

### Option B — Local build

Requirements: JDK 17+, Android SDK (platform 37, build-tools 37), NDK 27.1.12297006, CMake.

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

The release build is signed with the debug keystore generated by `prebuild`, which is fine for sideloading and testing. For Play Store distribution, create your own upload keystore and configure `signingConfigs.release` (or let EAS manage credentials).

Installing on a phone: copy the APK to the device, open it, and allow "Install unknown apps" for your file manager when prompted.

---

## Scientific accuracy

See **[docs/TECHNICAL.md](docs/TECHNICAL.md)** for every equation, assumption, numerical method and how each model is validated. Highlights:

- SI units everywhere internally; display conversions only at the UI edge.
- Projectile results checked against closed-form T, H, R; complementary-angle and 1/g scaling.
- Orbits: circular radius held to 1e-5 over a period, closed orbit returns to start, energy conserved to 1e-4 over 10 eccentric orbits, angular momentum to 1e-9, vis-viva identity, Verlet vs RK4 agreement.
- Rocket: burnout velocity matches Tsiolkovsky minus gravity loss; burnout altitude and coasting apogee match analytic integrals.
- Aerodynamics: ISA density matches published tables (sea level, 5 km, 11 km, 20 km); stall-speed consistency.
- Invalid inputs are rejected with clear messages; non-finite states stop the simulation instead of displaying garbage.

**These are educational, idealised models.** They are not tools for real launch prediction, satellite operations or aircraft design.

---

## Licence

MIT — see `LICENSE`.


## Rocket Hangar — V2.1

The Learn tab has been replaced with a Rocket Hangar featuring interactive, rotatable NASA 3D models of the Saturn V and Space Shuttle. A component guide explains launch escape, spacecraft, stages, boosters, engines and orbital systems. The viewer streams original NASA GLB assets and therefore requires an internet connection. The component guide is an educational exploded-view index; it does not claim that the NASA GLB mesh itself is physically separated.

The interface now uses a warm graphite, bronze and ivory palette with subtle low-opacity animated star and planet accents. Background decoration is non-interactive and does not obscure content.
