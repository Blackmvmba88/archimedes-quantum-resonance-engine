import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import {
  reynoldsNumber, flowRegime, cylinderFlow,
  turbulenceIntensity, boundaryLayerThickness, CONSTANTS
} from '../../utils/physics';

export default function AerodynamicSim() {
  const [velocity, setVelocity] = useState(15);
  const [diameter, setDiameter] = useState(0.1);
  const [temperature, setTemperature] = useState(20);

  const Re = useMemo(() => reynoldsNumber(velocity, diameter), [velocity, diameter]);
  const regime = useMemo(() => flowRegime(Re), [Re]);
  const TI = useMemo(() => turbulenceIntensity(Re), [Re]);
  const BL = useMemo(() => boundaryLayerThickness(diameter, Re), [diameter, Re]);

  const flow = useMemo(() => cylinderFlow(velocity, diameter / 2, 45), [velocity, diameter]);

  const speedOfSound = useMemo(() => {
    return CONSTANTS.c * Math.sqrt((temperature + 273.15) / CONSTANTS.T0);
  }, [temperature]);

  const mach = velocity / speedOfSound;

  return (
    <>
      <div className="module-header">
        <h2>Aerodynamic Simulation</h2>
        <span className="module-tag">NAVIER-STOKES / REYNOLDS / BERNOULLI</span>
      </div>
      <div className="module-body">
        <div className="grid-2-1">
          <div>
            {/* Velocity field */}
            <div className="panel panel-glow">
              <div className="panel-header">Velocity Field — Potential Flow Around Cylinder</div>
              <PlotlyChart
                data={[{
                  z: flow.speed,
                  x: flow.y,
                  y: flow.x,
                  type: 'heatmap',
                  colorscale: [
                    [0, '#0a0a0f'], [0.15, '#1a1a4e'],
                    [0.3, '#7c4dff'], [0.5, '#00e5ff'],
                    [0.7, '#00e676'], [0.85, '#ffab00'], [1, '#ff1744']
                  ],
                  showscale: true,
                  colorbar: {
                    title: { text: 'm/s', font: { size: 10, color: '#8888aa' } },
                    tickfont: { size: 9, color: '#8888aa' },
                  },
                }]}
                layout={{
                  xaxis: { title: 'Y (m)', scaleanchor: 'y' },
                  yaxis: { title: 'X (m)' },
                  height: 320,
                }}
                style={{ height: '320px' }}
              />
            </div>

            {/* Pressure distribution */}
            <div className="panel panel-glow">
              <div className="panel-header">Pressure Distribution — Bernoulli</div>
              <PlotlyChart
                data={[{
                  z: flow.pressure,
                  x: flow.y,
                  y: flow.x,
                  type: 'heatmap',
                  colorscale: [
                    [0, '#ff1744'], [0.3, '#ffab00'],
                    [0.5, '#0a0a0f'], [0.7, '#00e5ff'], [1, '#7c4dff']
                  ],
                  showscale: true,
                  colorbar: {
                    title: { text: 'Pa', font: { size: 10, color: '#8888aa' } },
                    tickfont: { size: 9, color: '#8888aa' },
                  },
                }]}
                layout={{
                  xaxis: { title: 'Y (m)' },
                  yaxis: { title: 'X (m)' },
                  height: 320,
                }}
                style={{ height: '320px' }}
              />
            </div>

            {/* Surface pressure */}
            <div className="panel">
              <div className="panel-header">Surface Pressure Coefficient (Cp)</div>
              <PlotlyChart
                data={[{
                  x: Array.from({ length: 360 }, (_, i) => i),
                  y: Array.from({ length: 360 }, (_, i) => {
                    const theta = (i * Math.PI) / 180;
                    return 1 - 4 * Math.sin(theta) ** 2;
                  }),
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 2 },
                  name: 'Inviscid',
                }, {
                  x: Array.from({ length: 360 }, (_, i) => i),
                  y: Array.from({ length: 360 }, (_, i) => {
                    const theta = (i * Math.PI) / 180;
                    const cp = 1 - 4 * Math.sin(theta) ** 2;
                    return theta > Math.PI * 0.45 && theta < Math.PI * 1.55 ? cp * 0.6 - 0.3 : cp;
                  }),
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ff1744', width: 2, dash: 'dash' },
                  name: 'Viscous (approx)',
                }]}
                layout={{
                  xaxis: { title: 'Angle (degrees)' },
                  yaxis: { title: 'Cp' },
                  height: 240,
                  legend: { font: { size: 10, color: '#8888aa' }, x: 0.7, y: 0.95 },
                }}
                style={{ height: '240px' }}
              />
            </div>
          </div>

          {/* Controls & Metrics */}
          <div>
            <div className="panel">
              <div className="panel-header">Flow Metrics</div>
              <div className="metric">
                <div className="metric-value">{Re.toExponential(2)}</div>
                <div className="metric-label">Reynolds Number</div>
              </div>
              <div className="metric">
                <div className="metric-value" style={{ color: regime.color }}>{regime.regime}</div>
                <div className="metric-label">Flow Regime</div>
              </div>
              <div className="metric">
                <div className="metric-value violet">{(TI * 100).toFixed(2)}<span className="metric-unit">%</span></div>
                <div className="metric-label">Turbulence Intensity</div>
              </div>
              <div className="metric">
                <div className="metric-value emerald">{(BL * 1000).toFixed(2)}<span className="metric-unit">mm</span></div>
                <div className="metric-label">Boundary Layer δ</div>
              </div>
              <div className="metric">
                <div className="metric-value amber">{mach.toFixed(4)}</div>
                <div className="metric-label">Mach Number</div>
              </div>
              <div className="metric">
                <div className="metric-value">{speedOfSound.toFixed(1)}<span className="metric-unit">m/s</span></div>
                <div className="metric-label">Speed of Sound</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Flow Parameters</div>
              <div className="control-group">
                <label className="control-label">Velocity: {velocity} m/s</label>
                <input type="range" className="control-slider" min={1} max={100} value={velocity} onChange={e => setVelocity(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Diameter: {diameter.toFixed(2)} m</label>
                <input type="range" className="control-slider" min={1} max={100} value={diameter * 100} onChange={e => setDiameter(e.target.value / 100)} />
              </div>
              <div className="control-group">
                <label className="control-label">Temperature: {temperature} °C</label>
                <input type="range" className="control-slider" min={-20} max={60} value={temperature} onChange={e => setTemperature(Number(e.target.value))} />
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Physics Notes</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.8 }}>
                <p><span style={{ color: 'var(--cyan)' }}>Re</span> = ρ·U·D / μ</p>
                <p><span style={{ color: 'var(--cyan)' }}>Cp</span> = 1 - 4·sin²(θ) [inviscid]</p>
                <p><span style={{ color: 'var(--cyan)' }}>P</span> = ½ρ(U∞² - v²) [Bernoulli]</p>
                <p><span style={{ color: 'var(--cyan)' }}>δ</span> = 5x/√Re [Blasius, laminar]</p>
                <p><span style={{ color: 'var(--cyan)' }}>TI</span> = 0.16·Re^(-1/8) [turbulent]</p>
                <p><span style={{ color: 'var(--cyan)' }}>c</span> = 343·√(T/293.15) m/s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
