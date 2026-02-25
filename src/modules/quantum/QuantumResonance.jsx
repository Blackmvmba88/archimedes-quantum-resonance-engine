import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import {
  quantumTunneling, phononDispersion, diatomicPhononDispersion,
  quantumCoherence, quantumWellLevels, quantumWellWavefunction, CONSTANTS
} from '../../utils/physics';

export default function QuantumResonance() {
  const [barrierV, setBarrierV] = useState(5);    // eV
  const [barrierL, setBarrierL] = useState(1);     // nm
  const [wellL, setWellL] = useState(2);           // nm
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [coherenceOmega, setCoherenceOmega] = useState(1e13);
  const [coherenceTau, setCoherenceTau] = useState(1e-12);

  // Tunneling
  const tunneling = useMemo(() => {
    const E_values = Array.from({ length: 200 }, (_, i) => 0.01 + (barrierV * 1.5) * i / 199);
    const T = quantumTunneling(E_values, barrierV, barrierL * 1e-9);
    return { E: E_values, T };
  }, [barrierV, barrierL]);

  // Phonon dispersion
  const monatomic = useMemo(() => phononDispersion(10, 1e-26, 3e-10, 300), []);
  const diatomic = useMemo(() => diatomicPhononDispersion(10, 1e-26, 2e-26, 3e-10, 300), []);

  // Quantum well
  const levels = useMemo(() => quantumWellLevels(wellL * 1e-9, 9.109e-31, 8), [wellL]);
  const wavefunction = useMemo(() => quantumWellWavefunction(selectedLevel, wellL * 1e-9, 300), [selectedLevel, wellL]);

  // Coherence
  const coherence = useMemo(() => quantumCoherence(coherenceOmega, coherenceTau, 600), [coherenceOmega, coherenceTau]);

  return (
    <>
      <div className="module-header">
        <h2>Quantum Resonance</h2>
        <span className="module-tag">SCHRÖDINGER / PHONON / TUNNELING / COHERENCE</span>
      </div>
      <div className="module-body">
        <div className="grid-2">
          {/* Quantum Tunneling */}
          <div className="panel panel-glow">
            <div className="panel-header">Quantum Tunneling — Transmission Coefficient</div>
            <PlotlyChart
              data={[
                {
                  x: tunneling.E,
                  y: tunneling.T,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#7c4dff', width: 2 },
                  name: 'T(E)',
                },
                {
                  x: [barrierV, barrierV],
                  y: [0, 1],
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ff1744', width: 1, dash: 'dash' },
                  name: `V₀ = ${barrierV} eV`,
                },
              ]}
              layout={{
                xaxis: { title: 'Energy (eV)' },
                yaxis: { title: 'Transmission T(E)', range: [0, 1.05] },
                height: 260,
                legend: { font: { size: 9, color: '#8888aa' }, x: 0.6, y: 0.3 },
              }}
              style={{ height: '260px' }}
            />
            <div className="grid-2" style={{ marginTop: 8 }}>
              <div className="control-group">
                <label className="control-label">Barrier V₀: {barrierV} eV</label>
                <input type="range" className="control-slider" min={1} max={20} step={0.5} value={barrierV} onChange={e => setBarrierV(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Barrier Width: {barrierL} nm</label>
                <input type="range" className="control-slider" min={1} max={50} value={barrierL * 10} onChange={e => setBarrierL(e.target.value / 10)} />
              </div>
            </div>
          </div>

          {/* Quantum Well */}
          <div className="panel panel-glow">
            <div className="panel-header">Quantum Well — Energy Levels & Wavefunctions</div>
            <PlotlyChart
              data={[
                {
                  x: wavefunction.x,
                  y: wavefunction.psi.map(v => v * 1e-4),
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 2 },
                  name: `ψ${selectedLevel}(x)`,
                },
                {
                  x: wavefunction.x,
                  y: wavefunction.prob.map(v => v * 1e-8),
                  type: 'scatter', mode: 'lines',
                  fill: 'tozeroy',
                  line: { color: '#7c4dff', width: 1 },
                  fillcolor: 'rgba(124,77,255,0.2)',
                  name: `|ψ${selectedLevel}|²`,
                },
              ]}
              layout={{
                xaxis: { title: 'Position (nm)' },
                yaxis: { title: 'Amplitude (a.u.)' },
                height: 260,
                legend: { font: { size: 9, color: '#8888aa' } },
              }}
              style={{ height: '260px' }}
            />
            <div className="grid-2" style={{ marginTop: 8 }}>
              <div className="control-group">
                <label className="control-label">Well Width: {wellL} nm</label>
                <input type="range" className="control-slider" min={5} max={100} value={wellL * 10} onChange={e => setWellL(e.target.value / 10)} />
              </div>
              <div className="control-group">
                <label className="control-label">Level n = {selectedLevel}</label>
                <input type="range" className="control-slider" min={1} max={8} value={selectedLevel} onChange={e => setSelectedLevel(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Phonon Dispersion */}
          <div className="panel">
            <div className="panel-header">Phonon Dispersion — Monatomic Chain</div>
            <PlotlyChart
              data={[{
                x: monatomic.k,
                y: monatomic.omega.map(w => w * 1e-12),
                type: 'scatter', mode: 'lines',
                line: { color: '#00e676', width: 2 },
                name: 'Acoustic',
              }]}
              layout={{
                xaxis: { title: 'k (π/a)' },
                yaxis: { title: 'ω (THz)' },
                height: 240,
              }}
              style={{ height: '240px' }}
            />
          </div>

          {/* Diatomic Phonon */}
          <div className="panel">
            <div className="panel-header">Phonon Dispersion — Diatomic Chain</div>
            <PlotlyChart
              data={[
                {
                  x: diatomic.k,
                  y: diatomic.acoustic.map(w => w * 1e-12),
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 2 },
                  name: 'Acoustic Branch',
                },
                {
                  x: diatomic.k,
                  y: diatomic.optical.map(w => w * 1e-12),
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ff1744', width: 2 },
                  name: 'Optical Branch',
                },
              ]}
              layout={{
                xaxis: { title: 'k (π/a)' },
                yaxis: { title: 'ω (THz)' },
                height: 240,
                legend: { font: { size: 9, color: '#8888aa' } },
              }}
              style={{ height: '240px' }}
            />
          </div>

          {/* Quantum Coherence */}
          <div className="panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header">Quantum Coherence Function</div>
            <PlotlyChart
              data={[
                {
                  x: coherence.tau,
                  y: coherence.g1,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#7c4dff', width: 2 },
                  name: 'g⁽¹⁾(τ) — First Order',
                },
                {
                  x: coherence.tau,
                  y: coherence.g2,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 2, dash: 'dash' },
                  name: 'g⁽²⁾(τ) — Second Order',
                },
              ]}
              layout={{
                xaxis: { title: 'τ (ps)' },
                yaxis: { title: 'Coherence' },
                height: 260,
                legend: { font: { size: 10, color: '#8888aa' } },
              }}
              style={{ height: '260px' }}
            />
          </div>
        </div>

        {/* Energy levels table */}
        <div className="panel">
          <div className="panel-header">Quantum Well Energy Levels — E_n = n²π²ℏ²/(2mL²)</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <thead>
                <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: 6, textAlign: 'center' }}>n</th>
                  <th style={{ padding: 6, textAlign: 'right' }}>Energy (eV)</th>
                  <th style={{ padding: 6, textAlign: 'right' }}>Energy (J)</th>
                  <th style={{ padding: 6, textAlign: 'right' }}>λ transition (nm)</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((l, i) => (
                  <tr key={i} style={{
                    color: l.n === selectedLevel ? 'var(--violet)' : 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                  }} onClick={() => setSelectedLevel(l.n)}>
                    <td style={{ padding: 5, textAlign: 'center' }}>{l.n}</td>
                    <td style={{ padding: 5, textAlign: 'right' }}>{l.energy_eV.toFixed(4)}</td>
                    <td style={{ padding: 5, textAlign: 'right' }}>{l.energy_J.toExponential(3)}</td>
                    <td style={{ padding: 5, textAlign: 'right' }}>
                      {i > 0 ? ((1240 / ((l.energy_eV - levels[i - 1].energy_eV))).toFixed(1)) : '—'}
                    </td>
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
