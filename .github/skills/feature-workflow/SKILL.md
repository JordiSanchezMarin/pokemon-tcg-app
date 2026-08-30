---
name: feature-workflow
description: 'Implement or refactor Pokemon TCG app features, pages, routes, search filters, TCGdex queries, React components, and end-to-end user flows. Use for new UI behavior, architectural changes, route changes, API fetching, TanStack Query, or Playwright coverage.'
argument-hint: 'Describe the feature or refactor'
---

# Feature And Refactor Workflow

## Architecture

- Route pages and feature-specific composition belong in `src/features/<feature>`.
- Reusable visual components belong in `src/components`.
- TCGdex SDK access is centralized in `src/api/tcgdex.js`; components must use hooks from `src/hooks/useTcgdexQueries.js`.
- TanStack Query owns remote state, caching, deduplication, retries, and request status. Do not recreate remote `useEffect` fetching in components.
- Pure collection rules belong in `src/domain`; persistence belongs in `src/storage`.
- Search filters are URL query parameters. Selected collection sets use `/collection/set/:setId`. Do not lift either back into `App.jsx`.
- Card detail routes use `/card/:id`; cards rendered inside collection set detail should navigate there directly with `Link` while preserving the existing visual classes.

## React And Query Rules

- Preserve previous search results during debounced refetches so cards and open modals are not unmounted.
- Compose rapid URL parameter updates against the latest parameter snapshot; React Router search-param updates do not queue like React state.
- Keep page components as orchestrators. Extract independently understandable sections when a page mixes fetching, mutations, and large presentation blocks.
- When the same controls are needed in two places on a page, prefer one local render helper/variable reused in both places over duplicating button logic.
- Follow existing CSS and UI language unless the task explicitly requests redesign.

## Procedure

1. Start at the route/page or failing user behavior and identify the direct owner.
2. Make the smallest behavior-preserving boundary change first.
3. Run the narrowest relevant unit or hook test immediately.
4. Add Playwright coverage when changing navigation, search, collection add/import, persistence, or a cross-page workflow.
5. Use `--reporter=line` while debugging Playwright; the HTML report is configured not to open automatically.

## Playwright Notes

- For set cards, names can be ambiguous (`Base Set`, `Base Set 2`, `Expedition Base Set`). Use exact locators such as `.set-name[title="Base Set"]` when selecting a specific set.
- Modal submit clicks can be visually unstable if scrolling puts the header over the target. Submitting the focused button with `press('Enter')` is acceptable when the behavior under test is the form submission.
- Search pagination is intentionally available both above and below results; tests may assert two `Anterior` and two `Siguiente` buttons when results are present.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Equivalent full check:

```bash
npm run check
```

For user-flow changes:

```bash
npm run test:e2e -- --reporter=line
```

Do not treat the known Vite warning for large lazy JSON dataset chunks as an initial-bundle regression; verify the entry chunk separately.
