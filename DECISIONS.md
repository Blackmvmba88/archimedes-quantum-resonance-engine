# 🎯 Architectural Decisions

This document records key design decisions made during development of the Archimedes Quantum Resonance Engine. Understanding these choices helps contributors align with the project's direction.

---

## Decision 1: Start with Lorentz Classical Model (Not Full Quantum)

**Date**: 2026-01-29  
**Status**: ✅ Implemented  
**Context**: Need to choose between starting with full quantum mechanical Hamiltonian vs. classical oscillator model.

### Decision
We start with the **classical Lorentz oscillator model** as Phase 1, before implementing quantum Two-Level Systems (TLS) or full quantum control.

### Rationale

**Why Lorentz First:**
1. **Proven Accuracy**: The Lorentz model accurately describes UV/visible absorption in most organic molecules (within 5-10% of experimental data)
2. **Computational Speed**: Analytical solution runs in milliseconds, enabling rapid iteration and parameter exploration
3. **Physical Intuition**: Electrons as damped harmonic oscillators is intuitive and teachable
4. **Direct Validation**: Can be immediately compared with experimental spectroscopy databases
5. **Natural Progression**: Serves as the classical limit of quantum models (correspondence principle)

**Why NOT Full Quantum First:**
1. Would require numerical ODE solvers (slower, more complex)
2. Harder to validate without experimental quantum coherence data
3. Overkill for UV/visible spectroscopy (where Lorentz is sufficient)
4. Steeper learning curve for contributors

### Implementation Path
```
Phase 1 (Current): Lorentz Oscillator
    ↓ (when spectroscopy validation complete)
Phase 2: Quantum Two-Level System (TLS)
    ↓ (when coherence effects needed)
Phase 3: Full Quantum Control (GRAPE/CRAB)
```

### Consequences
- **Positive**: Fast results, easy validation, clear physics
- **Negative**: Cannot model quantum coherence or entanglement yet
- **Mitigation**: Architecture designed to extend to TLS without breaking existing code

### References
- Jackson, J.D. "Classical Electrodynamics" (Lorentz model derivation)
- Experimental pyridine UV spectrum: λ_peak = 260 nm

---

## Decision 2: Single Core Repository (Not Monorepo)

**Date**: 2026-01-29  
**Status**: ✅ Active  
**Context**: Should we split simulation core, hardware control, and cognitive AI into separate repositories?

### Decision
Keep **one core scientific/technical repository** (this one) for simulation. Hardware and AI components will be satellite repos when needed.

### Rationale
**Why Single Repo:**
1. **Focus**: Simulation is the primary value - everything else supports it
2. **Iteration Speed**: Faster to develop when core + experiments are together
3. **Clear Scope**: Reduces decision paralysis about "where does this go?"
4. **Easier Onboarding**: New contributors have one place to look

**When to Split:**
- Hardware control → separate repo when physical prototypes exist
- Cognitive AI → separate repo if it becomes general-purpose (not simulation-specific)
- Documentation → stays here (docs/ folder)

### Consequences
- **Positive**: Fast iteration, clear focus, less cognitive overhead
- **Negative**: Future refactor cost if we need to split
- **Mitigation**: Keep clean module boundaries (core/, experiments/, docs/)

---

## Decision 3: Executable Experiments Over Abstract Frameworks

**Date**: 2026-01-29  
**Status**: ✅ Implemented  
**Context**: Should we build a generic simulation framework first, or concrete runnable experiments?

### Decision
Prioritize **runnable experiments that produce results** over abstract frameworks.

### Rationale
**Why Experiments First:**
1. **Validation**: Can't validate a framework without examples
2. **User Value**: Users want to see "what can this do?" immediately
3. **Design Feedback**: Experiments reveal what abstractions are actually needed
4. **Motivation**: Working demos are motivating; abstract code is not

**Why NOT Framework First:**
1. Risk of over-engineering for hypothetical use cases
2. Harder to test without concrete examples
3. Slower time-to-value

### Implementation
- ✅ `experiments/pyridine_uv_calibration.py` runs in < 5 seconds
- ✅ Produces clear output (spectrum plot + metrics)
- ✅ Uses `core/` modules naturally
- Future: Extract common patterns into `core/` as experiments accumulate

### Consequences
- **Positive**: Immediate value, easy onboarding, clear goals
- **Negative**: Some code duplication across experiments (acceptable trade-off)
- **Mitigation**: Refactor to core/ when patterns emerge 3+ times

---

## Future Decisions (Pending)

### Data Format for Experimental Comparison
- **Question**: JSON? CSV? HDF5?
- **Status**: Pending (need more experiments first)
- **Factors**: Size, tooling, human-readability

### Testing Strategy
- **Question**: Unit tests? Integration tests? Property-based tests?
- **Status**: Pending (need stable API first)
- **Factors**: Coverage, speed, maintenance burden

### Hardware Interface Protocol
- **Question**: REST API? gRPC? MQTT?
- **Status**: Pending (no hardware yet)
- **Factors**: Latency, reliability, ecosystem

---

## How to Propose a Decision

1. **Open an Issue** with title: `[DECISION] Brief description`
2. **Include**:
   - Context: What problem are we solving?
   - Options: What are the alternatives?
   - Recommendation: What do you suggest and why?
   - Trade-offs: What do we gain/lose?
3. **Discussion**: Team discusses in issue comments
4. **Resolution**: Merge decision into this document once agreed

---

**Last Updated**: 2026-01-29  
**Maintainer**: @Blackmvmba88
