# Word Race

English vocabulary racing game for kids (7-11) with basic English. Steer the car into the gate with
the right English word. 6 worlds, 120 words, 3 modes (picture, listen, Hebrew).

- Run: any static server from this folder, e.g. `python -m http.server 8000`, then open http://localhost:8000
- Spec: [SPEC.md](SPEC.md)
- Voice: browser speech for now; pre-generated clips go in `audio/words/` and are listed in `audio/manifest.json`.
- Test hooks: `window.__game` (SPEC section 10).
