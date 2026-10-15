export const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
export const EASE_OUT_QUAD = [0.25, 0.46, 0.45, 0.94] as const;
export const EASE = [0.25, 0.1, 0.25, 1] as const;
export const EASE_OUT = [0, 0, 0.58, 1] as const;
export const EASE_IN = [0.42, 0, 1, 1] as const;

export const PRESSED = { scale: 0.95 } as const;
export const PRESS_TRANSITION = { duration: 0.2, ease: EASE } as const;
