// Camera + pack sizing shared by the WebGL stage and the hero → slider pack flight,
// so the flying pack lands exactly where the 3D pack is drawn.
export const STAGE_FOV = 35;
export const CAMERA_Z = 11.5;
export const PACK_H = 3.7; // world units; piece layouts are stored in "pack heights"

// Pack height as a fraction of the (square) stage's height.
export const PACK_FRACTION = PACK_H / (2 * Math.tan(((STAGE_FOV / 2) * Math.PI) / 180) * CAMERA_Z);
