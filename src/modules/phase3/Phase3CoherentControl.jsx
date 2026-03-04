import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import { pulseTrajectory, piPulseDuration } from '../../core/phase3_coherent_control/control.js';

export default function Phase3CoherentControl() {
  const [pulseType, setPulseType] = useState('gaussian');
  const [T1_ps, setT1_ps] = useState(500);
  const [T2_ps, setT2_ps] = useState(200);
  const [tMax_ps, setTMax_ps] = useState(100);

  const omega0 = 7.24e14; // rad/s (pyridine)
  const T1 = T1_ps * 1e-12;
  const T2 = T2_ps * 1e-12;
  const tMax = tMax_ps * 1e-12;

  const traj = useMemo(() => pulseTrajectory(pulseType, omega0, T1, T2, tMax, 600), [pulseType, omega0, T1, T2, tMax]);
  const t_ps = traj.t.map(t => t * 1e12);

  const fidelityPct = (traj.fidelity * 100).toFixed(1);
  const finalW = traj.w[traj.w.length - 1];

  return (
    <>
      <div className="module-header">
        <h2>Phase 3 — Coherent Control</h2>
        <span className="module-tag" style={{ background: 'rgba(255,171,0,0.15)', color: '#ffab00', border: '1px solid #ffab00' }}>
          ◷ PLANNED
        </span>
      </div>
      <div className="module-body">

        <div className="panel" style={{ borderLeft: '3px solid #ffab00', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: '#ffab00' }}>Optimal Control of a TLS</strong> — Design shaped EM pulses
            to manipulate the quantum state with high fidelity. The goal is a perfect <strong>π-pulse</strong>:
            complete population inversion from |0⟩ to |1⟩ (w: −0.5 → +0.5). The Bloch sphere is our
            epistemological window into the dynamics.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div className="panel">
            <div className="metric">
              <div className="metric-value" style={{ color: parseFloat(fidelityPct) > 90 ? '#00e676' : '#ff1744' }}>
                {fidelityPct}<span className="metric-unit">%</span>
              </div>
              <div className="metric-label">π-Pulse Fidelity</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value amber">{finalW.toFixed(4)}</div>
              <div className="metric-label">Final w (target: +0.5)</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value violet">{tMax_ps}<span className="metric-unit">ps</span></div>
              <div className="metric-label">Pulse Duration</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Bloch trajectory */}
          <div className="panel panel-glow" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header">Bloch Vector Trajectory during {pulseType} π-pulse</div>
            <PlotlyChart
              data={[
                {
                  x: t_ps, y: traj.w,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ff6d00', width: 2.5 },
                  name: 'w(t) — Inversion',
                },
                {
                  x: t_ps, y: traj.u,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 1.5, dash: 'dot' },
                  name: 'u(t)',
                },
                {
                  x: t_ps, y: traj.v,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#7c4dff', width: 1.5, dash: 'dash' },
                  name: 'v(t)',
                },
                {
                  x: [0, tMax_ps], y: [0.5, 0.5],
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e676', width: 1, dash: 'dash' },
                  name: 'Target w = +0.5',
                },
              ]}
              layout={{
                xaxis: { title: 'Time (ps)' },
                yaxis: { title: 'Bloch Component', range: [-0.6, 0.6] },
                height: 300,
                legend: { font: { size: 10, color: '#8888aa' } },
              }}
              style={{ height: '300px' }}
            />
          </div>

          {/* Bloch radius (should stay ≈ 0.5 for pure state) */}
          <div className="panel">
            <div className="panel-header">Bloch Sphere Radius |r(t)| — Purity Monitor</div>
            <PlotlyChart
              data={[{
                x: t_ps, y: traj.blochRadius,
                type: 'scatter', mode: 'lines',
                line: { color: '#00e676', width: 2 },
                fill: 'tozeroy',
                fillcolor: 'rgba(0,230,118,0.08)',
                name: '|r(t)|',
              }]}
              layout={{
                xaxis: { title: 'Time (ps)' },
                yaxis: { title: '|r|', range: [0, 0.6] },
                height: 260,
              }}
              style={{ height: '260px' }}
            />
          </div>

          {/* Controls */}
          <div className="panel">
            <div className="panel-header">Pulse Designer</div>
            <div style={{ marginBottom: 12 }}>
              <label className="control-label">Pulse Shape</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {['gaussian', 'square', 'pi'].map(pt => (
                  <button key={pt} className={`btn ${pulseType === pt ? 'btn-violet' : ''}`}
                    style={{ padding: '4px 14px', fontSize: 10 }}
                    onClick={() => setPulseType(pt)}>
                    {pt.charAt(0).toUpperCase() + pt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-group">
              <label className="control-label">Pulse Duration: {tMax_ps} ps</label>
              <input type="range" className="control-slider" min={10} max={500} step={10}
                value={tMax_ps} onChange={e => setTMax_ps(Number(e.target.value))} />
            </div>
            <div className="control-group">
              <label className="control-label">T₁: {T1_ps} ps</label>
              <input type="range" className="control-slider" min={100} max={2000} step={50}
                value={T1_ps} onChange={e => setT1_ps(Number(e.target.value))} />
            </div>
            <div className="control-group">
              <label className="control-label">T₂: {T2_ps} ps</label>
              <input type="range" className="control-slider" min={10} max={1000} step={10}
                value={T2_ps} onChange={e => setT2_ps(Number(e.target.value))} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
