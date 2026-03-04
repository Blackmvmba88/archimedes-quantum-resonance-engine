import React, { useState } from 'react';

// Scientific roadmap modules (new architecture)
import Phase1Classical      from './modules/phase1/Phase1Classical';
import Phase2QuantumMatter  from './modules/phase2/Phase2QuantumMatter';
import Phase3CoherentControl from './modules/phase3/Phase3CoherentControl';
import Phase4QuantumField   from './modules/phase4/Phase4QuantumField';
import Phase5CondensedMatter from './modules/phase5/Phase5CondensedMatter';
import Phase6ErrorCorrection from './modules/phase6/Phase6ErrorCorrection';

// Legacy auxiliary modules
import AcousticAnalysis     from './modules/acoustic/AcousticAnalysis';
import AerodynamicSim       from './modules/aerodynamic/AerodynamicSim';
import AeroAcousticCoupling from './modules/coupling/AeroAcousticCoupling';
import AdaptiveDesign       from './modules/design/AdaptiveDesign';
import Dashboard            from './modules/dashboard/Dashboard';

const PHASES = [
  {
    id: 'phase1',
    label: 'Phase 1',
    sublabel: 'Classical Foundation',
    icon: '①',
    status: 'complete',
    statusColor: '#00e676',
    component: Phase1Classical,
  },
  {
    id: 'phase2',
    label: 'Phase 2',
    sublabel: 'Quantum Matter',
    icon: '②',
    status: 'dev',
    statusColor: '#00e5ff',
    component: Phase2QuantumMatter,
  },
  {
    id: 'phase3',
    label: 'Phase 3',
    sublabel: 'Coherent Control',
    icon: '③',
    status: 'planned',
    statusColor: '#ffab00',
    component: Phase3CoherentControl,
  },
  {
    id: 'phase4',
    label: 'Phase 4',
    sublabel: 'Quantum Field',
    icon: '④',
    status: 'planned',
    statusColor: '#7c4dff',
    component: Phase4QuantumField,
  },
  {
    id: 'phase5',
    label: 'Phase 5',
    sublabel: 'Condensed Matter',
    icon: '⑤',
    status: 'planned',
    statusColor: '#ff6d00',
    component: Phase5CondensedMatter,
  },
  {
    id: 'phase6',
    label: 'Phase 6',
    sublabel: 'Error Correction',
    icon: '⑥',
    status: 'planned',
    statusColor: '#ff1744',
    component: Phase6ErrorCorrection,
  },
];

const AUXILIARY = [
  { id: 'acoustic',    label: 'Acoustic Analysis',  icon: '◎', component: AcousticAnalysis },
  { id: 'aerodynamic', label: 'Aerodynamic Sim',     icon: '◈', component: AerodynamicSim },
  { id: 'coupling',    label: 'Aero-Acoustic',       icon: '◉', component: AeroAcousticCoupling },
  { id: 'design',      label: 'Adaptive Design',     icon: '◆', component: AdaptiveDesign },
  { id: 'dashboard',   label: 'Dashboard',           icon: '◫', component: Dashboard },
];

const STATUS_LABELS = {
  complete: '✓',
  dev: '⟳',
  planned: '◷',
};

export default function App() {
  const [activeId, setActiveId] = useState('phase1');
  const [section, setSection] = useState('roadmap'); // 'roadmap' | 'auxiliary'

  const allModules = [...PHASES, ...AUXILIARY];
  const ActiveComponent = allModules.find(m => m.id === activeId)?.component || Phase1Classical;
  const activePhase = PHASES.find(p => p.id === activeId);

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Archimedes<br />Quantum Lab</h1>
          <div className="subtitle">v2.0 — Scientific Roadmap</div>
        </div>

        {/* Section toggle */}
        <div style={{ display: 'flex', margin: '8px 12px', gap: 4 }}>
          <button
            onClick={() => setSection('roadmap')}
            style={{
              flex: 1, padding: '5px 0', fontSize: 9, fontFamily: 'var(--font-mono)',
              background: section === 'roadmap' ? 'rgba(0,229,255,0.15)' : 'transparent',
              color: section === 'roadmap' ? 'var(--cyan)' : 'var(--text-dim)',
              border: `1px solid ${section === 'roadmap' ? 'var(--cyan)' : 'var(--border)'}`,
              borderRadius: 3, cursor: 'pointer', letterSpacing: 1,
            }}>
            ROADMAP
          </button>
          <button
            onClick={() => setSection('auxiliary')}
            style={{
              flex: 1, padding: '5px 0', fontSize: 9, fontFamily: 'var(--font-mono)',
              background: section === 'auxiliary' ? 'rgba(124,77,255,0.15)' : 'transparent',
              color: section === 'auxiliary' ? 'var(--violet)' : 'var(--text-dim)',
              border: `1px solid ${section === 'auxiliary' ? 'var(--violet)' : 'var(--border)'}`,
              borderRadius: 3, cursor: 'pointer', letterSpacing: 1,
            }}>
            AUXILIARY
          </button>
        </div>

        <div className="sidebar-nav">
          {section === 'roadmap' ? (
            PHASES.map(p => (
              <div
                key={p.id}
                className={`nav-item ${activeId === p.id ? 'active' : ''}`}
                onClick={() => setActiveId(p.id)}
                style={{ borderLeft: activeId === p.id ? `2px solid ${p.statusColor}` : '2px solid transparent' }}
              >
                <span className="nav-icon" style={{ color: p.statusColor }}>{p.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span className="nav-label">{p.label}</span>
                  <span style={{ fontSize: 8, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {p.sublabel}
                  </span>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 9, color: p.statusColor }}>
                  {STATUS_LABELS[p.status]}
                </span>
              </div>
            ))
          ) : (
            AUXILIARY.map(m => (
              <div
                key={m.id}
                className={`nav-item ${activeId === m.id ? 'active' : ''}`}
                onClick={() => setActiveId(m.id)}
              >
                <span className="nav-icon">{m.icon}</span>
                <span className="nav-label">{m.label}</span>
              </div>
            ))
          )}
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
          <div style={{ marginTop: 6, color: 'var(--text-dim)' }}>
            <span style={{ color: '#00e676' }}>■</span> Complete: 1/6
            <span style={{ marginLeft: 8, color: '#00e5ff' }}>■</span> Dev: 1/6
          </div>
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
            <span>MODULE: {activeId.toUpperCase()}</span>
          </div>
          {activePhase && (
            <div className="telemetry-item" style={{ color: activePhase.statusColor }}>
              <span>STATUS: {activePhase.status.toUpperCase()}</span>
            </div>
          )}
          <div className="telemetry-item">
            <span>PRECISION: FLOAT64 · SI UNITS</span>
          </div>
          <div className="telemetry-item" style={{ marginLeft: 'auto' }}>
            <span>ARCHIMEDES QUANTUM LABORATORY v2.0</span>
          </div>
        </div>
      </main>
    </div>
  );
}
