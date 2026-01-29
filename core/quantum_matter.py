"""
Quantum-matter interaction models for electromagnetic resonance.

This module implements the Lorentz classical resonator model as the
foundation for simulating light-matter interactions.
"""

import numpy as np
from . import constants as const


class LorentzResonator:
    """
    Classical Lorentz oscillator model for optical absorption.
    
    Describes electrons as damped harmonic oscillators responding to
    electromagnetic fields. This is Phase 1 of the Archimedes engine.
    
    Parameters
    ----------
    omega_0 : float
        Resonance frequency (rad/s)
    gamma : float
        Damping coefficient (rad/s)
    oscillator_strength : float
        Oscillator strength (dimensionless, default 1.0)
    """
    
    def __init__(self, omega_0, gamma, oscillator_strength=1.0):
        self.omega_0 = omega_0  # Resonance frequency
        self.gamma = gamma  # Damping
        self.f = oscillator_strength  # Oscillator strength
        
    def susceptibility(self, omega):
        """
        Complex electric susceptibility at frequency omega.
        
        Parameters
        ----------
        omega : array_like
            Angular frequency (rad/s)
            
        Returns
        -------
        chi : complex array
            Complex susceptibility
        """
        omega = np.asarray(omega)
        denominator = self.omega_0**2 - omega**2 - 1j * self.gamma * omega
        return self.f * const.ELEMENTARY_CHARGE**2 / (const.ELECTRON_MASS * denominator)
    
    def absorption_cross_section(self, omega):
        """
        Absorption cross section (arbitrary units).
        
        Parameters
        ----------
        omega : array_like
            Angular frequency (rad/s)
            
        Returns
        -------
        sigma : array
            Absorption cross section (proportional to imaginary part of susceptibility)
        """
        chi = self.susceptibility(omega)
        return np.imag(chi)
    
    def absorption_spectrum(self, wavelengths_nm):
        """
        Calculate absorption spectrum vs wavelength.
        
        Parameters
        ----------
        wavelengths_nm : array_like
            Wavelengths in nanometers
            
        Returns
        -------
        absorption : array
            Normalized absorption (0 to 1)
        """
        wavelengths_nm = np.asarray(wavelengths_nm)
        frequencies = const.wavelength_to_frequency(wavelengths_nm)
        omega = 2 * np.pi * frequencies
        
        cross_section = self.absorption_cross_section(omega)
        # Normalize to peak = 1
        return cross_section / np.max(cross_section)
    
    def fwhm(self):
        """
        Full width at half maximum (FWHM) of the resonance.
        
        Returns
        -------
        fwhm_hz : float
            FWHM in Hz
        """
        return self.gamma / (2 * np.pi)
    
    def quality_factor(self):
        """
        Quality factor Q of the resonator.
        
        Returns
        -------
        Q : float
            Quality factor (dimensionless)
        """
        return self.omega_0 / self.gamma


def fit_lorentz_to_peak(peak_wavelength_nm, width_nm, oscillator_strength=1.0):
    """
    Create a Lorentz resonator from spectroscopic parameters.
    
    Parameters
    ----------
    peak_wavelength_nm : float
        Peak absorption wavelength (nm)
    width_nm : float
        Approximate width of absorption band (nm)
    oscillator_strength : float
        Oscillator strength (default 1.0)
        
    Returns
    -------
    resonator : LorentzResonator
        Configured resonator model
    """
    # Convert wavelength to frequency
    peak_freq = const.wavelength_to_frequency(peak_wavelength_nm)
    omega_0 = 2 * np.pi * peak_freq
    
    # Estimate damping from width
    # For Lorentzian: FWHM ≈ gamma / (2π)
    # Width in wavelength needs conversion to frequency width
    freq_width = const.SPEED_OF_LIGHT * width_nm / (peak_wavelength_nm**2) * 1e9
    gamma = 2 * np.pi * freq_width
    
    return LorentzResonator(omega_0, gamma, oscillator_strength)


def multi_resonator_absorption(wavelengths_nm, resonators):
    """
    Calculate combined absorption from multiple resonators.
    
    Parameters
    ----------
    wavelengths_nm : array_like
        Wavelengths in nanometers
    resonators : list of LorentzResonator
        List of resonator models
        
    Returns
    -------
    total_absorption : array
        Combined normalized absorption spectrum
    """
    wavelengths_nm = np.asarray(wavelengths_nm)
    total = np.zeros_like(wavelengths_nm, dtype=float)
    
    for resonator in resonators:
        total += resonator.absorption_spectrum(wavelengths_nm)
    
    # Normalize total spectrum
    if np.max(total) > 0:
        total = total / np.max(total)
    
    return total
