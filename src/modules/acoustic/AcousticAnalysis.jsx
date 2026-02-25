import React, { useState, useMemo } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import {
  generateSignal, computeSpectrum, computeTHD, computeSPL,
  helmholtzModes, acousticPressureField
} from '../../utils/physics';

export default function AcousticAnalysis() {
  const [freq1, setFreq1] = useState(440);
  const [freq2, setFreq2] = useState(880);
  const [freq3, setFreq3] = useState(1320);
  const [amp1, setAmp1] = useState(1.0);
  const [amp2, setAmp2] = useState(0.3);
  const [amp3, setAmp3] = useState(0.15);
  const [noise, setNoise] = useState(0.05);
  const [roomW, setRoomW] = useState(5);
  const [roomH, setRoomH] = useState(3);
  const [roomD, setRoomD] = useState(4);
  const [selectedMode, setSelectedMode] = useState(0);

  const signalData = useMemo(() => {
    const sig = generateSignal({
      sampleRate: 44100, duration: 0.05,
      frequencies: [freq1, freq2, freq3],
      amplitudes: [amp1, amp2, amp3],
      noiseLevel: noise,
    });
    const spectrum = computeSpectrum(sig.signal, sig.sampleRate);
    const maxIdx = spectrum.magnitudes.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    const thd = computeTHD(spectrum.magnitudes, maxIdx);
    const rmsP = Math.sqrt(sig.signal.reduce((s, v) => s + v * v, 0) / sig.N) * 0.01;
    const spl = computeSPL(rmsP);
    return { sig, spectrum, thd, spl, maxIdx };
  }, [freq1, freq2, freq3, amp1, amp2, amp3, noise]);

  const modes = useMemo(() => helmholtzModes(roomW, roomH, roomD, 4), [roomW, roomH, roomD]);
  const pressureField = useMemo(() => {
    if (modes.length === 0) return null;
    const m = modes[selectedMode] || modes[0];
    return acousticPressureField(m.nx, m.ny, roomW, roomH, 60);
  }, [modes, selectedMode, roomW, roomH]);

  return (
    <>
      <div className="module-header">
        <h2>Acoustic Analysis</h2>
        <span className="module-tag">FFT / THD / SPL / HELMHOLTZ</span>
      </div>
      <div className="module-body">
        <div className="grid-2-1">
          <div>
            {/* Waveform */}
            <div className="panel panel-glow">
              <div className="panel-header">Waveform — Time Domain</div>
              <PlotlyChart
                data={[{
                  x: Array.from(signalData.sig.t).slice(0, 1000).map(v => v * 1000),
                  y: Array.from(signalData.sig.signal).slice(0, 1000),
                  type: 'scatter', mode: 'lines',
                  line: { color: '#00e5ff', width: 1 },
                }]}
                layout={{
                  xaxis: { title: 'Time (ms)' },
                  yaxis: { title: 'Amplitude' },
                  height: 220,
                }}
                style={{ height: '220px' }}
              />
            </div>

            {/* Spectrum */}
            <div className="panel panel-glow">
              <div className="panel-header">Frequency Spectrum — FFT</div>
              <PlotlyChart
                data={[{
                  x: signalData.spectrum.freqs.slice(0, 2000),
                  y: signalData.spectrum.magnitudes.slice(0, 2000),
                  type: 'scatter', mode: 'lines',
                  fill: 'tozeroy',
                  line: { color: '#7c4dff', width: 1 },
                  fillcolor: 'rgba(124,77,255,0.15)',
                }]}
                layout={{
                  xaxis: { title: 'Frequency (Hz)', range: [0, 5000] },
                  yaxis: { title: 'Magnitude' },
                  height: 220,
                }}
                style={{ height: '220px' }}
              />
            </div>

            {/* Pressure field */}
            <div className="panel">
              <div className="panel-header">
                Acoustic Pressure Field — Mode ({modes[selectedMode]?.nx},{modes[selectedMode]?.ny},{modes[selectedMode]?.nz}) @ {modes[selectedMode]?.frequency.toFixed(1)} Hz
              </div>
              {pressureField && (
                <PlotlyChart
                  data={[{
                    z: pressureField,
                    type: 'heatmap',
                    colorscale: [
                      [0, '#0a0a0f'], [0.2, '#7c4dff'],
                      [0.5, '#00e5ff'], [0.8, '#00e676'], [1, '#ffab00']
                    ],
                    showscale: true,
                    colorbar: { tickfont: { size: 9, color: '#8888aa' } },
                  }]}
                  layout={{
                    xaxis: { title: `Width (${roomW}m)` },
                    yaxis: { title: `Height (${roomH}m)` },
                    height: 280,
                  }}
                  style={{ height: '280px' }}
                />
              )}
              <div style={{ marginTop: 8 }}>
                <label className="control-label">Select Mode</label>
                <input
                  type="range" className="control-slider"
                  min={0} max={Math.min(modes.length - 1, 30)} value={selectedMode}
                  onChange={e => setSelectedMode(Number(e.target.value))}
                />
                <div className="control-value">Mode {selectedMode + 1} / {Math.min(modes.length, 31)}</div>
              </div>
            </div>
          </div>

          {/* Controls & Metrics */}
          <div>
            <div className="panel">
              <div className="panel-header">Metrics</div>
              <div className="metric">
                <div className="metric-value">{signalData.thd.toFixed(2)}<span className="metric-unit">%</span></div>
                <div className="metric-label">THD (Total Harmonic Distortion)</div>
              </div>
              <div className="metric">
                <div className="metric-value violet">{signalData.spl.toFixed(1)}<span className="metric-unit">dB</span></div>
                <div className="metric-label">Sound Pressure Level</div>
              </div>
              <div className="metric">
                <div className="metric-value emerald">{signalData.spectrum.freqs[signalData.maxIdx]?.toFixed(0)}<span className="metric-unit">Hz</span></div>
                <div className="metric-label">Peak Frequency</div>
              </div>
              <div className="metric">
                <div className="metric-value amber">{modes.length}</div>
                <div className="metric-label">Room Modes Detected</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Signal Generator</div>
              <div className="control-group">
                <label className="control-label">Fundamental: {freq1} Hz</label>
                <input type="range" className="control-slider" min={50} max={2000} value={freq1} onChange={e => setFreq1(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Amp 1: {amp1.toFixed(2)}</label>
                <input type="range" className="control-slider" min={0} max={100} value={amp1 * 100} onChange={e => setAmp1(e.target.value / 100)} />
              </div>
              <div className="control-group">
                <label className="control-label">Harmonic 2: {freq2} Hz</label>
                <input type="range" className="control-slider" min={50} max={4000} value={freq2} onChange={e => setFreq2(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Amp 2: {amp2.toFixed(2)}</label>
                <input type="range" className="control-slider" min={0} max={100} value={amp2 * 100} onChange={e => setAmp2(e.target.value / 100)} />
              </div>
              <div className="control-group">
                <label className="control-label">Harmonic 3: {freq3} Hz</label>
                <input type="range" className="control-slider" min={50} max={6000} value={freq3} onChange={e => setFreq3(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Amp 3: {amp3.toFixed(2)}</label>
                <input type="range" className="control-slider" min={0} max={100} value={amp3 * 100} onChange={e => setAmp3(e.target.value / 100)} />
              </div>
              <div className="control-group">
                <label className="control-label">Noise: {noise.toFixed(3)}</label>
                <input type="range" className="control-slider" min={0} max={100} value={noise * 1000} onChange={e => setNoise(e.target.value / 1000)} />
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Room Dimensions (Helmholtz)</div>
              <div className="control-group">
                <label className="control-label">Width: {roomW} m</label>
                <input type="range" className="control-slider" min={10} max={100} value={roomW * 10} onChange={e => setRoomW(e.target.value / 10)} />
              </div>
              <div className="control-group">
                <label className="control-label">Height: {roomH} m</label>
                <input type="range" className="control-slider" min={10} max={60} value={roomH * 10} onChange={e => setRoomH(e.target.value / 10)} />
              </div>
              <div className="control-group">
                <label className="control-label">Depth: {roomD} m</label>
                <input type="range" className="control-slider" min={10} max={100} value={roomD * 10} onChange={e => setRoomD(e.target.value / 10)} />
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Top Room Modes</div>
              <div style={{ maxHeight: 180, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '4px', textAlign: 'left' }}>#</th>
                      <th style={{ padding: '4px', textAlign: 'left' }}>Mode</th>
                      <th style={{ padding: '4px', textAlign: 'right' }}>Freq (Hz)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modes.slice(0, 15).map((m, i) => (
                      <tr key={i} style={{
                        color: i === selectedMode ? 'var(--cyan)' : 'var(--text-secondary)',
                        cursor: 'pointer', borderBottom: '1px solid var(--border)'
                      }} onClick={() => setSelectedMode(i)}>
                        <td style={{ padding: '3px 4px' }}>{i + 1}</td>
                        <td style={{ padding: '3px 4px' }}>({m.nx},{m.ny},{m.nz})</td>
                        <td style={{ padding: '3px 4px', textAlign: 'right' }}>{m.frequency.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
