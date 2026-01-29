# 🤝 Contributing to Archimedes Quantum Resonance Engine

Thank you for your interest in contributing to this scientific simulation project! This guide will help you get started.

---

## 🎯 Philosophy

This is a **living repository** focused on:
- **Executable experiments** - Working demos over abstract frameworks
- **Documented decisions** - Clear rationale for design choices
- **Sustained rhythm** - Regular validation and continuous improvement
- **Scientific rigor** - Physics-based validation and reproducibility

---

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/archimedes-quantum-resonance-engine.git
   cd archimedes-quantum-resonance-engine
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the flagship experiment:**
   ```bash
   python experiments/pyridine_uv_calibration.py
   ```

5. **Verify it works** - you should see a spectrum plot and metrics

---

## 🔬 Ways to Contribute

### 1. Add New Experiments

New experiments are highly valued! Each experiment should:
- Run in **< 30 seconds** (ideal) or **< 5 minutes** (acceptable)
- Produce **clear output** (plots, metrics, validation)
- Be **self-contained** (imports from `core/` only)
- Include **validation** (compare to theory/experimental data)
- Follow the template in `experiments/README.md`

**Example contributions:**
- Multi-peak absorption spectra
- Temperature-dependent resonance
- Time-domain pulse response
- Quantum two-level system demo

### 2. Improve Core Models

Enhancements to `core/` modules:
- Extend Lorentz model accuracy
- Add quantum two-level systems (TLS)
- Implement optimal control algorithms
- Improve numerical stability

**Important:** Core changes must maintain backward compatibility with existing experiments.

### 3. Add Tests

We need tests for:
- Physical constants accuracy
- Lorentz model calculations
- Experiment output validation
- Edge cases and error handling

Place tests in `tests/` directory using pytest.

### 4. Documentation

Help improve:
- Code comments and docstrings
- Physics explanations in README
- Tutorial notebooks
- API reference documentation

### 5. Propose Architectural Decisions

For significant design choices:
1. Open an issue with title: `[DECISION] Brief description`
2. Include context, options, recommendation, trade-offs
3. Discuss in issue comments
4. If accepted, add to `DECISIONS.md`

---

## 📋 Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Keep changes focused and minimal
   - Follow existing code style
   - Add comments where helpful (but not excessive)

3. **Test your changes:**
   ```bash
   # Run affected experiments
   python experiments/pyridine_uv_calibration.py
   
   # Run tests (if they exist)
   pytest tests/
   ```

4. **Commit with clear messages:**
   ```bash
   git commit -m "Add benzene absorption experiment"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub

6. **PR requirements:**
   - Clear description of what and why
   - Reference any related issues
   - Demonstrate that experiments still run
   - Include example output if adding new experiments

---

## 🎨 Code Style

- **Python**: Follow PEP 8 (but line length can be 100 chars)
- **Docstrings**: Use NumPy style
- **Comments**: Explain physics/math, not obvious code
- **Naming**: Clear, descriptive variable names (prefer `resonance_frequency` over `f`)

**Example:**
```python
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
    # Convert wavelength to frequency (ω = 2πc/λ)
    frequencies = const.wavelength_to_frequency(wavelengths_nm)
    omega = 2 * np.pi * frequencies
    
    # ... rest of implementation
```

---

## 🧪 Testing Guidelines

- Tests go in `tests/` directory
- Use pytest framework
- Test physics accuracy, not implementation details
- Include edge cases (zero frequency, negative wavelength, etc.)

**Example test:**
```python
import pytest
from core.quantum_matter import LorentzResonator

def test_resonance_peak_location():
    """Verify resonance peaks at the specified frequency."""
    omega_0 = 1e15  # rad/s
    gamma = 1e14    # rad/s
    resonator = LorentzResonator(omega_0, gamma)
    
    # Peak should be at omega_0
    response = resonator.susceptibility(omega_0)
    assert np.imag(response) > 0.9 * np.max(resonator.susceptibility(np.linspace(0.5*omega_0, 1.5*omega_0, 1000)))
```

---

## 🔬 Scientific Standards

Contributions must maintain scientific rigor:

1. **Physics accuracy**: Cite sources for models and equations
2. **Unit consistency**: Use SI units throughout (defined in `core/constants.py`)
3. **Validation**: Compare results to experimental data or theoretical limits
4. **Reproducibility**: Include random seeds, exact parameters, software versions

---

## 🚫 What We Don't Accept

- Medical applications (safety concerns)
- Military applications (ethical policy)
- Unvalidated quantum claims (must have physics basis)
- Code without experiments demonstrating its use
- Breaking changes without migration path

---

## 📚 Resources

- **Physics Background**: See README.md "Marco Teórico" section
- **API Reference**: See docstrings in `core/` modules
- **Decision Log**: See `DECISIONS.md` for architectural rationale
- **Examples**: Study `experiments/pyridine_uv_calibration.py`

---

## 💬 Questions?

- Open an issue for questions
- Tag with `question` label
- Be specific about what you're trying to accomplish

---

## 🌟 Recognition

Contributors will be:
- Listed in README.md contributors section
- Credited in citation information
- Acknowledged in related publications

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping build the future of quantum matter manipulation! ⚛️**
