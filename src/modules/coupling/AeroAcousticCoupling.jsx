import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import {
  lighthillPower, strouhalFrequency, aeolianTone,
  curleDipoleIntensity, aeroAcousticField, computeSPL, CONSTANTS
} from '../../utils/physics';

export default function AeroAcousticCoupling() {
  const [velocity, setVelocity] = useState(20);
  const [diameter, setDiameter] = useState(0.05);
  const [distance, setDistance] = useState(1);

  const vortexFreq = useMemo(() => aeolianTone(velocity, diameter), [velocity, diameter]);
  const power = useMemo(() => lighthillPower(velocity, diameter), [velocity, diameter]);
  const intensity = useMemo(() => curleDipoleIntensity(velocity, diameter, distance), [velocity, diameter, distance]);
  const spl = useMemo(() => computeSPL(Math.sqrt(intensity * CONSTANTS.rho * CONSTANTS.c)), [intensity]);

  const field = useMemo(() => aeroAcousticField(velocity, diameter, 60), [velocity, diameter]);

  // Velocity sweep for noise scaling
  const velocitySweep = useMemo(() => {
    const vels = [], powers = [], freqs = [], spls = [];
    for (let v = 1; v <= 80; v += 1) {
      vels.push(v);
      powers.push(lighthillPower(v, diameter));
      freqs.push(aeolianTone(v, diameter));
      const I = curleDipoleIntensity(v, diameter, distance);
      spls.push(computeSPL(Math.sqrt(I * CONSTANTS.rho * CONSTANTS.c)));
    }
    return { vels, powers, freqs, spls };
  }, [diameter, distance]);

  return (
    <>
      <div className="module-header">
        <h2>Aero-Acoustic Coupling</h2>
        <span className="module-tag">LIGHTHILL / CURLE / STROUHAL</span>
      </div>
      <div className="module-body">
        <div className="grid-2-1">
          <div>
            {/* Acoustic radiation field */}
            <div className="panel panel-glow">
              <div className="panel-header">Acoustic Radiation Field — Dipole + Wake</div>
              <PlotlyChart
                data={[{
                  z: field.acousticField,
                  x: field.yCoords,
                  y: field.xCoords,
                  type: 'heatmap',
                  colorscale: [
                    [0, '#0a0a0f'], [0.2, '#1a1a4e'],
                    [0.4, '#7c4dff'], [0.6, '#00e5ff'],
                    [0.8, '#00e676'], [1, '#ffab00']
                  ],
                  showscale: true,
                  colorbar: {
                    title: { text: 'Intensity', font: { size: 10, color: '#8888aa' } },
                    tickfont: { size: 9, color: '#8888aa' },
                  },
                }]}
                layout={{
                  xaxis: { title: 'Y (m)' },
                  yaxis: { title: 'X (m)' },
                  height: 340,
                  annotations: [{
                    x: 0, y: 0,
                    text: '●', font: { size: 20, color: '#ff1744' },
                    showarrow: false,
                  }],
                }}
                style={{ height: '340px' }}
              />
            </div>

            {/* U^8 power law */}
            <div className="panel">
              <div className="panel-header">Lighthill U⁸ Power Law</div>
              <PlotlyChart
                data={[{
                  x: velocitySweep.vels,
                  y: velocitySweep.powers.map(p => p > 0 ? 10 * Math.log10(p / 1e-12) : 0),
                  type: 'scatter', mode: 'lines',
                  line: { color: '#ff1744', width: 2 },
                  name: 'Sound Power (dB)',
                }]}
                layout={{
                  xaxis: { title: 'Flow Velocity (m/s)' },
                  yaxis: { title: 'Sound Power Level (dB)' },
                  height: 240,
                }}
                style={{ height: '240px' }}
              />
            </div>

            {/* SPL vs velocity */}
            <div className="panel">
              <div className="panel-header">SPL vs Velocity — Curle Dipole</div>
              <PlotlyChart
                data={[{
                  x: velocitySweep.vels,
                  y: velocitySweep.spls,
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 2 },
                  name: 'SPL (dB)',
                }, {
                  x: velocitySweep.vels,
                  y: velocitySweep.freqs,
                  type: 'scatter', mode: 'lines',
                  yaxis: 'y2',
                  line: { color: '#7c4dff', width: 2, dash: 'dash' },
                  name: 'Vortex Freq (Hz)',
                }]}
                layout={{
                  xaxis: { title: 'Velocity (m/s)' },
                  yaxis: { title: 'SPL (dB)', titlefont: { color: '#00e5ff' } },
                  yaxis2: {
                    title: 'Frequency (Hz)',
                    titlefont: { color: '#7c4dff' },
                    overlaying: 'y', side: 'right',
                    gridcolor: 'transparent',
                  },
                  height: 260,
                  legend: { font: { size: 10, color: '#8888aa' }, x: 0.02, y: 0.95 },
                }}
                style={{ height: '260px' }}
              />
            </div>
          </div>

          {/* Controls & Metrics */}
          <div>
            <div className="panel">
              <div className="panel-header">Coupling Metrics</div>
              <div className="metric">
                <div className="metric-value">{vortexFreq.toFixed(1)}<span className="metric-unit">Hz</span></div>
                <div className="metric-label">Vortex Shedding Freq (Strouhal)</div>
              </div>
              <div className="metric">
                <div className="metric-value rose">{spl.toFixed(1)}<span className="metric-unit">dB</span></div>
                <div className="metric-label">SPL at {distance}m</div>
              </div>
              <div className="metric">
                <div className="metric-value violet">{power.toExponential(2)}<span className="metric-unit">W</span></div>
                <div className="metric-label">Acoustic Power (Lighthill)</div>
              </div>
              <div className="metric">
                <div className="metric-value emerald">{intensity.toExponential(2)}<span className="metric-unit">W/m²</span></div>
                <div className="metric-label">Sound Intensity (Curle)</div>
              </div>
              <div className="metric">
                <div className="metric-value amber">{(0.2).toFixed(2)}</div>
                <div className="metric-label">Strouhal Number</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Parameters</div>
              <div className="control-group">
                <label className="control-label">Flow Velocity: {velocity} m/s</label>
                <input type="range" className="control-slider" min={1} max={80} value={velocity} onChange={e => setVelocity(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Cylinder Diameter: {(diameter * 100).toFixed(1)} cm</label>
                <input type="range" className="control-slider" min={1} max={50} value={diameter * 100} onChange={e => setDiameter(e.target.value / 100)} />
              </div>
              <div className="control-group">
                <label className="control-label">Observer Distance: {distance} m</label>
                <input type="range" className="control-slider" min={1} max={100} value={distance * 10} onChange={e => setDistance(e.target.value / 10)} />
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Physics — Lighthill's Analogy</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.8 }}>
                <p><span style={{ color: 'var(--rose)' }}>W</span> ∝ ρ·U⁸·D²/c⁵ (monopole)</p>
                <p><span style={{ color: 'var(--cyan)' }}>I</span> ∝ ρ·U⁶·D²/(c³·r²) (dipole, Curle)</p>
                <p><span style={{ color: 'var(--violet)' }}>St</span> = f·D/U ≈ 0.2 (cylinder)</p>
                <p><span style={{ color: 'var(--emerald)' }}>f</span> = St·U/D (aeolian tone)</p>
                <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
                  The U⁸ scaling law shows that small increases in velocity produce dramatic increases in aerodynamic noise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
