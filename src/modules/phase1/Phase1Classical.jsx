// ─────────────────────────────────────────────────────────────────────────────
// Phase1Classical.jsx — Optimizado con useMemo
//
// PROBLEMA (antes):
//   Los arrays `data` y los objetos `layout` se creaban como literales inline
//   directamente en el JSX:
//
//     <PlotlyChart
//       data={[{ x: omega_THz, y: absNorm, ... }]}   ← nuevo array en cada render
//       layout={{ xaxis: { title: '...' }, ... }}     ← nuevo objeto en cada render
//     />
//
//   Consecuencia: aunque `omega_THz` y `absNorm` no hayan cambiado, React ve
//   una nueva referencia de array/objeto y fuerza a PlotlyChart a re-renderizarse.
//   React.memo en PlotlyChart es inútil si el padre le pasa props inestables.
//
// SOLUCIÓN (después):
//   Todos los objetos y arrays que se pasan como props a PlotlyChart se
//   calculan con `useMemo`. Esto garantiza que la referencia del objeto
//   solo cambie cuando sus dependencias reales cambien.
//
//   La regla es: si un valor se pasa como prop a un componente memoizado,
//   ese valor DEBE estar envuelto en useMemo (si es objeto/array) o
//   useCallback (si es función).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import {
  lorentzSpectrum, qualityFactor, resonanceWavelength, pyridinePreset,
} from '../../core/phase1_classical/lorentz.js';
import { CONSTANTS } from '../../core/shared/constants.js';

// pyridinePreset() retorna siempre los mismos valores; se llama una sola vez
// fuera del componente para que no se recree en cada render.
const PYRIDINE = pyridinePreset();

export default function Phase1Classical() {
  const [omega0_THz, setOmega0_THz] = useState((PYRIDINE.omega0 / 1e12).toFixed(2));
  const [Q, setQ]                   = useState(PYRIDINE.Q);
  const [usePyridine, setUsePyridine] = useState(true);

  // Parámetros físicos derivados del estado.
  // useMemo evita recalcular omega0 y gamma si los estados no cambiaron.
  const { omega0, gamma } = useMemo(() => {
    const w0 = usePyridine ? PYRIDINE.omega0 : parseFloat(omega0_THz) * 1e12;
    return { omega0: w0, gamma: w0 / Q };
  }, [usePyridine, omega0_THz, Q]);

  // ─── Cálculo físico principal ─────────────────────────────────────────────
  // lorentzSpectrum() es la función más costosa: itera 500 puntos y calcula
  // la susceptibilidad compleja en cada uno. Con useMemo, solo se recalcula
  // cuando omega0 o gamma cambian (es decir, cuando el usuario mueve un slider).
  const spectrum = useMemo(
    () => lorentzSpectrum(omega0, gamma, 500, 15),
    [omega0, gamma],
  );

  // ─── Datos derivados del espectro ─────────────────────────────────────────
  // Normalización y conversión de unidades. Dependen de `spectrum`, que ya
  // está memoizado. Estos valores solo cambian cuando `spectrum` cambia.
  const { absNorm, omega_THz, maxAbs } = useMemo(() => {
    const max = Math.max(...spectrum.absorption);
    return {
      maxAbs:    max,
      absNorm:   spectrum.absorption.map(v => v / max),
      omega_THz: spectrum.omega.map(w => w / 1e12),
    };
  }, [spectrum]);

  // Métricas derivadas (solo dependen de omega0 y gamma, no del espectro completo).
  const lambda0_nm = useMemo(() => resonanceWavelength(omega0).toFixed(1), [omega0]);
  const fwhm_nm    = useMemo(
    () => (resonanceWavelength(omega0 - gamma / 2) - resonanceWavelength(omega0 + gamma / 2)).toFixed(2),
    [omega0, gamma],
  );

  // ─── Props memoizadas para PlotlyChart ────────────────────────────────────
  // ANTES: data={[{ x: omega_THz, y: absNorm, ... }]}
  //   → Crea un nuevo array [] en cada render, aunque omega_THz y absNorm
  //     no hayan cambiado. React.memo no puede detectar la igualdad.
  //
  // DESPUÉS: const absorptionData = useMemo(() => [...], [omega_THz, absNorm, omega0])
  //   → La referencia del array solo cambia cuando sus dependencias cambian.
  //     React.memo en PlotlyChart puede ahora hacer su trabajo correctamente.

  const absorptionData = useMemo(() => [
    {
      x: omega_THz,
      y: absNorm,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#00e676', width: 2 },
      fill: 'tozeroy',
      fillcolor: 'rgba(0,230,118,0.08)',
      name: 'Im[χ(ω)] (norm.)',
    },
    {
      x: [omega0 / 1e12, omega0 / 1e12],
      y: [0, 1],
      type: 'scatter',
      mode: 'lines',
      line: { color: '#ff1744', width: 1, dash: 'dash' },
      name: `ω₀ = ${(omega0 / 1e12).toFixed(2)} THz`,
    },
  ], [omega_THz, absNorm, omega0]);

  const dispersionData = useMemo(() => [
    {
      x: omega_THz,
      y: spectrum.chi_re.map(v => v / maxAbs),
      type: 'scatter',
      mode: 'lines',
      line: { color: '#00e5ff', width: 2 },
      name: 'Re[χ(ω)]',
    },
  ], [omega_THz, spectrum.chi_re, maxAbs]);

  // Los layouts son estáticos (no dependen del estado), por lo que se
  // memoizan con dependencias vacías []. Se crean una sola vez en toda
  // la vida del componente.
  const absorptionLayout = useMemo(() => ({
    xaxis: { title: 'Frequency ω (THz)' },
    yaxis: { title: 'Absorption (normalized)', range: [0, 1.1] },
    height: 300,
    legend: { font: { size: 9, color: '#8888aa' } },
  }), []);

  const dispersionLayout = useMemo(() => ({
    xaxis: { title: 'ω (THz)' },
    yaxis: { title: 'Dispersion (norm.)' },
    height: 240,
  }), []);

  // Estilos estáticos también memoizados para evitar nuevas referencias.
  const chartStyle300 = useMemo(() => ({ height: '300px' }), []);
  const chartStyle240 = useMemo(() => ({ height: '240px' }), []);

  return (
    <>
      <div className="module-header">
        <h2>Phase 1 — Classical Foundation</h2>
        <span className="module-tag" style={{ background: 'rgba(0,230,118,0.15)', color: '#00e676', border: '1px solid #00e676' }}>
          ✓ COMPLETE
        </span>
      </div>
      <div className="module-body">

        <div className="panel" style={{ borderLeft: '3px solid #00e676', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: '#00e676' }}>Lorentz Oscillator Model</strong> — The electron is modelled as a
            classical damped harmonic oscillator driven by an EM field.
            Susceptibility: <code style={{ color: 'var(--cyan)' }}>χ(ω) = (e²/mε₀) / (ω₀² − ω² − iγω)</code>.
            Validated against pyridine UV absorption at 260 nm (Q = 5.2, peak deviation &lt; 1 nm).
          </p>
        </div>

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
          {/* Absorption spectrum — recibe props memoizadas */}
          <div className="panel panel-glow" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-header">Lorentz Absorption Spectrum — Im[χ(ω)]</div>
            <PlotlyChart
              data={absorptionData}
              layout={absorptionLayout}
              style={chartStyle300}
            />
          </div>

          {/* Dispersion — recibe props memoizadas */}
          <div className="panel">
            <div className="panel-header">Dispersion — Re[χ(ω)]</div>
            <PlotlyChart
              data={dispersionData}
              layout={dispersionLayout}
              style={chartStyle240}
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
