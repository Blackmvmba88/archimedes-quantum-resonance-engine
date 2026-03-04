// ============================================================
// Archimedes Quantum Laboratory — Phase 2: Quantum Matter
// Model: Two-Level System (TLS) — Optical Bloch Equations
//
// The quantum state is described by the density matrix ρ,
// parameterized by the Bloch vector (u, v, w):
//   u = Re[ρ₁₂] (in-phase coherence)
//   v = Im[ρ₁₂] (quadrature coherence)
//   w = (ρ₂₂ - ρ₁₁)/2 (population inversion, w₀ = -1/2)
//
// Optical Bloch Equations (rotating wave approximation):
//   du/dt = -δ·v - u/T₂
//   dv/dt =  δ·u + Ω·w - v/T₂
//   dw/dt = -Ω·v - (w - w₀)/T₁
//
// where:
//   δ = ω - ω₀  (detuning)
//   Ω = μ·E₀/ℏ  (Rabi frequency)
//   T₁ = longitudinal relaxation time (energy)
//   T₂ = transverse relaxation time (dephasing)
//
// Validation: In the weak-field limit (Ω << γ), the steady-state
// absorption of the TLS must reproduce the classical Lorentz
// lineshape from Phase 1 with RMS error < 1%.
//
// Status: IN DEVELOPMENT
// ============================================================

import { CONSTANTS } from '../shared/constants.js';

/**
 * Steady-state Bloch vector components for a driven TLS.
 * Solved analytically from dρ/dt = 0.
 *
 * @param {number} delta  - Detuning ω - ω₀ (rad/s)
 * @param {number} Omega  - Rabi frequency (rad/s)
 * @param {number} T1     - Longitudinal relaxation time (s)
 * @param {number} T2     - Transverse relaxation time (s)
 * @returns {{ u: number, v: number, w: number }}
 */
export function steadyStateBloch(delta, Omega, T1, T2) {
  const gamma1 = 1 / T1;
  const gamma2 = 1 / T2;
  const w0 = -0.5; // Ground state

  // Saturation parameter
  const S = Omega * Omega * T1 * T2;
  const denom = 1 + (delta * T2) ** 2 + S;

  const w = w0 / denom;
  const u = -delta * T2 * Omega * T2 * w0 / denom;
  const v = -Omega * T2 * w0 / denom;

  return { u, v, w };
}

/**
 * Absorption spectrum of the TLS (imaginary part of susceptibility).
 * Im[χ_TLS(ω)] ∝ v_ss(ω) / Ω  (in the weak-field limit)
 *
 * @param {number} omega0   - Transition frequency (rad/s)
 * @param {number} T1       - Longitudinal relaxation time (s)
 * @param {number} T2       - Transverse relaxation time (s)
 * @param {number} Omega    - Rabi frequency (rad/s), keep small for weak-field
 * @param {number} nPoints  - Number of frequency points
 * @param {number} span     - Frequency span as multiple of 1/T2
 * @returns {{ omega: number[], absorption: number[], chi_re: number[], chi_im: number[] }}
 */
export function tlsSpectrum(omega0, T1, T2, Omega = 1e6, nPoints = 400, span = 20) {
  const gamma2 = 1 / T2;
  const omegaMin = omega0 - span * gamma2;
  const omegaMax = omega0 + span * gamma2;
  const omega = [], absorption = [], chi_re = [], chi_im = [];

  for (let i = 0; i < nPoints; i++) {
    const w = omegaMin + (omegaMax - omegaMin) * i / (nPoints - 1);
    const delta = w - omega0;
    const ss = steadyStateBloch(delta, Omega, T1, T2);

    // Susceptibility components (proportional to Bloch coherences)
    const chi_r = ss.u / Omega;
    const chi_i = -ss.v / Omega; // Positive = absorption

    omega.push(w);
    absorption.push(chi_i);
    chi_re.push(chi_r);
    chi_im.push(chi_i);
  }

  return { omega, absorption, chi_re, chi_im };
}

/**
 * Runge-Kutta 4th order integration of the Optical Bloch Equations.
 * Useful for time-domain dynamics (pulse excitation, Rabi oscillations).
 *
 * @param {number} delta    - Detuning (rad/s)
 * @param {number} Omega    - Rabi frequency (rad/s)
 * @param {number} T1       - Longitudinal relaxation (s)
 * @param {number} T2       - Transverse relaxation (s)
 * @param {number} tMax     - Total simulation time (s)
 * @param {number} nSteps   - Number of time steps
 * @returns {{ t: number[], u: number[], v: number[], w: number[] }}
 */
export function integrateBloch(delta, Omega, T1, T2, tMax, nSteps = 1000) {
  const dt = tMax / nSteps;
  let u = 0, v = 0, w = -0.5; // Initial state: ground state
  const t = [], uArr = [], vArr = [], wArr = [];

  const derivs = (u, v, w) => ({
    du: -delta * v - u / T2,
    dv:  delta * u + Omega * w - v / T2,
    dw: -Omega * v - (w + 0.5) / T1,
  });

  for (let i = 0; i <= nSteps; i++) {
    t.push(i * dt);
    uArr.push(u);
    vArr.push(v);
    wArr.push(w);

    // RK4
    const k1 = derivs(u, v, w);
    const k2 = derivs(u + 0.5 * dt * k1.du, v + 0.5 * dt * k1.dv, w + 0.5 * dt * k1.dw);
    const k3 = derivs(u + 0.5 * dt * k2.du, v + 0.5 * dt * k2.dv, w + 0.5 * dt * k2.dw);
    const k4 = derivs(u + dt * k3.du, v + dt * k3.dv, w + dt * k3.dw);

    u += (dt / 6) * (k1.du + 2 * k2.du + 2 * k3.du + k4.du);
    v += (dt / 6) * (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv);
    w += (dt / 6) * (k1.dw + 2 * k2.dw + 2 * k3.dw + k4.dw);
  }

  return { t, u: uArr, v: vArr, w: wArr };
}

/**
 * Rabi frequency from dipole moment and field amplitude.
 * Ω = μ·E₀ / ℏ
 * @param {number} mu_dipole - Dipole moment (C·m)
 * @param {number} E0        - Electric field amplitude (V/m)
 * @returns {number} Rabi frequency (rad/s)
 */
export function rabiFrequency(mu_dipole, E0) {
  return mu_dipole * E0 / CONSTANTS.hbar;
}

/**
 * Validate TLS against Lorentz: compute RMS error between
 * normalized TLS absorption and Lorentz absorption spectra.
 *
 * @param {number} omega0  - Transition/resonance frequency (rad/s)
 * @param {number} gamma   - Lorentz damping = 2/T2 (rad/s)
 * @param {number} T1      - TLS longitudinal relaxation (s)
 * @param {number} nPoints - Number of frequency points
 * @returns {{ rmsError: number, maxError: number, passed: boolean }}
 */
export function validateAgainstLorentz(omega0, gamma, T1, nPoints = 400) {
  // T2 from Lorentz damping: γ = 1/T2 (pure dephasing limit, T1 >> T2)
  const T2 = 1 / gamma;
  const Omega_weak = gamma * 0.01; // Weak field: Ω << γ

  const tls = tlsSpectrum(omega0, T1, T2, Omega_weak, nPoints);

  // Lorentz absorption: Im[χ] ∝ γ / ((ω₀² - ω²)² + (γω)²)
  // In the near-resonance limit: ≈ (γ/2) / ((ω - ω₀)² + (γ/2)²)
  const lorentz_abs = tls.omega.map(w => {
    const delta = w - omega0;
    return (gamma / 2) / (delta * delta + (gamma / 2) ** 2);
  });

  // Normalize both spectra to peak = 1
  const tlsPeak = Math.max(...tls.absorption);
  const lzPeak = Math.max(...lorentz_abs);

  const tlsNorm = tls.absorption.map(v => v / tlsPeak);
  const lzNorm = lorentz_abs.map(v => v / lzPeak);

  // RMS error
  const squaredErrors = tlsNorm.map((v, i) => (v - lzNorm[i]) ** 2);
  const rmsError = Math.sqrt(squaredErrors.reduce((a, b) => a + b, 0) / nPoints);
  const maxError = Math.max(...squaredErrors.map(Math.sqrt));

  return {
    rmsError,
    maxError,
    passed: rmsError < 0.01, // < 1% RMS error
    tls_spectrum: { omega: tls.omega, absorption: tlsNorm },
    lorentz_spectrum: { omega: tls.omega, absorption: lzNorm },
  };
}
