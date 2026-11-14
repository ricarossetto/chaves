// Shared motion vocabulary.
//
// Durations and easings mirror the CSS custom properties in index.css
// (--duration-*, --ease-*). Springs live here because physics cannot be
// expressed as a CSS duration, and the two systems are used for different
// jobs: CSS transitions for state that a stylesheet can own, springs for
// things that interrupt.
//
// Rule of thumb used across the app:
//   micro  80ms  icon swap, press release
//   quick  150ms text swap, toast exit, hover settles
//   fast   250ms surfaces opening, page swaps
//   slow   400ms content revealing
// Everything that repeats or runs on a loop is CSS-only so it keeps running
// while React is idle.

/** Enter and settle. Mirrors --ease-smooth-out. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** Symmetric swaps. Mirrors --ease-soft-in-out. */
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
/** Drawers and panels that leave toward an edge. */
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** CSS string form of EASE_OUT for inline style transitions. */
export const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Durations in seconds, for the `motion` API. */
export const DURATION = {
  micro: 0.08,
  quick: 0.15,
  fast: 0.25,
  medium: 0.35,
  slow: 0.4,
} as const;

/** Distances in px. Nothing travels further than 12px inside this app. */
export const DISTANCE = {
  micro: 4,
  base: 8,
  medium: 12,
} as const;

/** Press feedback on buttons and other tappable surfaces. */
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.6,
} as const;

/** Content swaps — label/icon slots trading places inside a control. */
export const SPRING_SWAP = {
  type: "spring",
  stiffness: 460,
  damping: 30,
  mass: 0.55,
} as const;

/** Overlay panel entrances — modals and sheets summoned by pointer. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.5,
} as const;

/** Shared-layout glides — pills, indicators and panels morphing between positions. */
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 360,
  damping: 32,
  mass: 0.6,
} as const;

/** Cursor-follow physics for decorative mouse tracking (magnetic, tilt, dock). */
export const SPRING_MOUSE = {
  stiffness: 200,
  damping: 15,
  mass: 0.3,
} as const;

/** Dragged handles and fills (sliders) — critically damped `useSpring` config,
 * so the value follows the pointer butterily and never rebounds off an end. */
export const SPRING_GLIDE = {
  stiffness: 700,
  damping: 50,
  mass: 0.5,
} as const;
