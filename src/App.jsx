import React, { useState } from 'react';
import AcousticAnalysis from './modules/acoustic/AcousticAnalysis';
import AerodynamicSim from './modules/aerodynamic/AerodynamicSim';
import AeroAcousticCoupling from './modules/coupling/AeroAcousticCoupling';
import AdaptiveDesign from './modules/design/AdaptiveDesign';
import QuantumResonance from './modules/quantum/QuantumResonance';
import Dashboard from './modules/dashboard/Dashboard';

const modules = [
  { id: 'acoustic', label: 'Acoustic Analysis', icon: '◎', component: AcousticAnalysis },
  { id: 'aerodynamic', label: 'Aerodynamic Sim', icon: '◈', component: AerodynamicSim },
  { id: 'coupling', label: 'Aero-Acoustic', icon: '◉', component: AeroAcousticCoupling },
  { id: 'design', label: 'Adaptive Design', icon: '◆', component: AdaptiveDesign },
  { id: 'quantum', label: 'Quantum Resonance', icon: '◇', component: QuantumResonance },
  { id: 'dashboard', label: 'Dashboard', icon: '◫', component: Dashboard },
];

export default function App() {
  const [activeModule, setActiveModule] = useState('acoustic');
  const ActiveComponent = modules.find(m => m.id === activeModule)?.component || AcousticAnalysis;

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>AeroAcoustic<br />Resonance Engine</h1>
          <div className="subtitle">v1.0 — Quantum Operations Lab</div>
        </div>
        <div className="sidebar-nav">
          {modules.map(m => (
            <div
              key={m.id}
              className={`nav-item ${activeModule === m.id ? 'active' : ''}`}
              onClick={() => setActiveModule(m.id)}
            >
              <span className="nav-icon">{m.icon}</span>
              <span className="nav-label">{m.label}</span>
            </div>
          ))}
        </div>
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text-dim)',
          lineHeight: 1.6,
        }}>
          <div>Iyari Cancino Gómez</div>
          <div>Quantum Operations Scientist</div>
          <div style={{ color: 'var(--cyan)', marginTop: 4 }}>Córdoba, Veracruz, MX</div>
        </div>
      </nav>

      <main className="main-content">
        <ActiveComponent />
        <div className="telemetry-bar">
          <div className="telemetry-item">
            <div className="telemetry-dot" />
            <span>SYSTEM ACTIVE</span>
          </div>
          <div className="telemetry-item">
            <span>MODULE: {activeModule.toUpperCase()}</span>
          </div>
          <div className="telemetry-item">
            <span>ENGINE: REAL-TIME PHYSICS</span>
          </div>
          <div className="telemetry-item">
            <span>PRECISION: FLOAT64</span>
          </div>
          <div className="telemetry-item" style={{ marginLeft: 'auto' }}>
            <span>ARCHIMEDES QUANTUM RESONANCE ENGINE</span>
          </div>
        </div>
      </main>
    </div>
  );
}
