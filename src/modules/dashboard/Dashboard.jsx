import React, { useState, useEffect, useRef, useCallback } from 'react';
import PlotlyChart from '../../components/PlotlyChart';
import {
  generateSignal, computeSpectrum, computeTHD, computeSPL,
  reynoldsNumber, flowRegime, turbulenceIntensity,
  lighthillPower, aeolianTone, curleDipoleIntensity, CONSTANTS
} from '../../utils/physics';

export default function Dashboard() {
  const [velocity, setVelocity] = useState(20);
  const [diameter, setDiameter] = useState(0.05);
  const [temperature, setTemperature] = useState(20);
  const [freq, setFreq] = useState(440);
  const [isRunning, setIsRunning] = useState(true);
  const [history, setHistory] = useState({ time: [], spl: [], thd: [], vortexFreq: [], power: [] });
  const frameRef = useRef(0);

  const compute = useCallback(() => {
    const jitter = 1 + (Math.random() - 0.5) * 0.1;
    const v = velocity * jitter;
    const sig = generateSignal({
      sampleRate: 44100, duration: 0.02,
      frequencies: [freq, freq * 2, freq * 3],
      amplitudes: [1, 0.3 * jitter, 0.1 * jitter],
      noiseLevel: 0.05 * jitter,
    });
    const spectrum = computeSpectrum(sig.signal, sig.sampleRate);
    const maxIdx = spectrum.magnitudes.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    const thd = computeTHD(spectrum.magnitudes, maxIdx);
    const rmsP = Math.sqrt(sig.signal.reduce((s, val) => s + val * val, 0) / sig.N) * 0.01;
    const spl = computeSPL(rmsP);
    const Re = reynoldsNumber(v, diameter);
    const regime = flowRegime(Re);
    const TI = turbulenceIntensity(Re);
    const vortexF = aeolianTone(v, diameter);
    const power = lighthillPower(v, diameter);
    const intensity = curleDipoleIntensity(v, diameter, 1);
    const c = CONSTANTS.c * Math.sqrt((temperature + 273.15) / CONSTANTS.T0);

    return { spl, thd, Re, regime, TI, vortexF, power, intensity, spectrum, c, mach: v / c };
  }, [velocity, diameter, temperature, freq]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      frameRef.current++;
      const data = compute();
      setHistory(prev => {
        const t = [...prev.time, frameRef.current * 0.5].slice(-60);
        const s = [...prev.spl, data.spl].slice(-60);
        const th = [...prev.thd, data.thd].slice(-60);
        const vf = [...prev.vortexFreq, data.vortexF].slice(-60);
        const p = [...prev.power, data.power > 0 ? 10 * Math.log10(data.power / 1e-12) : 0].slice(-60);
        return { time: t, spl: s, thd: th, vortexFreq: vf, power: p };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isRunning, compute]);

  const current = compute();

  const exportData = () => {
    const csv = 'Time,SPL_dB,THD_%,VortexFreq_Hz,Power_dB\n' +
      history.time.map((t, i) =>
        `${t},${history.spl[i]?.toFixed(2)},${history.thd[i]?.toFixed(2)},${history.vortexFreq[i]?.toFixed(1)},${history.power[i]?.toFixed(2)}`
      ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'aeroacoustic_data.csv'; a.click();
  };

  const exportJSON = () => {
    const json = JSON.stringify({ parameters: { velocity, diameter, temperature, freq }, history }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'aeroacoustic_data.json'; a.click();
  };

  return (
    <>
      <div className="module-header">
        <h2>Real-Time Dashboard</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="module-tag">{isRunning ? '● LIVE' : '○ PAUSED'}</span>
          <button className="btn" onClick={() => setIsRunning(!isRunning)} style={{ padding: '3px 12px', fontSize: 10 }}>
            {isRunning ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>
      <div className="module-body">
        {/* Top metrics */}
        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div className="panel">
            <div className="metric">
              <div className="metric-value">{current.spl.toFixed(1)}<span className="metric-unit">dB</span></div>
              <div className="metric-label">SPL</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value violet">{current.thd.toFixed(2)}<span className="metric-unit">%</span></div>
              <div className="metric-label">THD</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value" style={{ color: current.regime.color }}>{current.Re.toExponential(2)}</div>
              <div className="metric-label">Reynolds ({current.regime.regime})</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value emerald">{current.vortexF.toFixed(1)}<span className="metric-unit">Hz</span></div>
              <div className="metric-label">Vortex Frequency</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value amber">{current.mach.toFixed(4)}</div>
              <div className="metric-label">Mach Number</div>
            </div>
          </div>
          <div className="panel">
            <div className="metric">
              <div className="metric-value rose">{(current.TI * 100).toFixed(2)}<span className="metric-unit">%</span></div>
              <div className="metric-label">Turbulence Intensity</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* SPL timeline */}
          <div className="panel panel-glow">
            <div className="panel-header">SPL Timeline</div>
            <PlotlyChart
              data={[{
                x: history.time,
                y: history.spl,
                type: 'scatter', mode: 'lines',
                line: { color: '#00e5ff', width: 2 },
                fill: 'tozeroy',
                fillcolor: 'rgba(0,229,255,0.08)',
              }]}
              layout={{
                xaxis: { title: 'Time (s)' },
                yaxis: { title: 'SPL (dB)' },
                height: 220,
              }}
              style={{ height: '220px' }}
            />
          </div>

          {/* THD timeline */}
          <div className="panel panel-glow">
            <div className="panel-header">THD Timeline</div>
            <PlotlyChart
              data={[{
                x: history.time,
                y: history.thd,
                type: 'scatter', mode: 'lines',
                line: { color: '#7c4dff', width: 2 },
                fill: 'tozeroy',
                fillcolor: 'rgba(124,77,255,0.08)',
              }]}
              layout={{
                xaxis: { title: 'Time (s)' },
                yaxis: { title: 'THD (%)' },
                height: 220,
              }}
              style={{ height: '220px' }}
            />
          </div>

          {/* Vortex freq timeline */}
          <div className="panel">
            <div className="panel-header">Vortex Shedding Frequency</div>
            <PlotlyChart
              data={[{
                x: history.time,
                y: history.vortexFreq,
                type: 'scatter', mode: 'lines',
                line: { color: '#00e676', width: 2 },
              }]}
              layout={{
                xaxis: { title: 'Time (s)' },
                yaxis: { title: 'Frequency (Hz)' },
                height: 220,
              }}
              style={{ height: '220px' }}
            />
          </div>

          {/* Acoustic power timeline */}
          <div className="panel">
            <div className="panel-header">Acoustic Power Level</div>
            <PlotlyChart
              data={[{
                x: history.time,
                y: history.power,
                type: 'scatter', mode: 'lines',
                line: { color: '#ff1744', width: 2 },
                fill: 'tozeroy',
                fillcolor: 'rgba(255,23,68,0.08)',
              }]}
              layout={{
                xaxis: { title: 'Time (s)' },
                yaxis: { title: 'Power (dB re 1pW)' },
                height: 220,
              }}
              style={{ height: '220px' }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="panel">
            <div className="panel-header">System Parameters</div>
            <div className="grid-2">
              <div className="control-group">
                <label className="control-label">Flow Velocity: {velocity} m/s</label>
                <input type="range" className="control-slider" min={1} max={80} value={velocity} onChange={e => setVelocity(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Diameter: {(diameter * 100).toFixed(1)} cm</label>
                <input type="range" className="control-slider" min={1} max={50} value={diameter * 100} onChange={e => setDiameter(e.target.value / 100)} />
              </div>
              <div className="control-group">
                <label className="control-label">Temperature: {temperature} °C</label>
                <input type="range" className="control-slider" min={-20} max={60} value={temperature} onChange={e => setTemperature(Number(e.target.value))} />
              </div>
              <div className="control-group">
                <label className="control-label">Signal Freq: {freq} Hz</label>
                <input type="range" className="control-slider" min={50} max={2000} value={freq} onChange={e => setFreq(Number(e.target.value))} />
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">Data Export</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <button className="btn" onClick={exportData}>Export CSV</button>
              <button className="btn btn-violet" onClick={exportJSON}>Export JSON</button>
            </div>
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
              <p>Samples: {history.time.length} / 60</p>
              <p>Interval: 500ms</p>
              <p>Frame: #{frameRef.current}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
