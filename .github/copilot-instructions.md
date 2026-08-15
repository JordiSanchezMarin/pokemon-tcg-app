# Pokemon TCG App

- Preserve the current dependency direction: route pages in `src/features`, reusable UI in `src/components`, remote access in `src/api` plus query hooks, pure rules in `src/domain`, and persistence in `src/storage`.
- Do not reintroduce route-level state in `App.jsx`. Search filters belong in URL query parameters and selected collection sets belong in route parameters.
- Treat collection conditions as the source of truth. Derive total card counts; never persist a second mutable `count` value.
- Keep price datasets lazy-loaded and indexed. Never use prices or Cardmarket URLs from a different set when a set has no dataset.
- After code changes, run the narrowest relevant test first. Before completion run `npm run check`; run `npm run test:e2e -- --reporter=line` for user-flow changes.
- Load the relevant project skill for pricing data, collection persistence, or feature/refactor work before editing those areas.
