// ============================================================
// Archimedes Quantum Laboratory — Phase 5: Condensed Matter
// Model: Exciton-Polaritons (coupled oscillator model)
//
// Polaritons are hybrid light-matter quasiparticles arising
// from the strong coupling between excitons and photons in
// a semiconductor microcavity.
//
// Coupled oscillator Hamiltonian:
//   H = [ E_X   g  ] [α]
//       [  g   E_C ] [β]
//
// Eigenvalues (polariton branches):
//   E_LP/UP = (E_X + E_C)/2 ∓ √(g² + Δ²/4)
//   where Δ = E_X - E_C (exciton-photon detuning)
//
// Status: PLANNED
// ============================================================

/**
 * Polariton dispersion relation (lower and upper polariton branches).
 *
 * @param {number} g       - Coupling strength (eV)
 * @param {number} E_X     - Exciton energy (eV)
 * @param {number} E_C0    - Cavity photon energy at k=0 (eV)
 * @param {number} m_C     - Effective photon mass (in units of electron mass)
 * @param {number} kMax    - Maximum in-plane wavevector (μm⁻¹)
 * @param {number} nPoints - Number of k-points
 * @returns {{ k, E_LP, E_UP, E_X_arr, E_C_arr, hopfield_X, hopfield_C }}
 */
export function polaritonDispersion(g, E_X, E_C0, m_C = 1e-4, kMax = 5, nPoints = 200) {
  const k = [], E_LP = [], E_UP = [], E_X_arr = [], E_C_arr = [];
  const hopfield_X = [], hopfield_C = [];

  // ℏ²/(2m_C) in eV·μm²
  const hbar2_2m = 3.81e-2 / m_C; // eV·μm²

  for (let i = 0; i < nPoints; i++) {
    const ki = -kMax + 2 * kMax * i / (nPoints - 1);
    const E_C = E_C0 + hbar2_2m * ki * ki; // Parabolic photon dispersion

    const delta = E_X - E_C;
    const Omega = Math.sqrt(g * g + (delta / 2) ** 2);

    k.push(ki);
    E_X_arr.push(E_X);
    E_C_arr.push(E_C);
    E_LP.push((E_X + E_C) / 2 - Omega);
    E_UP.push((E_X + E_C) / 2 + Omega);

    // Hopfield coefficients (exciton fraction |X|²)
    const X2 = 0.5 * (1 + delta / (2 * Omega));
    hopfield_X.push(X2);
    hopfield_C.push(1 - X2);
  }

  return { k, E_LP, E_UP, E_X_arr, E_C_arr, hopfield_X, hopfield_C };
}

/**
 * Rabi splitting (vacuum coupling strength) from oscillator strength.
 * @param {number} g - Coupling (eV)
 * @returns {number} Rabi splitting in eV
 */
export function rabiSplitting(g) {
  return 2 * g;
}
