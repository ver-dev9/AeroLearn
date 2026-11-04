/** Minimal immutable 2D vector utilities for the orbital integrator. */
export interface Vec2 {
  x: number;
  y: number;
}

export const vec = (x: number, y: number): Vec2 => ({ x, y });
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Vec2, k: number): Vec2 => ({ x: a.x * k, y: a.y * k });
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
/** z-component of the 3D cross product a × b. */
export const cross = (a: Vec2, b: Vec2): number => a.x * b.y - a.y * b.x;
export const norm = (a: Vec2): number => Math.hypot(a.x, a.y);
