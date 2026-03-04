import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import { polaritonDispersion, rabiSplitting } from '../../core/phase5_condensed_matter/polaritons.js';

export default function Phase5CondensedMatter() {
  const [g_eV, setG_eV] = useState(0.05);      // Coupling in eV
  const [E_X, setE_X] = useState(1.5);          // Exciton energy in eV
  const [E_C0, setE_C0] = useState(1.5);        // Cavity energy at k=0 in eV
  const [m_C, setM_C] = useState(1e-4);         // Effective photon mass

  const disp = useMemo(() => polaritonDispersion(g_eV, E_X, E_C0, m_C, 5, 300), [g_eV, E_X, E_C0, m_C]);
  const splitting = rabiSplitting(g_eV).toFixed(3);
  const detuning = (E_X - E_C0).toFixed(3);

  return (
    <>
      <div className="module-header">
        <h2>Phase 5 — Condensed Matter</h2>
        <span className="module-tag" style={{ background: 'rgba(255,23,68,0.15)', color: '#ff1744', border: '1px solid #ff1744' }}>
          ◷ PLANNED
        </span>
      </div>
      <div className="module-body">
        <div className="panel" style={{ borderLeft: '3px solid #ff1744', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: '#ff1744' }}>Exciton-Polaritons</strong> — Hybrid light-matter quasiparticles
            arising from strong coupling between excitons and cavity photons in semiconductor microcavities.
            Enables study of Bose-Einstein condensation, topological effects, and room-temperature quantum phenomena.
          </p>
        </div>

        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div className="panel">
            <div className="metric">
              <div className="metric-value rose">{splitting}<span className="metric-unit">eV</span></div>
              <div className="metric-label">Rabi Splitting (2g)</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value amber">{detuning}<span className="metric-unit">eV</span></div>
              <div className="metric-label">Detuning Δ = E_X − E_C</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value" style={{ color: '#00e5ff' }}>{(disp.hopfield_X[Math.floor(disp.k.length / 2)] * 100).toFixed(1)}<span className="metric-unit">%</span></div>
              <div className="metric-label">Exciton Fraction |X|² at k=0</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Polariton dispersion */}
          <div className="panel panel-glow" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header">Polariton Dispersion Relation — LP & UP Branches</div>
            <PlotlyChart
              data={[
                {
                  x: disp.k, y: disp.E_LP,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 2.5 },
                  name: 'Lower Polariton (LP)',
                },
                {
                  x: disp.k, y: disp.E_UP,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ff1744', width: 2.5 },
                  name: 'Upper Polariton (UP)',
                },
                {
                  x: disp.k, y: disp.E_X_arr,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ffab00', width: 1, dash: 'dash' },
                  name: `Exciton E_X = ${E_X} eV`,
                },
                {
                  x: disp.k, y: disp.E_C_arr,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#7c4dff', width: 1, dash: 'dot' },
                  name: `Cavity E_C(k)`,
                },
              ]}
              layout={{
                xaxis: { title: 'In-plane wavevector k (μm⁻¹)' },
                yaxis: { title: 'Energy (eV)' },
                height: 340,
                legend: { font: { size: 10, color: '#8888aa' } },
              }}
              style={{ height: '340px' }}
            />
          </div>

          {/* Hopfield coefficients */}
          <div className="panel">
            <div className="panel-header">Hopfield Coefficients — LP Exciton/Photon Fraction</div>
            <PlotlyChart
              data={[
                {
                  x: disp.k, y: disp.hopfield_X,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ffab00', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(255,171,0,0.1)',
                  name: '|X|² (Exciton)',
                },
                {
                  x: disp.k, y: disp.hopfield_C,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#7c4dff', width: 2 },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(124,77,255,0.1)',
                  name: '|C|² (Photon)',
                },
              ]}
              layout={{
                xaxis: { title: 'k (μm⁻¹)' },
                yaxis: { title: 'Fraction', range: [0, 1] },
                height: 260,
                legend: { font: { size: 9, color: '#8888aa' } },
              }}
              style={{ height: '260px' }}
            />
          </div>

          {/* Controls */}
          <div className="panel">
            <div className="panel-header">Microcavity Parameters</div>
            <div className="control-group">
              <label className="control-label">Coupling g: {g_eV.toFixed(3)} eV</label>
              <input type="range" className="control-slider" min={5} max={200} value={g_eV * 1000}
                onChange={e => setG_eV(e.target.value / 1000)} />
            </div>
            <div className="control-group">
              <label className="control-label">Exciton E_X: {E_X.toFixed(2)} eV</label>
              <input type="range" className="control-slider" min={100} max={300} value={E_X * 100}
                onChange={e => setE_X(e.target.value / 100)} />
            </div>
            <div className="control-group">
              <label className="control-label">Cavity E_C0: {E_C0.toFixed(2)} eV</label>
              <input type="range" className="control-slider" min={100} max={300} value={E_C0 * 100}
                onChange={e => setE_C0(e.target.value / 100)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
