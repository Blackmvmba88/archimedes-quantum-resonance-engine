"""
Physical constants in SI units for quantum resonance simulations.

This module provides fundamental physical constants used throughout
the Archimedes Quantum Resonance Engine.
"""

import numpy as np

# Fundamental Constants (CODATA 2018)
PLANCK = 6.62607015e-34  # J·s - Planck constant
HBAR = PLANCK / (2 * np.pi)  # J·s - Reduced Planck constant
SPEED_OF_LIGHT = 299792458  # m/s - Speed of light in vacuum
ELEMENTARY_CHARGE = 1.602176634e-19  # C - Elementary charge
ELECTRON_MASS = 9.1093837015e-31  # kg - Electron mass
BOLTZMANN = 1.380649e-23  # J/K - Boltzmann constant
AVOGADRO = 6.02214076e23  # mol^-1 - Avogadro constant

# Derived Constants
FINE_STRUCTURE = 7.2973525693e-3  # Dimensionless - Fine structure constant
BOHR_RADIUS = 5.29177210903e-11  # m - Bohr radius
RYDBERG_ENERGY = 13.605693122994  # eV - Rydberg energy

# Unit Conversions
EV_TO_JOULE = ELEMENTARY_CHARGE  # 1 eV in Joules
NM_TO_METER = 1e-9  # 1 nanometer in meters
THZ_TO_HZ = 1e12  # 1 THz in Hz
CM_INV_TO_HZ = SPEED_OF_LIGHT * 100  # 1 cm^-1 in Hz

# Spectroscopy Units
def wavelength_to_frequency(wavelength_nm):
    """
    Convert wavelength (nm) to frequency (Hz).
    
    Parameters
    ----------
    wavelength_nm : float or array_like
        Wavelength in nanometers (must be positive)
        
    Returns
    -------
    frequency_hz : float or array
        Frequency in Hz
        
    Notes
    -----
    Uses: f = c / λ where c is speed of light
    Valid for wavelengths > 0 nm
    """
    wavelength_nm = np.asarray(wavelength_nm)
    if np.any(wavelength_nm <= 0):
        raise ValueError("Wavelength must be positive")
    return SPEED_OF_LIGHT / (wavelength_nm * NM_TO_METER)

def frequency_to_energy(frequency_hz):
    """Convert frequency (Hz) to energy (J)."""
    return PLANCK * frequency_hz

def wavelength_to_energy_ev(wavelength_nm):
    """Convert wavelength (nm) to energy (eV)."""
    freq = wavelength_to_frequency(wavelength_nm)
    energy_j = frequency_to_energy(freq)
    return energy_j / EV_TO_JOULE

# Example: UV spectroscopy range
UV_RANGE = {
    'name': 'Ultraviolet',
    'wavelength_min_nm': 100,
    'wavelength_max_nm': 400,
    'frequency_min_hz': wavelength_to_frequency(400),
    'frequency_max_hz': wavelength_to_frequency(100),
}

# Pyridine UV absorption reference (experimental literature)
PYRIDINE_UV = {
    'peak_wavelength_nm': 260,  # nm - Main absorption peak
    'peak_frequency_hz': wavelength_to_frequency(260),
    'peak_energy_ev': wavelength_to_energy_ev(260),
    'molar_absorptivity': 2500,  # L/(mol·cm) - Approximate
}
