import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import { tlsSpectrum, integrateBloch, validateAgainstLorentz } from '../../core/phase2_quantum_matter/tls.js';
import { pyridinePreset } from '../../core/phase1_classical/lorentz.js';

export default function Phase2QuantumMatter() {
  const preset = pyridinePreset();

  const [T1_ps, setT1_ps] = useState(100);   // ps
  const [T2_ps, setT2_ps] = useState(50);    // ps
  const [Omega_rel, setOmega_rel] = useState(0.01); // Ω/γ ratio
  const [showValidation, setShowValidation] = useState(true);

  // Use pyridine omega0 for consistency with Phase 1
  const omega0 = preset.omega0;
  const T1 = T1_ps * 1e-12;
  const T2 = T2_ps * 1e-12;
  const gamma_lorentz = omega0 / preset.Q;
  const Omega = Omega_rel * gamma_lorentz;

  // TLS spectrum
  const tls = useMemo(() => tlsSpectrum(omega0, T1, T2, Omega, 500, 15), [omega0, T1, T2, Omega]);
  const omega_THz = tls.omega.map(w => w / 1e12);
  const maxAbs = Math.max(...tls.absorption);
  const absNorm = tls.absorption.map(v => v / maxAbs);

  // Validation against Lorentz
  const validation = useMemo(() => validateAgainstLorentz(omega0, gamma_lorentz, T1, 500), [omega0, gamma_lorentz, T1]);

  // Bloch dynamics (on-resonance π-pulse)
  const tMax = 5 * T2;
  const bloch = useMemo(() => integrateBloch(0, Omega, T1, T2, tMax, 600), [Omega, T1, T2, tMax]);
  const t_ps = bloch.t.map(t => t * 1e12);

  return (
    <>
      <div className="module-header">
        <h2>Phase 2 — Quantum Matter</h2>
        <span className="module-tag" style={{ background: 'rgba(0,229,255,0.15)', color: '#00e5ff', border: '1px solid #00e5ff' }}>
          ⟳ IN DEVELOPMENT
        </span>
      </div>
      <div className="module-body">

        {/* Status banner */}
        <div className="panel" style={{ borderLeft: '3px solid #00e5ff', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: '#00e5ff' }}>Two-Level System (TLS) — Optical Bloch Equations</strong>.
            The quantum state is the Bloch vector (u, v, w). Environmental interactions are modelled via
            T₁ (energy relaxation) and T₂ (dephasing). Validation criterion: in the weak-field limit
            (Ω ≪ γ), the TLS absorption must reproduce the Lorentz lineshape with RMS error &lt; 1%.
          </p>
        </div>

        {/* Validation result */}
        <div className="panel" style={{
          borderLeft: `3px solid ${validation.passed ? '#00e676' : '#ff1744'}`,
          marginBottom: 16,
          background: validation.passed ? 'rgba(0,230,118,0.05)' : 'rgba(255,23,68,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18, color: validation.passed ? '#00e676' : '#ff1744' }}>
              {validation.passed ? '✓ VALIDATION PASSED' : '✗ VALIDATION FAILED'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
              RMS Error = {(validation.rmsError * 100).toFixed(3)}% (threshold: 1.000%)
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
              Max Error = {(validation.maxError * 100).toFixed(3)}%
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div className="panel">
            <div className="metric">
              <div className="metric-value" style={{ color: '#00e5ff' }}>{T1_ps}<span className="metric-unit">ps</span></div>
              <div className="metric-label">T₁ (Energy Relaxation)</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value violet">{T2_ps}<span className="metric-unit">ps</span></div>
              <div className="metric-label">T₂ (Dephasing)</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value amber">{Omega_rel.toFixed(3)}<span className="metric-unit">Ω/γ</span></div>
              <div className="metric-label">Field Strength (Ω/γ)</div>
            </div>
          </div>
        </div>

        <div className="grid-2">

          {/* Ontological Validation Plot */}
          <div className="panel panel-glow" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header">
              Ontological Continuity Validation — TLS vs. Lorentz (weak-field limit)
            </div>
            <PlotlyChart
              data={[
                {
                  x: validation.lorentz_spectrum.omega.map(w => w / 1e12),
                  y: validation.lorentz_spectrum.absorption,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e676', width: 2 },
                  name: 'Phase 1: Lorentz (Classical)',
                },
                {
                  x: validation.tls_spectrum.omega.map(w => w / 1e12),
                  y: validation.tls_spectrum.absorption,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 2, dash: 'dot' },
                  name: 'Phase 2: TLS (Quantum)',
                },
              ]}
              layout={{
                xaxis: { title: 'Frequency ω (THz)' },
                yaxis: { title: 'Absorption (normalized)', range: [0, 1.1] },
                height: 300,
                legend: { font: { size: 10, color: '#8888aa' } },
                annotations: [{
                  x: omega0 / 1e12,
                  y: 1.05,
                  text: `RMS = ${(validation.rmsError * 100).toFixed(3)}%`,
                  showarrow: false,
                  font: { color: validation.passed ? '#00e676' : '#ff1744', size: 11 },
                }],
              }}
              style={{ height: '300px' }}
            />
          </div>

          {/* TLS Absorption Spectrum */}
          <div className="panel">
            <div className="panel-header">TLS Absorption Spectrum (current parameters)</div>
            <PlotlyChart
              data={[
                {
                  x: omega_THz,
                  y: absNorm,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#7c4dff', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(124,77,255,0.08)',
                  name: 'Im[χ_TLS]',
                },
              ]}
              layout={{
                xaxis: { title: 'ω (THz)' },
                yaxis: { title: 'Absorption (norm.)', range: [0, 1.1] },
                height: 260,
              }}
              style={{ height: '260px' }}
            />
          </div>

          {/* Bloch vector dynamics */}
          <div className="panel">
            <div className="panel-header">Bloch Vector Dynamics — w(t) Population Inversion</div>
            <PlotlyChart
              data={[
                {
                  x: t_ps,
                  y: bloch.w,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ff6d00', width: 2 },
                  name: 'w(t) — Inversion',
                },
                {
                  x: t_ps,
                  y: bloch.u,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 1, dash: 'dot' },
                  name: 'u(t) — In-phase',
                },
                {
                  x: t_ps,
                  y: bloch.v,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#7c4dff', width: 1, dash: 'dash' },
                  name: 'v(t) — Quadrature',
                },
              ]}
              layout={{
                xaxis: { title: 'Time (ps)' },
                yaxis: { title: 'Bloch Component', range: [-0.6, 0.6] },
                height: 260,
                legend: { font: { size: 9, color: '#8888aa' } },
              }}
              style={{ height: '260px' }}
            />
          </div>

          {/* Controls */}
          <div className="panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header">TLS Parameters</div>
            <div className="grid-3">
              <div className="control-group">
                <label className="control-label">T₁ (Relaxation): {T1_ps} ps</label>
                <input type="range" className="control-slider" min={10} max={1000} step={10}
                  value={T1_ps} onChange={e => setT1_ps(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">T₂ (Dephasing): {T2_ps} ps</label>
                <input type="range" className="control-slider" min={1} max={500} step={1}
                  value={T2_ps} onChange={e => setT2_ps(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Field Strength Ω/γ: {Omega_rel.toFixed(3)}</label>
                <input type="range" className="control-slider" min={1} max={200} step={1}
                  value={Omega_rel * 1000}
                  onChange={e => setOmega_rel(e.target.value / 1000)} />
              </div>
            </div>
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', lineHeight: 2 }}>
              <span style={{ marginRight: 24 }}>T₂ ≤ 2T₁ constraint: {T2_ps <= 2 * T1_ps ? '✓ satisfied' : '✗ violated'}</span>
              <span style={{ marginRight: 24 }}>Rabi freq Ω = {(Omega / 1e9).toFixed(2)} GHz</span>
              <span>Saturation param S = Ω²T₁T₂ = {(Omega * Omega * T1 * T2).toExponential(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
