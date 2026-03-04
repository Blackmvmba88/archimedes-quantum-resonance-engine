// ============================================================
// Archimedes Quantum Laboratory — Phase 4: Quantum Field
// Model: Jaynes-Cummings (atom + cavity QED)
//
// Hamiltonian (rotating wave approximation):
//   H = ℏω_c a†a + ℏω_a σ_z/2 + ℏg(a†σ₋ + aσ₊)
//
// Key phenomena:
//   - Vacuum Rabi splitting: 2g
//   - Photon number states (Fock states)
//   - Collapse and revival of Rabi oscillations
//
// Status: PLANNED
// ============================================================

import { CONSTANTS } from '../shared/constants.js';

/**
 * Jaynes-Cummings energy spectrum.
 * Dressed states: E±(n) = ℏω_c(n + 1/2) ± ℏ√(g²(n+1) + Δ²/4)
 * where Δ = ω_a - ω_c (atom-cavity detuning)
 *
 * @param {number} g        - Coupling strength (rad/s)
 * @param {number} delta    - Atom-cavity detuning ω_a - ω_c (rad/s)
 * @param {number} nMax     - Maximum photon number to compute
 * @returns {{ n: number[], E_plus: number[], E_minus: number[], splitting: number[] }}
 */
export function jcSpectrum(g, delta, nMax = 10) {
  const n = [], E_plus = [], E_minus = [], splitting = [];

  for (let ni = 0; ni <= nMax; ni++) {
    const Omega_n = Math.sqrt(g * g * (ni + 1) + (delta / 2) ** 2);
    n.push(ni);
    E_plus.push(CONSTANTS.hbar * Omega_n);
    E_minus.push(-CONSTANTS.hbar * Omega_n);
    splitting.push(2 * CONSTANTS.hbar * Omega_n);
  }

  return { n, E_plus, E_minus, splitting };
}

/**
 * Vacuum Rabi splitting (n=0 manifold): 2g
 * @param {number} g - Coupling strength (rad/s)
 * @returns {number} Splitting in rad/s
 */
export function vacuumRabiSplitting(g) {
  return 2 * g;
}

/**
 * Collapse and revival of Rabi oscillations for a coherent state |α⟩.
 * P_e(t) = excited state population.
 *
 * @param {number} g      - Coupling strength (rad/s)
 * @param {number} alpha  - Coherent state amplitude (mean photon number = |α|²)
 * @param {number} tMax   - Maximum time (s)
 * @param {number} nSteps - Time steps
 * @param {number} nMax   - Photon number truncation
 * @returns {{ t: number[], Pe: number[] }}
 */
export function collapseRevival(g, alpha, tMax, nSteps = 500, nMax = 50) {
  const dt = tMax / nSteps;
  const nBar = alpha * alpha; // Mean photon number

  // Poisson distribution P(n) = e^{-nBar} * nBar^n / n!
  const P_n = [];
  let logP = -nBar;
  for (let n = 0; n <= nMax; n++) {
    P_n.push(Math.exp(logP));
    logP += Math.log(nBar) - Math.log(n + 1);
  }

  const t = [], Pe = [];
  for (let i = 0; i <= nSteps; i++) {
    const ti = i * dt;
    t.push(ti);

    let pe = 0;
    for (let n = 0; n <= nMax; n++) {
      const Omega_n = g * Math.sqrt(n + 1);
      pe += P_n[n] * Math.cos(Omega_n * ti) ** 2;
    }
    Pe.push(0.5 - 0.5 * pe); // Starts in ground state
  }

  return { t, Pe };
}
