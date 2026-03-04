// ============================================================
// Archimedes Quantum Laboratory — Physical Constants (SI)
// All computations are performed in SI units.
// ============================================================

export const CONSTANTS = {
  // Fundamental constants
  hbar: 1.054571817e-34,   // Reduced Planck constant (J·s)
  h:    6.62607015e-34,    // Planck constant (J·s)
  c:    2.99792458e8,      // Speed of light in vacuum (m/s)
  e:    1.602176634e-19,   // Elementary charge (C)
  me:   9.1093837015e-31,  // Electron rest mass (kg)
  kB:   1.380649e-23,      // Boltzmann constant (J/K)
  eps0: 8.8541878128e-12,  // Vacuum permittivity (F/m)
  mu0:  1.25663706212e-6,  // Vacuum permeability (H/m)

  // Acoustic / Fluid (standard conditions, 20°C, sea level)
  c_sound: 343,            // Speed of sound in air (m/s)
  rho_air: 1.225,          // Air density (kg/m³)
  mu_air:  1.81e-5,        // Dynamic viscosity of air (Pa·s)
  gamma:   1.4,            // Adiabatic index for air
  P0:      101325,         // Standard atmospheric pressure (Pa)
  T0:      293.15,         // Standard temperature (K)
  pRef:    2e-5,           // Reference sound pressure (Pa)

  // Conversion factors
  eV_to_J: 1.602176634e-19, // 1 eV in Joules
  nm_to_m: 1e-9,            // 1 nm in meters
};

export default CONSTANTS;
