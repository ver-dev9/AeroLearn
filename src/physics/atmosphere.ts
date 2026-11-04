/**
 * Atmosphere models.
 *
 * 1. ISA troposphere (0–11 km) for the Aerodynamics Lab:
 *      T = T₀ − L h
 *      p = p₀ (T / T₀)^(g₀ / (R L))
 *      ρ = p / (R T)
 *    Above 11 km we use the isothermal lower-stratosphere layer (to 20 km).
 *
 * 2. Exponential atmosphere for the Rocket Lab drag estimate:
 *      ρ(h) = ρ₀ e^(−h/H),  H = 8.5 km
 *    This is a rough fit, good to tens of percent below ~100 km.
 */
import { G0, LAPSE_RATE, P_SEA_LEVEL, R_AIR, RHO_SEA_LEVEL, SCALE_HEIGHT, T_SEA_LEVEL, TROPOPAUSE } from './constants';

export interface AtmosphereState {
  temperature: number; // K
  pressure: number; // Pa
  density: number; // kg/m³
}

export function isa(altitude: number): AtmosphereState {
  if (!Number.isFinite(altitude) || altitude < 0 || altitude > 20000) {
    throw new RangeError('ISA model is implemented for 0–20 000 m.');
  }
  const exp = G0 / (R_AIR * LAPSE_RATE);
  if (altitude <= TROPOPAUSE) {
    const T = T_SEA_LEVEL - LAPSE_RATE * altitude;
    const p = P_SEA_LEVEL * Math.pow(T / T_SEA_LEVEL, exp);
    return { temperature: T, pressure: p, density: p / (R_AIR * T) };
  }
  const T11 = T_SEA_LEVEL - LAPSE_RATE * TROPOPAUSE;
  const p11 = P_SEA_LEVEL * Math.pow(T11 / T_SEA_LEVEL, exp);
  const p = p11 * Math.exp((-G0 * (altitude - TROPOPAUSE)) / (R_AIR * T11));
  return { temperature: T11, pressure: p, density: p / (R_AIR * T11) };
}

export function exponentialDensity(altitude: number): number {
  if (altitude <= 0) return RHO_SEA_LEVEL;
  return RHO_SEA_LEVEL * Math.exp(-altitude / SCALE_HEIGHT);
}
