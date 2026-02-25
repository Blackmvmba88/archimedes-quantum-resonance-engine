import React, { useState, useMemo, useCallback } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import { evaluateGeometry, optimizeGeometry, helmholtzModes } from '../../utils/physics';

export default function AdaptiveDesign() {
  const [width, setWidth] = useState(3);
  const [height, setHeight] = useState(2.5);
  const [depth, setDepth] = useState(4);
  const [material, setMaterial] = useState('steel');
  const [targetFreq, setTargetFreq] = useState(500);
  const [objective, setObjective] = useState('minimize_resonance');
  const [optimResult, setOptimResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const originalEval = useMemo(() =>
    evaluateGeometry({ width, height, depth, material }),
    [width, height, depth, material]
  );

  const runOptimization = useCallback(() => {
    setIsOptimizing(true);
    setTimeout(() => {
      const result = optimizeGeometry(targetFreq, objective, 80);
      setOptimResult(result);
      setIsOptimizing(false);
    }, 100);
  }, [targetFreq, objective]);

  const optimEval = optimResult?.evaluation;

  return (
    <>
      <div className="module-header">
        <h2>Adaptive Design Generator</h2>
        <span className="module-tag">EVOLUTIONARY OPTIMIZATION / SABINE</span>
      </div>
      <div className="module-body">
        <div className="grid-2-1">
          <div>
            {/* Original vs Optimized comparison */}
            <div className="grid-2">
              <div className="panel">
                <div className="panel-header">Original Geometry</div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                  <svg width="180" height="140" viewBox="0 0 180 140">
                    <rect x="20" y="20" width={Math.min(width * 25, 140)} height={Math.min(height * 25, 100)}
                      fill="none" stroke="#00e5ff" strokeWidth="2" rx="0" />
                    <text x="90" y="135" fill="#8888aa" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
                      {width}m × {height}m × {depth}m
                    </text>
                  </svg>
                </div>
                <div className="metric">
                  <div className="metric-value" style={{ fontSize: 18 }}>{originalEval.score.toFixed(1)}</div>
                  <div className="metric-label">Performance Score</div>
                </div>
                <div className="metric">
                  <div className="metric-value amber" style={{ fontSize: 16 }}>{originalEval.T60.toFixed(3)}<span className="metric-unit">s</span></div>
                  <div className="metric-label">T60 Reverberation</div>
                </div>
              </div>

              <div className="panel" style={{ borderColor: optimResult ? 'var(--emerald)' : 'var(--border)' }}>
                <div className="panel-header" style={{ color: optimResult ? 'var(--emerald)' : undefined }}>
                  Optimized Geometry
                </div>
                {optimResult ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                      <svg width="180" height="140" viewBox="0 0 180 140">
                        <rect x="20" y="20"
                          width={Math.min(optimResult.optimized.width * 25, 140)}
                          height={Math.min(optimResult.optimized.height * 25, 100)}
                          fill="none" stroke="#00e676" strokeWidth="2"
                          rx={optimResult.optimized.cornerRadius * 50} />
                        <text x="90" y="135" fill="#8888aa" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">
                          {optimResult.optimized.width.toFixed(2)}m × {optimResult.optimized.height.toFixed(2)}m × {optimResult.optimized.depth.toFixed(2)}m
                        </text>
                      </svg>
                    </div>
                    <div className="metric">
                      <div className="metric-value emerald" style={{ fontSize: 18 }}>{optimEval.score.toFixed(1)}</div>
                      <div className="metric-label">Performance Score</div>
                    </div>
                    <div className="metric">
                      <div className="metric-value emerald" style={{ fontSize: 16 }}>{optimEval.T60.toFixed(3)}<span className="metric-unit">s</span></div>
                      <div className="metric-label">T60 Reverberation</div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    Run optimization to generate
                  </div>
                )}
              </div>
            </div>

            {/* Mode comparison */}
            <div className="panel panel-glow">
              <div className="panel-header">Resonance Mode Comparison</div>
              <PlotlyChart
                data={[
                  {
                    x: originalEval.modes.map((_, i) => i + 1),
                    y: originalEval.modes.map(m => m.frequency),
                    type: 'bar', name: 'Original',
                    marker: { color: '#00e5ff88' },
                  },
                  ...(optimEval ? [{
                    x: optimEval.modes.map((_, i) => i + 1),
                    y: optimEval.modes.map(m => m.frequency),
                    type: 'bar', name: 'Optimized',
                    marker: { color: '#00e67688' },
                  }] : []),
                  {
                    x: [0, originalEval.modes.length + 1],
                    y: [targetFreq, targetFreq],
                    type: 'scatter', mode: 'lines',
                    line: { color: '#ff1744', width: 2, dash: 'dash' },
                    name: `Target: ${targetFreq} Hz`,
                  },
                ]}
                layout={{
                  xaxis: { title: 'Mode #' },
                  yaxis: { title: 'Frequency (Hz)' },
                  barmode: 'group',
                  height: 280,
                  legend: { font: { size: 10, color: '#8888aa' } },
                }}
                style={{ height: '280px' }}
              />
            </div>

            {/* Optimization convergence */}
            {optimResult && (
              <div className="panel">
                <div className="panel-header">Optimization Convergence</div>
                <PlotlyChart
                  data={[{
                    x: optimResult.history.map(h => h.iteration),
                    y: optimResult.history.map(h => h.score),
                    type: 'scatter', mode: 'lines',
                    line: { color: '#7c4dff', width: 2 },
                  }]}
                  layout={{
                    xaxis: { title: 'Iteration' },
                    yaxis: { title: 'Cost Function' },
                    height: 220,
                  }}
                  style={{ height: '220px' }}
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div>
            <div className="panel">
              <div className="panel-header">Geometry Parameters</div>
              <div className="control-group">
                <label className="control-label">Width: {width} m</label>
                <input type="range" className="control-slider" min={5} max={100} value={width * 10} onChange={e => setWidth(e.target.value / 10)} />
              </div>
              <div className="control-group">
                <label className="control-label">Height: {height} m</label>
                <input type="range" className="control-slider" min={5} max={60} value={height * 10} onChange={e => setHeight(e.target.value / 10)} />
              </div>
              <div className="control-group">
                <label className="control-label">Depth: {depth} m</label>
                <input type="range" className="control-slider" min={5} max={100} value={depth * 10} onChange={e => setDepth(e.target.value / 10)} />
              </div>
              <div className="control-group">
                <label className="control-label">Material</label>
                <select className="control-input" value={material} onChange={e => setMaterial(e.target.value)}>
                  <option value="steel">Acero</option>
                  <option value="aluminum">Aluminio</option>
                  <option value="wood">Madera</option>
                  <option value="foam">Espuma Acústica</option>
                  <option value="concrete">Concreto</option>
                </select>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Optimization Target</div>
              <div className="control-group">
                <label className="control-label">Target Frequency: {targetFreq} Hz</label>
                <input type="range" className="control-slider" min={50} max={2000} value={targetFreq} onChange={e => setTargetFreq(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Objective</label>
                <select className="control-input" value={objective} onChange={e => setObjective(e.target.value)}>
                  <option value="minimize_resonance">Minimizar Resonancia</option>
                  <option value="maximize_resonance">Maximizar Resonancia</option>
                </select>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="btn" onClick={runOptimization} disabled={isOptimizing}>
                  {isOptimizing ? 'Optimizando...' : 'Ejecutar Optimización'}
                </button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Room Properties</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', lineHeight: 2 }}>
                <p>Volumen: <span style={{ color: 'var(--cyan)' }}>{originalEval.volume.toFixed(1)} m³</span></p>
                <p>Superficie: <span style={{ color: 'var(--cyan)' }}>{originalEval.surfaceArea.toFixed(1)} m²</span></p>
                <p>Absorción (α): <span style={{ color: 'var(--violet)' }}>{originalEval.absorption}</span></p>
                <p>T60 Sabine: <span style={{ color: 'var(--amber)' }}>{originalEval.T60.toFixed(3)} s</span></p>
                <p>Modos totales: <span style={{ color: 'var(--emerald)' }}>{originalEval.modes.length}</span></p>
              </div>
            </div>

            {optimResult && (
              <div className="panel" style={{ borderColor: 'var(--emerald)' }}>
                <div className="panel-header" style={{ color: 'var(--emerald)' }}>Optimization Result</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', lineHeight: 2 }}>
                  <p>Width: <span style={{ color: 'var(--emerald)' }}>{optimResult.optimized.width.toFixed(3)} m</span></p>
                  <p>Height: <span style={{ color: 'var(--emerald)' }}>{optimResult.optimized.height.toFixed(3)} m</span></p>
                  <p>Depth: <span style={{ color: 'var(--emerald)' }}>{optimResult.optimized.depth.toFixed(3)} m</span></p>
                  <p>Corner R: <span style={{ color: 'var(--emerald)' }}>{optimResult.optimized.cornerRadius.toFixed(3)} m</span></p>
                  <p>Score Δ: <span style={{ color: 'var(--amber)' }}>
                    {((optimEval.score - originalEval.score) / originalEval.score * 100).toFixed(1)}%
                  </span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
