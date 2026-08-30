---
name: pokemon-pricing-data
description: 'Maintain Pokemon card prices, Cardmarket URLs, set-to-dataset mappings, JSON BDD files, languages, editions, conditions, lazy imports, and price indexes. Use when adding a set price database, debugging wrong or missing prices, changing src/utils/price.js, or working with src/bdd/*.json.'
argument-hint: 'Describe the set, dataset, or pricing issue'
---

# Pokemon Pricing Data

## Invariants

- A card may use prices and a Cardmarket URL only from the dataset explicitly mapped to its own TCGdex set ID.
- Missing dataset or missing card means no price and no URL. Never fall back to a similarly named set.
- Keep every JSON database behind a static `import()` loader so Vite creates lazy chunks.
- Build indexes once when a dataset loads; use `Map` lookups instead of scanning arrays during render.
- Match card numbers through normalized candidates, not one exact string. TCGdex may expose `localId` as `5` or `59` while BDD IDs and `collection_number` may use `005` or `059`.
- Cardmarket URL lookup must use the same number normalization as price lookup so visible price blocks and external links agree.
- Price APIs are asynchronous. UI consumers must use `useCardPricing` or `useCollectionPrices` and handle loading/missing data.

## Known Set Mappings

- `basep` maps to `wizards_black_star_promos` with `cards_wizards_black_star_promos_db-{es,en}.json`.
- `sv09` maps to `journey_together` with `cards_journey_together_db-{es,en}.json`.
- Journey Together records use Cardmarket/JTG numbers and often store low numbers as three digits (`005`, `059`). Test both padded and unpadded card IDs.

## Dataset Workflow

1. Inspect several records from the new `src/bdd/*.json` file. Confirm the ID shape is `prefix:first-{no|yes}:condition:number` and identify available language fields.
2. Add an explicit loader under the normalized edition key in `DATABASE_LOADERS` in `src/utils/price.js`.
3. Add or update the TCGdex set-ID mapping in `normalizeEdicion`. Do not infer mappings by stripping numbers.
4. Verify `getAvailableLanguages`, `getAllPrices`, `getPrices`, and `getCardMarketUrl` against one known card.
5. If the dataset uses padded collection numbers, add a regression where the card fixture uses the unpadded TCGdex `localId`.
6. Add a regression for a card without data. It must return empty prices and `null` URL rather than another set's data.

## Validation

Run in this order:

```bash
npx vitest run src/utils/price.test.js
npm run check
```

For visible price behavior, also open a known card detail and a card from an unsupported set. Confirm the unsupported card has neither the market price section nor a Cardmarket link.
