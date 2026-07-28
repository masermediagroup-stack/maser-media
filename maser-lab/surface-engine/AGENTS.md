# Maser Surface Engine

Procedural graphics engine for Maser Lab. See `README.md` and `docs/ARCHITECTURE.md`.

- Prefer architecture clarity over speed of shipping
- Do not copy Tripwire / dither-kit implementations
- Keep rendering off the React render path (refs + uniforms)
- Every RAF / observer / GL resource must clean up on dispose
