import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import { jcSpectrum, collapseRevival, vacuumRabiSplitting } from '../../core/phase4_quantum_field/jaynes_cummings.js';
import { CONSTANTS } from '../../core/shared/constants.js';

export default function Phase4QuantumField() {
  const [g_MHz, setG_MHz] = useState(50);       // Coupling in MHz
  const [delta_MHz, setDelta_MHz] = useState(0); // Detuning in MHz
  const [alpha, setAlpha] = useState(2);         // Coherent state amplitude

  const g = g_MHz * 1e6 * 2 * Math.PI; // rad/s
  const delta = delta_MHz * 1e6 * 2 * Math.PI;

  const spectrum = useMemo(() => jcSpectrum(g, delta, 10), [g, delta]);
  const cr = useMemo(() => collapseRevival(g, alpha, 20 / (g_MHz * 1e6), 600, 60), [g, alpha, g_MHz]);
  const t_us = cr.t.map(t => t * 1e6);
  const splitting_MHz = (vacuumRabiSplitting(g) / (2 * Math.PI * 1e6)).toFixed(2);

  return (
    <>
      <div className="module-header">
        <h2>Phase 4 — Quantum Field</h2>
        <span className="module-tag" style={{ background: 'rgba(124,77,255,0.15)', color: '#7c4dff', border: '1px solid #7c4dff' }}>
          ◷ PLANNED
        </span>
      </div>
      <div className="module-body">
        <div className="panel" style={{ borderLeft: '3px solid #7c4dff', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: '#7c4dff' }}>Jaynes-Cummings Model</strong> — A two-level atom coupled to a
            single quantized cavity mode. Hamiltonian: H = ℏω_c a†a + ℏω_a σ_z/2 + ℏg(a†σ₋ + aσ₊).
            Key phenomena: vacuum Rabi splitting (2g), Fock states, collapse and revival of Rabi oscillations.
          </p>
        </div>

        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div className="panel">
            <div className="metric">
              <div className="metric-value violet">{splitting_MHz}<span className="metric-unit">MHz</span></div>
              <div className="metric-label">Vacuum Rabi Splitting (2g)</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value" style={{ color: '#00e5ff' }}>{g_MHz}<span className="metric-unit">MHz</span></div>
              <div className="metric-label">Coupling Strength g/2π</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value amber">{(alpha * alpha).toFixed(1)}</div>
              <div className="metric-label">Mean Photon Number n̄ = |α|²</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* JC energy spectrum */}
          <div className="panel panel-glow">
            <div className="panel-header">Dressed State Spectrum — E±(n)</div>
            <PlotlyChart
              data={[
                {
                  x: spectrum.n,
                  y: spectrum.E_plus.map(e => e / (CONSTANTS.hbar * g)),
                  type: 'scatter', mode: 'lines+markers',
                  line: { color: '#7c4dff', width: 2 },
                  marker: { size: 6 },
                  name: 'E₊(n) / ℏg',
                },
                {
                  x: spectrum.n,
                  y: spectrum.E_minus.map(e => e / (CONSTANTS.hbar * g)),
                  type: 'scatter', mode: 'lines+markers',
                  line: { color: '#00e5ff', width: 2 },
                  marker: { size: 6 },
                  name: 'E₋(n) / ℏg',
                },
              ]}
              layout={{
                xaxis: { title: 'Photon Number n' },
                yaxis: { title: 'Energy / ℏg' },
                height: 280,
                legend: { font: { size: 9, color: '#8888aa' } },
              }}
              style={{ height: '280px' }}
            />
          </div>

          {/* Collapse and revival */}
          <div className="panel panel-glow">
            <div className="panel-header">Collapse & Revival — P_e(t) for coherent state |α⟩</div>
            <PlotlyChart
              data={[{
                x: t_us,
                y: cr.Pe,
                type: 'scatter', mode: 'lines',
                line: { color: '#ff6d00', width: 2 },
                name: 'P_e(t)',
              }]}
              layout={{
                xaxis: { title: 'Time (μs)' },
                yaxis: { title: 'Excited State Population', range: [0, 1] },
                height: 280,
              }}
              style={{ height: '280px' }}
            />
          </div>

          {/* Controls */}
          <div className="panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header">Cavity QED Parameters</div>
            <div className="grid-3">
              <div className="control-group">
                <label className="control-label">Coupling g/2π: {g_MHz} MHz</label>
                <input type="range" className="control-slider" min={1} max={200} value={g_MHz}
                  onChange={e => setG_MHz(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Detuning Δ/2π: {delta_MHz} MHz</label>
                <input type="range" className="control-slider" min={-200} max={200} value={delta_MHz}
                  onChange={e => setDelta_MHz(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Coherent amplitude |α|: {alpha.toFixed(1)}</label>
                <input type="range" className="control-slider" min={1} max={10} step={0.5} value={alpha}
                  onChange={e => setAlpha(Number(e.target.value))} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
