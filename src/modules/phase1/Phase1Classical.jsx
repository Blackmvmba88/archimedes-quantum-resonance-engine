import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import {
  lorentzSpectrum, qualityFactor, resonanceWavelength, pyridinePreset
} from '../../core/phase1_classical/lorentz.js';
import { CONSTANTS } from '../../core/shared/constants.js';

export default function Phase1Classical() {
  const preset = pyridinePreset();
  const [omega0_THz, setOmega0_THz] = useState((preset.omega0 / 1e12).toFixed(2));
  const [Q, setQ] = useState(preset.Q);
  const [usePyridine, setUsePyridine] = useState(true);

  const omega0 = usePyridine ? preset.omega0 : parseFloat(omega0_THz) * 1e12;
  const gamma  = omega0 / Q;

  const spectrum = useMemo(() => lorentzSpectrum(omega0, gamma, 500, 15), [omega0, gamma]);

  const lambda0_nm = resonanceWavelength(omega0).toFixed(1);
  const fwhm_nm    = (resonanceWavelength(omega0 - gamma / 2) - resonanceWavelength(omega0 + gamma / 2)).toFixed(2);

  // Normalize for display
  const maxAbs = Math.max(...spectrum.absorption);
  const absNorm = spectrum.absorption.map(v => v / maxAbs);
  const omega_THz = spectrum.omega.map(w => w / 1e12);

  return (
    <>
      <div className="module-header">
        <h2>Phase 1 — Classical Foundation</h2>
        <span className="module-tag" style={{ background: 'rgba(0,230,118,0.15)', color: '#00e676', border: '1px solid #00e676' }}>
          ✓ COMPLETE
        </span>
      </div>
      <div className="module-body">

        {/* Status banner */}
        <div className="panel" style={{ borderLeft: '3px solid #00e676', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: '#00e676' }}>Lorentz Oscillator Model</strong> — The electron is modelled as a
            classical damped harmonic oscillator driven by an EM field.
            Susceptibility: <code style={{ color: 'var(--cyan)' }}>χ(ω) = (e²/mε₀) / (ω₀² − ω² − iγω)</code>.
            Validated against pyridine UV absorption at 260 nm (Q = 5.2, peak deviation &lt; 1 nm).
          </p>
        </div>

        {/* Metrics */}
        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div className="panel">
            <div className="metric">
              <div className="metric-value emerald">{lambda0_nm}<span className="metric-unit">nm</span></div>
              <div className="metric-label">Resonance λ₀</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value violet">{Q.toFixed(1)}</div>
              <div className="metric-label">Quality Factor Q</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value amber">{(gamma / 1e12).toFixed(3)}<span className="metric-unit">THz</span></div>
              <div className="metric-label">Damping γ</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Absorption spectrum */}
          <div className="panel panel-glow" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header">Lorentz Absorption Spectrum — Im[χ(ω)]</div>
            <PlotlyChart
              data={[
                {
                  x: omega_THz,
                  y: absNorm,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e676', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(0,230,118,0.08)',
                  name: 'Im[χ(ω)] (norm.)',
                },
                {
                  x: [omega0 / 1e12, omega0 / 1e12],
                  y: [0, 1],
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ff1744', width: 1, dash: 'dash' },
                  name: `ω₀ = ${(omega0 / 1e12).toFixed(2)} THz`,
                },
              ]}
              layout={{
                xaxis: { title: 'Frequency ω (THz)' },
                yaxis: { title: 'Absorption (normalized)', range: [0, 1.1] },
                height: 300,
                legend: { font: { size: 9, color: '#8888aa' } },
              }}
              style={{ height: '300px' }}
            />
          </div>

          {/* Dispersion (Re[χ]) */}
          <div className="panel">
            <div className="panel-header">Dispersion — Re[χ(ω)]</div>
            <PlotlyChart
              data={[{
                x: omega_THz,
                y: spectrum.chi_re.map(v => v / maxAbs),
                type: 'scatter', mode: 'lines',
                line: { color: '#00e5ff', width: 2 },
                name: 'Re[χ(ω)]',
              }]}
              layout={{
                xaxis: { title: 'ω (THz)' },
                yaxis: { title: 'Dispersion (norm.)' },
                height: 240,
              }}
              style={{ height: '240px' }}
            />
          </div>

          {/* Controls */}
          <div className="panel">
            <div className="panel-header">Parameters</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={usePyridine} onChange={e => setUsePyridine(e.target.checked)} />
                Use Pyridine Preset (260 nm)
              </label>
            </div>
            {!usePyridine && (
              <div className="control-group">
                <label className="control-label">ω₀: {parseFloat(omega0_THz).toFixed(2)} THz</label>
                <input type="range" className="control-slider" min={100} max={3000} step={10}
                  value={parseFloat(omega0_THz) * 10}
                  onChange={e => setOmega0_THz((e.target.value / 10).toFixed(1))} />
              </div>
            )}
            <div className="control-group">
              <label className="control-label">Quality Factor Q: {Q.toFixed(1)}</label>
              <input type="range" className="control-slider" min={1} max={50} step={0.1}
                value={Q} onChange={e => setQ(Number(e.target.value))} />
            </div>

            <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', lineHeight: 2 }}>
              <div>ω₀ = {(omega0 / 1e12).toFixed(3)} THz</div>
              <div>γ  = {(gamma / 1e12).toFixed(4)} THz</div>
              <div>λ₀ = {lambda0_nm} nm</div>
              <div>Q  = ω₀/γ = {qualityFactor(omega0, gamma).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
