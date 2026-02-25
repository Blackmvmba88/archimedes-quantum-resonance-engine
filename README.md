# AeroAcoustic Resonance Engine

**Sistema de simulación científica que integra aerodinámica, acústica y resonancia cuántica para análisis de distorsión y generación de diseños adaptativos.**

Desarrollado para **Iyari Cancino Gómez** — Científico Cuántico Operativo, Córdoba, Veracruz, México.

---

## Módulos

### 1. Acoustic Analysis
- FFT Spectrum Analyzer (Cooley-Tukey radix-2)
- Resonance Detection (Helmholtz equation)
- THD Calculator (hasta 10° armónico)
- SPL Mapping (dB ref. 20 μPa)
- Modal Analysis (campos de presión acústica)

### 2. Aerodynamic Simulation
- Velocity Field (flujo potencial 2D)
- Pressure Distribution (Bernoulli)
- Reynolds Calculator
- Surface Cp (invíscido y viscoso)
- Boundary Layer (Blasius)

### 3. Aero-Acoustic Coupling
- Lighthill's Analogy (U⁸ power law)
- Curle's Extension (dipole intensity)
- Strouhal Frequency (vortex shedding)
- Radiation Field

### 4. Adaptive Design Generator
- Evolutionary Optimizer
- Sabine Reverberation (T60)
- 5 Material Properties
- Visual Comparison

### 5. Quantum Resonance
- Quantum Tunneling (rectangular barrier)
- Quantum Well (Schrödinger energy levels)
- Phonon Dispersion (monatomic + diatomic)
- Quantum Coherence (g¹ and g²)

### 6. Real-Time Dashboard
- Live Monitoring (500ms updates)
- Parameter Control
- Data Export (CSV/JSON)
- Timeline Charts

## Instalación

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

*Archimedes Quantum Resonance Engine — Quantum Operations Lab*
