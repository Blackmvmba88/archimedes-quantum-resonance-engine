import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import { thresholdAnalysis, bitFlipChannel, bitFlipSyndrome } from '../../core/phase6_error_correction/stabilizer.js';

export default function Phase6ErrorCorrection() {
  const [p_phys, setP_phys] = useState(0.05);
  const [nTrials, setNTrials] = useState(1000);
  const [simResult, setSimResult] = useState(null);

  const threshold = useMemo(() => thresholdAnalysis(200), []);

  const runSimulation = () => {
    let corrected = 0, failed = 0;
    for (let i = 0; i < nTrials; i++) {
      const errors = bitFlipChannel(3, p_phys);
      const { syndrome, correction } = bitFlipSyndrome(errors);
      const actualErrors = errors.filter(Boolean).length;
      // Success: 0 or 1 error (correctable)
      if (actualErrors <= 1) corrected++;
      else failed++;
    }
    setSimResult({ corrected, failed, total: nTrials, logicalErrorRate: failed / nTrials });
  };

  return (
    <>
      <div className="module-header">
        <h2>Phase 6 — Quantum Error Correction</h2>
        <span className="module-tag" style={{ background: 'rgba(255,23,68,0.15)', color: '#ff1744', border: '1px solid #ff1744' }}>
          ◷ PLANNED
        </span>
      </div>
      <div className="module-body">
        <div className="panel" style={{ borderLeft: '3px solid #ff1744', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: '#ff1744' }}>Stabilizer Codes</strong> — The framework for fault-tolerant
            quantum computation. Logical qubits are encoded in multiple physical qubits. Syndrome measurements
            detect errors without collapsing the logical state. The threshold theorem guarantees that below
            a critical physical error rate p_th, the logical error rate decreases with code distance d.
          </p>
        </div>

        <div className="grid-2">
          {/* Threshold analysis */}
          <div className="panel panel-glow" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header">Error Threshold Analysis — 3-Qubit Repetition Code</div>
            <PlotlyChart
              data={[
                {
                  x: threshold.p_phys, y: threshold.p_logical,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 2.5 },
                  name: 'P_L (3-qubit code)',
                },
                {
                  x: threshold.p_phys, y: threshold.p_unencoded,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ff1744', width: 1.5, dash: 'dash' },
                  name: 'P_L = p (unencoded)',
                },
                {
                  x: [threshold.threshold, threshold.threshold], y: [0, 0.5],
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ffab00', width: 1, dash: 'dot' },
                  name: `p_th = ${threshold.threshold.toFixed(3)}`,
                },
              ]}
              layout={{
                xaxis: { title: 'Physical Error Rate p' },
                yaxis: { title: 'Logical Error Rate P_L' },
                height: 300,
                legend: { font: { size: 10, color: '#8888aa' } },
                annotations: [{
                  x: threshold.threshold, y: threshold.threshold,
                  text: `Threshold p_th = ${threshold.threshold.toFixed(3)}`,
                  showarrow: true, arrowcolor: '#ffab00',
                  font: { color: '#ffab00', size: 10 },
                  ax: 40, ay: -30,
                }],
              }}
              style={{ height: '300px' }}
            />
          </div>

          {/* Monte Carlo simulation */}
          <div className="panel">
            <div className="panel-header">Monte Carlo — 3-Qubit Bit-Flip Code</div>
            <div className="control-group">
              <label className="control-label">Physical Error Rate p: {p_phys.toFixed(3)}</label>
              <input type="range" className="control-slider" min={1} max={499} value={p_phys * 1000}
                onChange={e => setP_phys(e.target.value / 1000)} />
            </div>
            <div className="control-group">
              <label className="control-label">Trials: {nTrials}</label>
              <input type="range" className="control-slider" min={100} max={5000} step={100}
                value={nTrials} onChange={e => setNTrials(Number(e.target.value))} />
            </div>
            <button className="btn btn-violet" style={{ marginTop: 12 }} onClick={runSimulation}>
              Run Simulation
            </button>
            {simResult && (
              <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 2 }}>
                <div style={{ color: '#00e676' }}>Corrected: {simResult.corrected} / {simResult.total}</div>
                <div style={{ color: '#ff1744' }}>Failed: {simResult.failed} / {simResult.total}</div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Logical Error Rate: <strong style={{ color: simResult.logicalErrorRate < p_phys ? '#00e676' : '#ff1744' }}>
                    {(simResult.logicalErrorRate * 100).toFixed(2)}%
                  </strong>
                  {simResult.logicalErrorRate < p_phys ? ' ✓ Below physical rate' : ' ✗ Above physical rate'}
                </div>
              </div>
            )}
          </div>

          {/* Syndrome table */}
          <div className="panel">
            <div className="panel-header">3-Qubit Syndrome Decoder Table</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <thead>
                <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: 6, textAlign: 'center' }}>s₁</th>
                  <th style={{ padding: 6, textAlign: 'center' }}>s₂</th>
                  <th style={{ padding: 6, textAlign: 'left' }}>Error Location</th>
                  <th style={{ padding: 6, textAlign: 'left' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [0, 0, 'None', 'No correction'],
                  [1, 0, 'Qubit 0', 'Flip q₀'],
                  [1, 1, 'Qubit 1', 'Flip q₁'],
                  [0, 1, 'Qubit 2', 'Flip q₂'],
                ].map(([s1, s2, loc, action], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <td style={{ padding: 5, textAlign: 'center', color: s1 ? '#ff1744' : '#00e676' }}>{s1}</td>
                    <td style={{ padding: 5, textAlign: 'center', color: s2 ? '#ff1744' : '#00e676' }}>{s2}</td>
                    <td style={{ padding: 5 }}>{loc}</td>
                    <td style={{ padding: 5, color: 'var(--cyan)' }}>{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
