# Archimedes Quantum Laboratory

> *"Dadme una frecuencia y moveré el mundo."*

**A rigorous digital laboratory for studying, controlling, and visualizing real quantum systems.**

Developed for **Iyari Cancino Gómez** — Quantum Operations Scientist, Córdoba, Veracruz, México.

---

## Guiding Philosophy

The architecture of this project follows the physics, not the other way around. Every design decision is grounded in physical correctness, and every abstraction must satisfy **ontological continuity**: it must collapse correctly to its physical limit. For example, the quantum Two-Level System (Phase 2) must reproduce the classical Lorentz lineshape (Phase 1) in the weak-field limit with RMS error < 1%.

All computations are performed in **SI units**.

---

## Scientific Roadmap

| Phase | Title | Model | Status |
| :---: | :--- | :--- | :--- |
| 1 | **Classical Foundation** | Lorentz Oscillator | ✅ COMPLETE |
| 2 | **Quantum Matter** | Two-Level System (Bloch Equations) | 🔄 IN DEVELOPMENT |
| 3 | **Coherent Control** | Optimal Control (GRAPE/CRAB, π-pulses) | 📋 PLANNED |
| 4 | **Quantum Field** | Jaynes-Cummings (cavity QED) | 📋 PLANNED |
| 5 | **Condensed Matter** | Exciton-Polaritons (semiconductor microcavity) | 📋 PLANNED |
| 6 | **Quantum Error Correction** | Stabilizer Codes (Steane, Surface Code) | 📋 PLANNED |

---

## Repository Structure

```
src/
├── core/                          # Physics engine (architecture follows physics)
│   ├── shared/
│   │   └── constants.js           # Physical constants in SI units
│   ├── phase1_classical/
│   │   └── lorentz.js             # Lorentz oscillator, susceptibility, Beer-Lambert
│   ├── phase2_quantum_matter/
│   │   └── tls.js                 # Bloch equations, RK4 integrator, Lorentz validation
│   ├── phase3_coherent_control/
│   │   └── control.js             # Pulse shaping, π-pulse fidelity
│   ├── phase4_quantum_field/
│   │   └── jaynes_cummings.js     # JC spectrum, collapse & revival
│   ├── phase5_condensed_matter/
│   │   └── polaritons.js          # Polariton dispersion, Hopfield coefficients
│   └── phase6_error_correction/
│       └── stabilizer.js          # Syndrome decoding, threshold analysis
│
├── modules/                       # UI components (one per phase)
│   ├── phase1/Phase1Classical.jsx
│   ├── phase2/Phase2QuantumMatter.jsx
│   ├── phase3/Phase3CoherentControl.jsx
│   ├── phase4/Phase4QuantumField.jsx
│   ├── phase5/Phase5CondensedMatter.jsx
│   ├── phase6/Phase6ErrorCorrection.jsx
│   │
│   └── [auxiliary modules: acoustic, aerodynamic, coupling, design, dashboard]
│
├── components/
│   └── PlotlyChart.jsx            # Reusable Plotly wrapper
│
└── App.jsx                        # Root: roadmap navigation + auxiliary tools
```

---

## Phase 1 — Classical Foundation (COMPLETE)

**Model:** Lorentz Oscillator — the electron as a damped harmonic oscillator driven by an EM field.

**Susceptibility:** `χ(ω) = (e²/mε₀) / (ω₀² − ω² − iγω)`

**Validation:** Pyridine UV absorption at 260 nm, Q = 5.2, peak deviation < 1 nm. ✅

---

## Phase 2 — Quantum Matter (IN DEVELOPMENT)

**Model:** Two-Level System (TLS) with Optical Bloch Equations.

**State:** Bloch vector (u, v, w) — parameterizes the density matrix ρ.

**Equations:**
```
du/dt = −δv − u/T₂
dv/dt =  δu + Ωw − v/T₂
dw/dt = −Ωv − (w − w₀)/T₁
```

**Validation criterion:** In the weak-field limit (Ω ≪ γ), the TLS absorption must reproduce the Lorentz lineshape with RMS error < 1%.

---

## Auxiliary Modules

The application also includes legacy engineering tools:

- **Acoustic Analysis** — FFT spectrum, Helmholtz modes, THD, SPL mapping
- **Aerodynamic Simulation** — Potential flow, Reynolds, boundary layer (Blasius)
- **Aero-Acoustic Coupling** — Lighthill's analogy, Curle's extension, Strouhal frequency
- **Adaptive Design** — Evolutionary geometry optimizer, Sabine reverberation
- **Real-Time Dashboard** — Live monitoring with CSV/JSON export

---

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npx serve dist
```

---

*Archimedes Quantum Laboratory v2.0 — Architecture follows physics.*
