# 🧪 Experiments Directory

This directory contains **executable scientific experiments** that demonstrate the Archimedes Quantum Resonance Engine capabilities.

## 🎯 Flagship Experiment

### `pyridine_uv_calibration.py`

**Purpose**: Validate the Lorentz resonator model against known UV absorption of pyridine at 260 nm.

**What it does**:
- Constructs a Lorentz oscillator model from spectroscopic parameters
- Computes the UV absorption spectrum (200-350 nm range)
- Validates peak position against literature values
- Generates publication-quality visualization

**Expected Results**:
- Resonance frequency: ~1.15 PHz (260 nm)
- Quality factor Q: ~5.2
- Peak deviation: < 2 nm from target
- Runtime: < 5 seconds

**Run it**:
```bash
python experiments/pyridine_uv_calibration.py
```

**Output**: 
- Console: Detailed results and validation metrics
- File: `pyridine_spectrum.png` (absorption spectrum plot)

---

## 🔬 Future Experiments

- [ ] Multi-peak absorption (benzene derivatives)
- [ ] Temperature-dependent resonance shifts
- [ ] Time-dependent pulse response
- [ ] Quantum Two-Level System (TLS) demo
- [ ] Optimal control pulse design

---

## 📝 Adding New Experiments

Each experiment should:
1. **Run in < 30 seconds** (ideal) or < 5 minutes (acceptable)
2. **Produce clear output** (plot + metrics)
3. **Be self-contained** (all imports from core module)
4. **Include validation** (compare to theory or experimental data)
5. **Save results** (PNG, CSV, or JSON)

Template structure:
```python
"""
Experiment Title: Brief Description

Expected runtime: X seconds
Output: Description of output
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core import constants, quantum_matter

def run_experiment():
    # 1. Setup
    # 2. Computation
    # 3. Results
    # 4. Visualization
    # 5. Validation
    pass

if __name__ == "__main__":
    run_experiment()
```

---

**🔥 Remember**: The goal is to make physics **runnable, visible, and reproducible**.
