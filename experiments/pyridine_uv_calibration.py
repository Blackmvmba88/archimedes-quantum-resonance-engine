"""
Flagship Experiment: Pyridine UV Absorption Calibration

This experiment demonstrates the Archimedes Quantum Resonance Engine
by simulating the UV absorption spectrum of pyridine at 260 nm.

Expected runtime: < 5 seconds
Output: Absorption spectrum plot and resonance parameters
"""

import numpy as np
import matplotlib.pyplot as plt
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core import constants as const
from core.quantum_matter import fit_lorentz_to_peak


def run_calibration_experiment():
    """
    Run the flagship experiment: Pyridine UV absorption at 260 nm.
    
    This demonstrates:
    1. Physical constant usage
    2. Lorentz resonator model
    3. Spectroscopic predictions
    4. Clear, reproducible results
    """
    
    print("=" * 70)
    print("🔬 ARCHIMEDES QUANTUM RESONANCE ENGINE")
    print("=" * 70)
    print("\n📊 Flagship Experiment: Pyridine UV Absorption Calibration")
    print("   Target: λ = 260 nm (UV spectroscopy)\n")
    
    # ========== EXPERIMENT PARAMETERS ==========
    peak_wavelength = 260  # nm - Literature value for pyridine
    bandwidth = 50  # nm - Approximate absorption width
    
    print("🎯 Input Parameters:")
    print(f"   Peak wavelength: {peak_wavelength} nm")
    print(f"   Estimated bandwidth: {bandwidth} nm")
    print(f"   Photon energy: {const.wavelength_to_energy_ev(peak_wavelength):.2f} eV")
    print()
    
    # ========== MODEL CONSTRUCTION ==========
    print("⚙️  Constructing Lorentz resonator model...")
    resonator = fit_lorentz_to_peak(
        peak_wavelength_nm=peak_wavelength,
        width_nm=bandwidth,
        oscillator_strength=1.0
    )
    
    # ========== PREDICTION ==========
    print("🔮 Computing absorption spectrum...\n")
    
    # Wavelength range for spectrum (200-350 nm covers UV region)
    wavelengths = np.linspace(200, 350, 500)
    absorption = resonator.absorption_spectrum(wavelengths)
    
    # ========== RESULTS ==========
    print("-" * 70)
    print("📈 RESULTS:")
    print("-" * 70)
    
    # Find actual peak in computed spectrum
    peak_idx = np.argmax(absorption)
    computed_peak = wavelengths[peak_idx]
    
    print(f"   Resonance frequency ω₀: {resonator.omega_0/(2*np.pi):.3e} Hz")
    print(f"   Quality factor Q: {resonator.quality_factor():.1f}")
    print(f"   FWHM: {resonator.fwhm()/1e12:.2f} THz")
    print(f"   Computed peak wavelength: {computed_peak:.1f} nm")
    print(f"   Target peak wavelength: {peak_wavelength} nm")
    print(f"   Peak deviation: {abs(computed_peak - peak_wavelength):.2f} nm")
    print()
    
    # ========== VALIDATION ==========
    peak_error = abs(computed_peak - peak_wavelength)
    if peak_error < 1.0:  # Within 1 nm
        print("✅ VALIDATION: Peak position matches target (< 1 nm error)")
        status = "SUCCESS"
    else:
        print("⚠️  VALIDATION: Peak deviation exceeds 1 nm threshold")
        status = "NEEDS_TUNING"
    
    print()
    print("-" * 70)
    print(f"🎯 Experiment Status: {status}")
    print("-" * 70)
    
    # ========== VISUALIZATION ==========
    print("\n📊 Generating visualization...")
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Plot absorption spectrum
    ax.plot(wavelengths, absorption, 'b-', linewidth=2, label='Lorentz Model')
    ax.axvline(peak_wavelength, color='r', linestyle='--', 
               linewidth=1.5, label=f'Target: {peak_wavelength} nm')
    ax.axvline(computed_peak, color='g', linestyle=':', 
               linewidth=1.5, label=f'Computed: {computed_peak:.1f} nm')
    
    # Styling
    ax.set_xlabel('Wavelength (nm)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Normalized Absorption', fontsize=12, fontweight='bold')
    ax.set_title('Pyridine UV Absorption Spectrum\n(Lorentz Resonator Model)', 
                 fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    ax.legend(fontsize=10)
    ax.set_xlim(200, 350)
    ax.set_ylim(0, 1.1)
    
    # Add annotation
    ax.annotate(f'Q = {resonator.quality_factor():.1f}',
                xy=(computed_peak, 1.0), xytext=(computed_peak + 20, 0.9),
                fontsize=10, 
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5),
                arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))
    
    plt.tight_layout()
    
    # Save figure
    output_path = os.path.join(os.path.dirname(__file__), 'pyridine_spectrum.png')
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"   Saved: {output_path}")
    
    # Display plot
    print("\n✨ Experiment complete! Close the plot window to exit.\n")
    plt.show()
    
    return {
        'status': status,
        'peak_wavelength_nm': computed_peak,
        'quality_factor': resonator.quality_factor(),
        'peak_error_nm': peak_error
    }


if __name__ == "__main__":
    print("\n🚀 Starting flagship experiment...\n")
    results = run_calibration_experiment()
    print("=" * 70)
    print("🏁 Experiment completed successfully!")
    print("=" * 70)
