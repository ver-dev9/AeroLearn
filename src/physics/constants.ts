/**
 * Physical constants used across the AeroLearn physics engine.
 * All values are SI units unless the name says otherwise.
 *
 * Sources: IERS Conventions (2010) for GM⊕, IUGG mean Earth radius,
 * ISO 2533:1975 International Standard Atmosphere, CODATA standard gravity.
 */

/** Standard gravitational acceleration at Earth's surface, m/s² (exact by definition). */
export const G0 = 9.80665;

/** Newtonian constant of gravitation, m³ kg⁻¹ s⁻² (CODATA 2018). */
export const G = 6.6743e-11;

/** Earth's standard gravitational parameter μ = GM, m³/s². */
export const MU_EARTH = 3.986004418e14;

/** Mean radius of Earth, m. */
export const R_EARTH = 6.371e6;

/** ISA sea-level air density, kg/m³. */
export const RHO_SEA_LEVEL = 1.225;

/** ISA sea-level temperature, K. */
export const T_SEA_LEVEL = 288.15;

/** ISA sea-level pressure, Pa. */
export const P_SEA_LEVEL = 101325;

/** ISA troposphere temperature lapse rate, K/m. */
export const LAPSE_RATE = 0.0065;

/** Specific gas constant for dry air, J/(kg·K). */
export const R_AIR = 287.05287;

/** Altitude of the ISA tropopause, m. */
export const TROPOPAUSE = 11000;

/** Scale height used by the simple exponential atmosphere (rocket drag), m. */
export const SCALE_HEIGHT = 8500;

/** Reference gravity values for the Flight Lab presets, m/s². */
export const GRAVITY_PRESETS: { label: string; g: number }[] = [
  { label: 'Earth', g: 9.80665 },
  { label: 'Moon', g: 1.62 },
  { label: 'Mars', g: 3.71 },
  { label: 'Jupiter', g: 24.79 },
];

export const DEG = Math.PI / 180;
