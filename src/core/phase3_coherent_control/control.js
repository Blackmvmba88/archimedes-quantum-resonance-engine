// ============================================================
// Archimedes Quantum Laboratory — Phase 3: Coherent Control
// Model: Optimal Control of a Two-Level System
//
// Goal: Design shaped electromagnetic pulses to manipulate
// the quantum state with high fidelity.
//
// Key concepts:
//   - π-pulse: complete population inversion (|0⟩ → |1⟩)
//   - Bloch sphere trajectory visualization
//   - Pulse shaping: Gaussian, square, DRAG
//
// Status: PLANNED
// ============================================================

import { integrateBloch } from '../phase2_quantum_matter/tls.js';

/**
 * Gaussian pulse envelope.
 * @param {number} t      - Time (s)
 * @param {number} t0     - Pulse center (s)
 * @param {number} sigma  - Pulse width (s)
 * @param {number} Omega0 - Peak Rabi frequency (rad/s)
 * @returns {number} Instantaneous Rabi frequency
 */
export function gaussianPulse(t, t0, sigma, Omega0) {
  return Omega0 * Math.exp(-0.5 * ((t - t0) / sigma) ** 2);
}

/**
 * Square pulse envelope.
 * @param {number} t      - Time (s)
 * @param {number} t0     - Pulse start (s)
 * @param {number} tEnd   - Pulse end (s)
 * @param {number} Omega0 - Rabi frequency during pulse (rad/s)
 * @returns {number} Instantaneous Rabi frequency
 */
export function squarePulse(t, t0, tEnd, Omega0) {
  return (t >= t0 && t <= tEnd) ? Omega0 : 0;
}

/**
 * Compute the Bloch sphere trajectory for a given pulse shape.
 * Returns the (u, v, w) trajectory and the final state fidelity
 * compared to the target state.
 *
 * @param {string} pulseType  - 'gaussian' | 'square' | 'pi'
 * @param {number} omega0     - Transition frequency (rad/s)
 * @param {number} T1         - Longitudinal relaxation (s)
 * @param {number} T2         - Transverse relaxation (s)
 * @param {number} tMax       - Total pulse duration (s)
 * @param {number} nSteps     - Integration steps
 * @returns {{ t, u, v, w, fidelity, blochRadius }}
 */
export function pulseTrajectory(pulseType, omega0, T1, T2, tMax, nSteps = 500) {
  const dt = tMax / nSteps;
  let u = 0, v = 0, w = -0.5;
  const t = [], uArr = [], vArr = [], wArr = [];

  // π-pulse condition: ∫Ω(t)dt = π
  const Omega0 = Math.PI / tMax;
  const sigma = tMax / 6;
  const t0 = tMax / 2;

  for (let i = 0; i <= nSteps; i++) {
    const ti = i * dt;
    t.push(ti);
    uArr.push(u);
    vArr.push(v);
    wArr.push(w);

    let Omega;
    if (pulseType === 'gaussian') {
      // Rescale so area = π
      const area = sigma * Math.sqrt(2 * Math.PI);
      Omega = gaussianPulse(ti, t0, sigma, Math.PI / area);
    } else if (pulseType === 'square') {
      Omega = squarePulse(ti, 0, tMax, Omega0);
    } else {
      // Ideal π-pulse (instantaneous, for reference)
      Omega = Omega0;
    }

    const delta = 0; // On resonance
    const du = -delta * v - u / T2;
    const dv =  delta * u + Omega * w - v / T2;
    const dw = -Omega * v - (w + 0.5) / T1;

    u += dt * du;
    v += dt * dv;
    w += dt * dw;
  }

  // Fidelity: how close is final w to +0.5 (excited state)?
  const fidelity = (w + 0.5) / 1.0; // 1.0 = perfect inversion
  const blochRadius = uArr.map((ui, i) => Math.sqrt(ui ** 2 + vArr[i] ** 2 + wArr[i] ** 2));

  return { t, u: uArr, v: vArr, w: wArr, fidelity, blochRadius };
}

/**
 * π-pulse duration for a given Rabi frequency.
 * t_π = π / Ω
 * @param {number} Omega - Rabi frequency (rad/s)
 * @returns {number} π-pulse duration (s)
 */
export function piPulseDuration(Omega) {
  return Math.PI / Omega;
}
