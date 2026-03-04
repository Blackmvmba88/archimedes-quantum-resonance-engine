// ============================================================
// Archimedes Quantum Laboratory — Phase 6: Quantum Error Correction
// Model: Stabilizer Codes (Steane, Surface Code)
//
// Key concepts:
//   - Logical qubit: encoded in multiple physical qubits
//   - Stabilizer generators: detect errors without measuring state
//   - Syndrome measurement: identify error type and location
//   - Threshold theorem: below physical error rate p_th,
//     logical error rate decreases with code distance d
//
// Status: PLANNED
// ============================================================

/**
 * Simulate bit-flip error channel on n physical qubits.
 * Each qubit flips with probability p.
 *
 * @param {number} n - Number of physical qubits
 * @param {number} p - Physical error rate per qubit
 * @returns {boolean[]} Error pattern (true = flipped)
 */
export function bitFlipChannel(n, p) {
  return Array.from({ length: n }, () => Math.random() < p);
}

/**
 * 3-qubit bit-flip code syndrome measurement.
 * Stabilizers: Z₁Z₂, Z₂Z₃
 * Syndrome: [s1, s2] where si = 1 if error detected.
 *
 * @param {boolean[]} errors - Error pattern on 3 qubits
 * @returns {{ syndrome: number[], correction: number }}
 */
export function bitFlipSyndrome(errors) {
  const [e0, e1, e2] = errors;
  const s1 = (e0 !== e1) ? 1 : 0; // Z₁Z₂ anticommutes if odd errors on q0 or q1
  const s2 = (e1 !== e2) ? 1 : 0; // Z₂Z₃

  // Decode
  let correction = -1;
  if (s1 === 0 && s2 === 0) correction = -1; // No error
  if (s1 === 1 && s2 === 0) correction = 0;  // Error on qubit 0
  if (s1 === 1 && s2 === 1) correction = 1;  // Error on qubit 1
  if (s1 === 0 && s2 === 1) correction = 2;  // Error on qubit 2

  return { syndrome: [s1, s2], correction };
}

/**
 * Logical error rate for the 3-qubit repetition code.
 * P_L = 3p² - 2p³ (two or more errors cause logical failure)
 *
 * @param {number} p - Physical error rate
 * @returns {number} Logical error rate
 */
export function repetitionCodeLogicalError(p) {
  return 3 * p * p - 2 * p * p * p;
}

/**
 * Threshold analysis: compute logical error rates vs physical error rates
 * for the repetition code and compare to unencoded qubit.
 *
 * @param {number} nPoints - Number of error rate points
 * @returns {{ p_phys, p_logical, p_unencoded }}
 */
export function thresholdAnalysis(nPoints = 100) {
  const p_phys = [], p_logical = [], p_unencoded = [];

  for (let i = 0; i < nPoints; i++) {
    const p = (i + 1) / nPoints * 0.5; // 0 to 0.5
    p_phys.push(p);
    p_logical.push(repetitionCodeLogicalError(p));
    p_unencoded.push(p);
  }

  // Threshold: where p_logical = p_phys → p_th = 1/3 for 3-qubit code
  const threshold = 1 / 3;

  return { p_phys, p_logical, p_unencoded, threshold };
}
