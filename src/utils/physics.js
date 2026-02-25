// ============================================================
// AeroAcoustic Resonance Engine — Physics Core
// Real physics equations for acoustics, aerodynamics, and quantum resonance
// ============================================================

// Constants
export const CONSTANTS = {
  c: 343,           // Speed of sound in air (m/s) at 20°C
  rho: 1.225,       // Air density (kg/m³) at sea level
  mu: 1.81e-5,      // Dynamic viscosity of air (Pa·s)
  kB: 1.381e-23,    // Boltzmann constant (J/K)
  hbar: 1.055e-34,  // Reduced Planck constant (J·s)
  gamma: 1.4,       // Adiabatic index for air
  P0: 101325,       // Standard atmospheric pressure (Pa)
  T0: 293.15,       // Standard temperature (K)
  pRef: 2e-5,       // Reference sound pressure (Pa)
};

// ============================================================
// ACOUSTIC ANALYSIS
// ============================================================

/**
 * Compute FFT of a signal (Cooley-Tukey radix-2)
 */
export function fft(re, im) {
  const N = re.length;
  if (N <= 1) return { re: [...re], im: [...im] };
  
  // Bit-reversal permutation
  const outRe = new Float64Array(N);
  const outIm = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    let j = 0, x = i;
    for (let k = 0; k < Math.log2(N); k++) {
      j = (j << 1) | (x & 1);
      x >>= 1;
    }
    outRe[j] = re[i];
    outIm[j] = im[i];
  }
  
  for (let size = 2; size <= N; size *= 2) {
    const halfSize = size / 2;
    const angle = -2 * Math.PI / size;
    for (let i = 0; i < N; i += size) {
      for (let j = 0; j < halfSize; j++) {
        const cos = Math.cos(angle * j);
        const sin = Math.sin(angle * j);
        const tRe = outRe[i + j + halfSize] * cos - outIm[i + j + halfSize] * sin;
        const tIm = outRe[i + j + halfSize] * sin + outIm[i + j + halfSize] * cos;
        outRe[i + j + halfSize] = outRe[i + j] - tRe;
        outIm[i + j + halfSize] = outIm[i + j] - tIm;
        outRe[i + j] += tRe;
        outIm[i + j] += tIm;
      }
    }
  }
  return { re: outRe, im: outIm };
}

/**
 * Generate a composite signal with harmonics
 */
export function generateSignal(params) {
  const { sampleRate = 44100, duration = 0.1, frequencies = [440], amplitudes = [1], noiseLevel = 0.01 } = params;
  const N = Math.pow(2, Math.ceil(Math.log2(sampleRate * duration)));
  const signal = new Float64Array(N);
  const t = new Float64Array(N);
  
  for (let i = 0; i < N; i++) {
    t[i] = i / sampleRate;
    for (let f = 0; f < frequencies.length; f++) {
      signal[i] += (amplitudes[f] || 1) * Math.sin(2 * Math.PI * frequencies[f] * t[i]);
    }
    signal[i] += noiseLevel * (Math.random() * 2 - 1);
  }
  return { signal, t, N, sampleRate };
}

/**
 * Compute frequency spectrum from FFT
 */
export function computeSpectrum(signal, sampleRate) {
  const N = signal.length;
  const im = new Float64Array(N);
  const result = fft(signal, im);
  
  const freqs = [];
  const magnitudes = [];
  const phases = [];
  
  for (let i = 0; i < N / 2; i++) {
    freqs.push(i * sampleRate / N);
    const mag = Math.sqrt(result.re[i] ** 2 + result.im[i] ** 2) / N * 2;
    magnitudes.push(mag);
    phases.push(Math.atan2(result.im[i], result.re[i]));
  }
  return { freqs, magnitudes, phases };
}

/**
 * Total Harmonic Distortion (THD)
 */
export function computeTHD(magnitudes, fundamentalIdx) {
  const fundamental = magnitudes[fundamentalIdx];
  if (fundamental === 0) return 0;
  
  let harmonicSum = 0;
  for (let h = 2; h <= 10; h++) {
    const idx = fundamentalIdx * h;
    if (idx < magnitudes.length) {
      harmonicSum += magnitudes[idx] ** 2;
    }
  }
  return Math.sqrt(harmonicSum) / fundamental * 100;
}

/**
 * Sound Pressure Level in dB
 */
export function computeSPL(pressure) {
  return 20 * Math.log10(Math.abs(pressure) / CONSTANTS.pRef);
}

/**
 * Helmholtz equation: resonance frequencies of a rectangular cavity
 * f = (c/2) * sqrt((nx/Lx)^2 + (ny/Ly)^2 + (nz/Lz)^2)
 */
export function helmholtzModes(Lx, Ly, Lz, maxMode = 5) {
  const modes = [];
  for (let nx = 0; nx <= maxMode; nx++) {
    for (let ny = 0; ny <= maxMode; ny++) {
      for (let nz = 0; nz <= maxMode; nz++) {
        if (nx === 0 && ny === 0 && nz === 0) continue;
        const freq = (CONSTANTS.c / 2) * Math.sqrt(
          (nx / Lx) ** 2 + (ny / Ly) ** 2 + (nz / Lz) ** 2
        );
        modes.push({ nx, ny, nz, frequency: freq });
      }
    }
  }
  modes.sort((a, b) => a.frequency - b.frequency);
  return modes;
}

/**
 * Acoustic pressure field for a mode in a rectangular cavity
 */
export function acousticPressureField(nx, ny, Lx, Ly, resolution = 50) {
  const field = [];
  for (let i = 0; i < resolution; i++) {
    const row = [];
    for (let j = 0; j < resolution; j++) {
      const x = (i / (resolution - 1)) * Lx;
      const y = (j / (resolution - 1)) * Ly;
      const p = Math.cos(nx * Math.PI * x / Lx) * Math.cos(ny * Math.PI * y / Ly);
      row.push(p);
    }
    field.push(row);
  }
  return field;
}

// ============================================================
// AERODYNAMIC SIMULATION
// ============================================================

/**
 * Reynolds number
 */
export function reynoldsNumber(velocity, length, density = CONSTANTS.rho, viscosity = CONSTANTS.mu) {
  return density * velocity * length / viscosity;
}

/**
 * Flow regime classification
 */
export function flowRegime(Re) {
  if (Re < 2300) return { regime: 'Laminar', color: '#00e5ff' };
  if (Re < 4000) return { regime: 'Transición', color: '#ffab00' };
  return { regime: 'Turbulento', color: '#ff1744' };
}

/**
 * 2D potential flow around a cylinder (velocity field)
 * Using stream function: ψ = U∞(r - R²/r)sinθ
 */
export function cylinderFlow(U_inf, R, gridSize = 40) {
  const xMin = -3 * R, xMax = 5 * R;
  const yMin = -3 * R, yMax = 3 * R;
  
  const u = [], v = [], x = [], y = [], speed = [], pressure = [];
  
  for (let i = 0; i < gridSize; i++) {
    const uRow = [], vRow = [], speedRow = [], pressureRow = [];
    const xi = xMin + (xMax - xMin) * i / (gridSize - 1);
    x.push(xi);
    
    for (let j = 0; j < gridSize; j++) {
      const yj = yMin + (yMax - yMin) * j / (gridSize - 1);
      if (i === 0) y.push(yj);
      
      const r = Math.sqrt(xi ** 2 + yj ** 2);
      
      if (r < R * 1.01) {
        uRow.push(0);
        vRow.push(0);
        speedRow.push(0);
        pressureRow.push(0.5 * CONSTANTS.rho * U_inf ** 2);
      } else {
        const theta = Math.atan2(yj, xi);
        const vr = U_inf * (1 - (R / r) ** 2) * Math.cos(theta);
        const vt = -U_inf * (1 + (R / r) ** 2) * Math.sin(theta);
        
        const ux = vr * Math.cos(theta) - vt * Math.sin(theta);
        const uy = vr * Math.sin(theta) + vt * Math.cos(theta);
        const spd = Math.sqrt(ux ** 2 + uy ** 2);
        
        uRow.push(ux);
        vRow.push(uy);
        speedRow.push(spd);
        // Bernoulli: P + 0.5*rho*v² = P0 + 0.5*rho*U²
        pressureRow.push(0.5 * CONSTANTS.rho * (U_inf ** 2 - spd ** 2));
      }
    }
    u.push(uRow);
    v.push(vRow);
    speed.push(speedRow);
    pressure.push(pressureRow);
  }
  
  return { u, v, x, y, speed, pressure };
}

/**
 * Turbulence intensity estimation
 */
export function turbulenceIntensity(Re) {
  if (Re < 2300) return 0.01;
  return 0.16 * Math.pow(Re, -1 / 8);
}

/**
 * Boundary layer thickness (Blasius for laminar)
 */
export function boundaryLayerThickness(x, Re_x) {
  if (Re_x < 2300) {
    return 5.0 * x / Math.sqrt(Re_x); // Laminar (Blasius)
  }
  return 0.37 * x / Math.pow(Re_x, 0.2); // Turbulent
}

// ============================================================
// AERO-ACOUSTIC COUPLING (Lighthill's Analogy)
// ============================================================

/**
 * Lighthill's acoustic analogy — sound power from turbulent flow
 * W ∝ ρ * U^8 * D² / c^5 (for compact sources)
 */
export function lighthillPower(U, D, rho = CONSTANTS.rho, c = CONSTANTS.c) {
  const K = 1e-4; // Proportionality constant
  return K * rho * Math.pow(U, 8) * D * D / Math.pow(c, 5);
}

/**
 * Strouhal number for vortex shedding
 * St = f * D / U ≈ 0.2 for cylinders
 */
export function strouhalFrequency(U, D, St = 0.2) {
  return St * U / D;
}

/**
 * Aeolian tone frequency (vortex shedding noise)
 */
export function aeolianTone(U, D) {
  return strouhalFrequency(U, D, 0.2);
}

/**
 * Sound intensity from dipole source (Curle's extension)
 * I ∝ ρ * U^6 * D² / (c^3 * r²)
 */
export function curleDipoleIntensity(U, D, r, rho = CONSTANTS.rho, c = CONSTANTS.c) {
  const K = 1e-3;
  return K * rho * Math.pow(U, 6) * D * D / (Math.pow(c, 3) * r * r);
}

/**
 * Generate aero-acoustic interaction field
 */
export function aeroAcousticField(U, D, gridSize = 50) {
  const R = D / 2;
  const xMin = -4 * R, xMax = 8 * R;
  const yMin = -4 * R, yMax = 4 * R;
  
  const acousticField = [];
  const xCoords = [], yCoords = [];
  
  for (let i = 0; i < gridSize; i++) {
    const row = [];
    const xi = xMin + (xMax - xMin) * i / (gridSize - 1);
    xCoords.push(xi);
    
    for (let j = 0; j < gridSize; j++) {
      const yj = yMin + (yMax - yMin) * j / (gridSize - 1);
      if (i === 0) yCoords.push(yj);
      
      const r = Math.sqrt(xi ** 2 + yj ** 2);
      const theta = Math.atan2(yj, xi);
      
      if (r < R) {
        row.push(0);
      } else {
        // Dipole radiation pattern: cos²(θ) / r
        const dipole = Math.cos(theta) ** 2 / Math.max(r / R, 1);
        // Wake turbulence contribution (downstream)
        const wake = xi > R ? Math.exp(-Math.abs(yj) / (0.5 * D)) * Math.exp(-(xi - R) / (3 * D)) : 0;
        row.push(dipole + 2 * wake);
      }
    }
    acousticField.push(row);
  }
  
  return { acousticField, xCoords, yCoords };
}

// ============================================================
// ADAPTIVE DESIGN OPTIMIZATION
// ============================================================

/**
 * Evaluate acoustic performance of a geometry
 */
export function evaluateGeometry(params) {
  const { width, height, depth, cornerRadius = 0, material = 'steel' } = params;
  
  const materialProps = {
    steel: { absorption: 0.02, density: 7800 },
    aluminum: { absorption: 0.03, density: 2700 },
    wood: { absorption: 0.15, density: 600 },
    foam: { absorption: 0.85, density: 30 },
    concrete: { absorption: 0.05, density: 2400 },
  };
  
  const mat = materialProps[material] || materialProps.steel;
  const modes = helmholtzModes(width, height, depth, 3);
  
  // Sabine reverberation time: T60 = 0.161 * V / A
  const V = width * height * depth;
  const S = 2 * (width * height + width * depth + height * depth);
  const A = S * mat.absorption;
  const T60 = 0.161 * V / A;
  
  // Corner radius reduces high-frequency diffraction
  const diffractionLoss = cornerRadius > 0 ? 1 - Math.exp(-cornerRadius * 10) : 0;
  
  return {
    modes: modes.slice(0, 20),
    T60,
    volume: V,
    surfaceArea: S,
    absorption: mat.absorption,
    diffractionLoss,
    score: (1 / T60) * (1 + diffractionLoss) * 100,
  };
}

/**
 * Simple evolutionary optimizer for geometry
 */
export function optimizeGeometry(targetFreq, objective = 'minimize_resonance', iterations = 50) {
  let best = { width: 2, height: 1.5, depth: 1, cornerRadius: 0.1 };
  let bestScore = Infinity;
  
  const history = [];
  
  for (let i = 0; i < iterations; i++) {
    const candidate = {
      width: best.width + (Math.random() - 0.5) * 0.2,
      height: best.height + (Math.random() - 0.5) * 0.2,
      depth: best.depth + (Math.random() - 0.5) * 0.2,
      cornerRadius: Math.max(0, best.cornerRadius + (Math.random() - 0.5) * 0.05),
    };
    
    // Ensure positive dimensions
    candidate.width = Math.max(0.3, candidate.width);
    candidate.height = Math.max(0.3, candidate.height);
    candidate.depth = Math.max(0.3, candidate.depth);
    
    const eval_ = evaluateGeometry({ ...candidate, material: 'steel' });
    const modes = eval_.modes;
    
    let score;
    if (objective === 'minimize_resonance') {
      // Minimize modes near target frequency
      const nearModes = modes.filter(m => Math.abs(m.frequency - targetFreq) < 50);
      score = nearModes.length * 100 + eval_.T60 * 10;
    } else {
      // Maximize resonance at target
      const nearModes = modes.filter(m => Math.abs(m.frequency - targetFreq) < 20);
      score = -nearModes.length * 100 + eval_.T60;
    }
    
    if (score < bestScore) {
      bestScore = score;
      best = { ...candidate };
    }
    
    history.push({ iteration: i, score: bestScore, ...best });
  }
  
  return { optimized: best, score: bestScore, history, evaluation: evaluateGeometry({ ...best, material: 'steel' }) };
}

// ============================================================
// QUANTUM RESONANCE MODULE
// ============================================================

/**
 * Quantum tunneling transmission coefficient (rectangular barrier)
 * T = 1 / (1 + (V0²sinh²(κL)) / (4E(V0-E)))
 * where κ = sqrt(2m(V0-E)) / ℏ
 */
export function quantumTunneling(E_values, V0, L, m = 9.109e-31) {
  return E_values.map(E => {
    if (E >= V0) {
      // Classical transmission
      return 1;
    }
    const kappa = Math.sqrt(2 * m * (V0 - E) * 1.602e-19) / CONSTANTS.hbar;
    const kappaL = kappa * L;
    if (kappaL > 50) return 0; // Numerical stability
    const sinh = (Math.exp(kappaL) - Math.exp(-kappaL)) / 2;
    const T = 1 / (1 + (V0 * V0 * sinh * sinh) / (4 * E * (V0 - E)));
    return T;
  });
}

/**
 * Phonon dispersion relation (1D monatomic chain)
 * ω(k) = 2*sqrt(C/m) * |sin(ka/2)|
 */
export function phononDispersion(C = 10, m = 1e-26, a = 3e-10, nPoints = 200) {
  const kMax = Math.PI / a;
  const k = [];
  const omega = [];
  const omegaMax = 2 * Math.sqrt(C / m);
  
  for (let i = 0; i < nPoints; i++) {
    const ki = -kMax + 2 * kMax * i / (nPoints - 1);
    k.push(ki * a / Math.PI); // Normalized
    omega.push(omegaMax * Math.abs(Math.sin(ki * a / 2)));
  }
  return { k, omega, omegaMax };
}

/**
 * Phonon dispersion for diatomic chain (optical + acoustic branches)
 * Two branches: ω±² = C(1/m1 + 1/m2) ± C*sqrt((1/m1 + 1/m2)² - 4sin²(ka/2)/(m1*m2))
 */
export function diatomicPhononDispersion(C = 10, m1 = 1e-26, m2 = 2e-26, a = 3e-10, nPoints = 200) {
  const kMax = Math.PI / a;
  const k = [], acoustic = [], optical = [];
  
  const sum = 1 / m1 + 1 / m2;
  
  for (let i = 0; i < nPoints; i++) {
    const ki = -kMax + 2 * kMax * i / (nPoints - 1);
    k.push(ki * a / Math.PI);
    
    const sin2 = Math.sin(ki * a / 2) ** 2;
    const discriminant = sum * sum - 4 * sin2 / (m1 * m2);
    
    const omegaPlus = Math.sqrt(C * (sum + Math.sqrt(Math.max(0, discriminant))));
    const omegaMinus = Math.sqrt(C * (sum - Math.sqrt(Math.max(0, discriminant))));
    
    acoustic.push(omegaMinus);
    optical.push(omegaPlus);
  }
  
  return { k, acoustic, optical };
}

/**
 * Quantum coherence function
 * g(τ) = exp(-|τ|/τc) * cos(ω0*τ)
 */
export function quantumCoherence(omega0, tauC, nPoints = 500) {
  const tMax = 5 * tauC;
  const tau = [], g1 = [], g2 = [];
  
  for (let i = 0; i < nPoints; i++) {
    const t = -tMax + 2 * tMax * i / (nPoints - 1);
    tau.push(t * 1e12); // Convert to ps for display
    g1.push(Math.exp(-Math.abs(t) / tauC) * Math.cos(omega0 * t));
    g2.push(Math.exp(-2 * Math.abs(t) / tauC)); // Second-order coherence
  }
  
  return { tau, g1, g2 };
}

/**
 * Schrödinger resonance: energy levels in a quantum well
 * E_n = n²π²ℏ² / (2mL²)
 */
export function quantumWellLevels(L, m = 9.109e-31, nMax = 10) {
  const levels = [];
  for (let n = 1; n <= nMax; n++) {
    const E = (n * n * Math.PI * Math.PI * CONSTANTS.hbar * CONSTANTS.hbar) / (2 * m * L * L);
    levels.push({ n, energy_J: E, energy_eV: E / 1.602e-19 });
  }
  return levels;
}

/**
 * Wavefunction in a quantum well
 * ψ_n(x) = sqrt(2/L) * sin(nπx/L)
 */
export function quantumWellWavefunction(n, L, nPoints = 200) {
  const x = [], psi = [], prob = [];
  const norm = Math.sqrt(2 / L);
  
  for (let i = 0; i < nPoints; i++) {
    const xi = L * i / (nPoints - 1);
    x.push(xi * 1e9); // nm
    const val = norm * Math.sin(n * Math.PI * xi / L);
    psi.push(val);
    prob.push(val * val);
  }
  
  return { x, psi, prob };
}
