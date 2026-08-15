---
name: collection-domain
description: 'Change Pokemon collection rules, add/remove quantities, conditions, languages, editions, localStorage, JSON import/export, Zod validation, schema versions, or migrations. Use when editing src/domain/collection.ts, src/storage/collectionStorage.ts, useCollection, or collection persistence behavior.'
argument-hint: 'Describe the collection or persistence change'
---

# Collection Domain And Persistence

## Ownership

- `src/domain/collection.ts`: pure immutable mutations and selectors. It must not access React, DOM APIs, storage, or files.
- `src/storage/collectionStorage.ts`: Zod schemas, serialization, schema versions, legacy migration, and the storage adapter.
- `src/hooks/useCollection.js`: React coordination and browser import/export only. Keep domain decisions out of the hook.
- Feature/components consume the collection facade and selectors; they must not mutate collection objects directly.

## Invariants

- `conditions` is the source of truth for quantities. Derive totals with `getItemCount` or `getUnitCount`.
- Do not add persisted `count` back to current items. It is accepted only as legacy migration input.
- Every mutation returns a new collection without mutating previous state.
- Persist the envelope `{ schemaVersion, collection }`.
- Imports must be validated before replacing current state. Unsupported future versions and malformed items must fail without data loss.
- Existing unversioned exports must remain migratable unless an explicit breaking migration is requested.

## Change Workflow

1. State the domain invariant being changed.
2. Implement the rule as a pure function or selector first.
3. Add focused tests in `src/domain/collection.test.js`.
4. If the stored shape changes, increment the schema version and add an explicit migration plus tests in `src/storage/collectionStorage.test.js`.
5. Wire the hook/UI only after pure and storage tests pass.

## Validation

```bash
npx vitest run src/domain/collection.test.js src/storage/collectionStorage.test.js src/hooks/useCollection.test.jsx
npm run check
```

For import/export or persistence workflows, also run:

```bash
npm run test:e2e -- --reporter=line
```
