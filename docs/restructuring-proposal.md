# Restructuring Proposal

A proposal for reorganizing `src/` from the current type-based layout into a feature-based one, splitting the monolithic services layer, and a set of ranked improvements with an incremental migration path.

> Status: **executed** on branch `PORTAMI-133-refactor-frontend` (2026-07-09). `docs/project-structure.md` describes the resulting convention. Remaining follow-ups: convert the remaining pages to TanStack Query feature by feature (felts and the offers list are done), and split the oversized pages/dialogs opportunistically (§4, item 7).

---

## 1. Why change anything

The codebase (~15.4k LOC, 113 source files) is organized by _file type_ (`components/`, `pages/`, `hooks/`, `services/`, `types/`, `constants/`). At this size, that layout has started to hurt:

**The services are god modules.**

- `src/services/backend.ts` is **982 lines** and contains ~55 functions covering ~9 unrelated backend domains (rolls, felts, scraps, products, storages, offers, customers, stocktakes, barcodes). Every function copy-pastes the same `AbortController` + `setTimeout(5000)` + `try/clearTimeout/catch` block — roughly 500 of the 982 lines are that boilerplate.
- `src/services/cache.ts` is a hand-rolled query cache with magic string keys (`'felts'`, `'offers'`, …) duplicated at every get/set/invalidate site. Only 6 of 55 functions use it, invalidation is manual, and `hooks/useOffers.ts` calls `cacheInvalidate('offers')` directly — the key convention leaks across layers.

**One feature is smeared across six folders.** "Offers" lives in `pages/OffersPage.tsx` + `pages/OfferDetailPage.tsx`, `components/offers/` (30 components), `hooks/useOffer.ts` + `useOffers.ts`, `types/offerte.ts`, `pages/constants/offerConstants.ts`, and chunks of `services/backend.ts` + `services/invoicePdfService.ts`. Changing offer behavior means touching all of them.

**Data fetching has three coexisting patterns.** Domain hooks (`useOffer`, `useOffers`, `useFeltManagement`), inline `useEffect` + `useState` in ~15 pages, and direct `backend.ts` calls inside dialogs/cards — with inconsistent naming (`loading` vs `isLoading`) and two error strategies (error string via `toErrorMessage` vs toast via `useToast`). `useOffer.ts` (253 lines) hand-rolls optimistic updates with manual rollback.

**Folder names lie.** `components/` root mixes genuinely shared components (`ListPage` — 9 consumers, `DetailPage`, `ToastProvider`) with single-consumer ones (`ExpandableDataGrid` and `SearchField` are used only by `ProductsPage`; `DataMatrix` only by `rolls/RollLabel`). Meanwhile `StatTile` — genuinely generic — is trapped in `components/offers/` and deep-imported by `StatisticsPage`. `components/offers/` also contains the entire customers domain (`CustomersPage` reaches into it). `rolls/CutRollDialog` imports from `pieces/PieceDetailCard`. `pages/constants/offerConstants.ts` is consumed by hooks and components, not pages.

**Assorted debt.** `App.tsx` is a dead `<></>` stub (routing lives in `main.tsx`); all 21 pages are eagerly imported so jspdf, html2canvas, swissqrbill and recharts all land in the initial bundle; the 8 test files sit in a separate `src/tests/unit/` mirror tree; `labelPdfService.ts` duplicates the A4 constants that `pdfFactory.ts` already owns.

Largest files today:

| LOC | File                                          |
| --: | --------------------------------------------- |
| 982 | `src/services/backend.ts`                     |
| 480 | `src/pages/OffersPage.tsx`                    |
| 478 | `src/components/offers/CreateOfferDialog.tsx` |
| 473 | `src/services/invoicePdfService.ts`           |
| 458 | `src/pages/StatisticsPage.tsx`                |
| 441 | `src/pages/FeltDetailPage.tsx`                |
| 433 | `src/pages/FeltPage.tsx`                      |
| 398 | `src/pages/RollDetail.tsx`                    |
| 368 | `src/components/NavigationLayout.tsx`         |
| 327 | `src/components/felts/FeltDialog.tsx`         |

What's already healthy and worth keeping: the universal `@/` path alias (configured in both `tsconfig.json` and `vite.config.js`), `eslint-plugin-import-x` already installed, the sx-first styling convention with `theme.ts` tokens, and the thin `services/api.ts` fetch wrapper.

---

## 2. Target structure: feature-first

Everything belonging to one domain — pages, components, hooks, API calls, types, constants, tests — lives in one folder.

```
src/
├── app/                          # composition root — the only layer that knows all features
│   ├── main.tsx                  # createRoot + providers (from src/main.tsx, stays thin)
│   ├── routes.tsx                # route table, React.lazy per page
│   ├── navigation.ts             # nav-tree config data (extracted from NavigationLayout)
│   ├── NavigationLayout.tsx      # shell: drawer/appbar, renders navigation.ts config
│   └── theme.ts
│
├── features/
│   ├── felts/                    # felts + suppliers + felt types + batches + reorder
│   ├── rolls/                    # rolls + pieces + scraps (one physical hierarchy)
│   ├── products/                 # products + variants + categories + inventory changes
│   ├── offers/                   # offers, invoicing, dunning, reservations, payment
│   ├── customers/                # split out of offers
│   ├── stocktakes/               # current "inventoryAuditing" (URL routes stay /inventory/*)
│   ├── labels/
│   ├── scanning/                 # Scanner, useHidScanner, ScanPage, barcode lookup, mock
│   ├── storage/
│   ├── statistics/
│   └── shopping/                 # placeholder page only
│
├── shared/                       # domain-agnostic only; MUST NOT import from features/ or app/
│   ├── api/
│   │   └── http.ts               # current api.ts + timeout-by-default (see §3)
│   ├── components/
│   │   ├── ListPage.tsx
│   │   ├── DetailPage.tsx
│   │   ├── ToastProvider.tsx     # + useToast
│   │   ├── StatTile.tsx          # rescued from components/offers/
│   │   └── PageUnderConstruction.tsx
│   ├── pdf/
│   │   └── pdfFactory.ts         # jsPDF setup + A4/margin constants (single source)
│   ├── utils/
│   │   └── pageUtils.ts          # toErrorMessage etc.
│   ├── testing/
│   │   └── setup.ts              # from src/tests/unit/setup.ts
│   └── styles/                   # index.scss + print scss (unchanged content)
│
├── assets/
└── vite-env.d.ts
```

Every feature has the same internal shape, **omitting any folder it doesn't need**:

```
features/<name>/
├── api.ts            # this domain's endpoint functions (from backend.ts) + mappers if any
├── pages/            # route components
├── components/       # feature-private components (+ colocated *.test.tsx)
├── hooks/
├── types.ts          # split from src/types/*.ts
├── constants.ts      # split from constants/ and pages/constants/
└── index.ts          # the ONLY barrel: the feature's public API for cross-feature use
```

### Import rules

1. `shared/` never imports from `features/` or `app/`.
2. A feature imports another feature **only via `@/features/<name>`** (its `index.ts`), never deep paths. Inside a feature, deep imports are fine — no internal barrels.
3. Only `app/` imports pages.

These are enforced by lint (§4, item 3), not by convention alone.

### Boundary decisions and why

| Decision                             | Choice                          | Rationale                                                                                                                                                                                                                                        |
| ------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Customers out of offers?             | **Yes, own feature**            | Own page, routes, CRUD api + `mapBackendCustomer`. Dependency is one-way: offers → customers, never the reverse. Offer-grid cells like `CustomerCell`/`DueCell` stay in offers — they are offer-list concerns that merely display customer data. |
| Pieces/scraps merged with rolls?     | **Yes, one `rolls` feature**    | Scraps/pieces only exist as cut products of rolls; `CutRollDialog` already imports `PieceDetailCard`. Splitting would force a bidirectional dependency.                                                                                          |
| Felts + suppliers + types + batches? | **One `felts` feature**         | Suppliers/felt-types/batches have no pages of their own; they are lookup data consumed exclusively by felt screens. Not worth three micro-features.                                                                                              |
| Felt → roll → piece hierarchy        | **Two features; rolls → felts** | Rolls need felt names/types; to keep the dependency one-way, `fetchRollsByFelt`/`fetchScrapsByFelt` live in **rolls**, and `FeltDetailPage` imports `RollList` from `@/features/rolls`. Felts never imports rolls internals.                     |
| Invoicing/dunning out of offers?     | **No**                          | They operate on the same Offer aggregate and share `useOffer` and the state machine. Instead the 30 offer components get internal subfolders (below).                                                                                            |
| StatTile                             | → `shared/components`           | Used by both offers and statistics; it is the one genuinely generic component stuck in a domain folder.                                                                                                                                          |
| Scanning                             | Own feature                     | `Scanner` + `useHidScanner` are exported from its `index.ts` because the app shell (global scan) and stocktakes (`StorageAuditingCard`) consume them. `services/mock/scannerMock.ts` moves inside.                                               |

### Worked mapping: offers (the biggest feature)

```
features/offers/
├── api.ts                     # from backend.ts: fetchOffers, fetchOffer, createOffer,
│                              #   changeOfferState, markOfferSent, add/deleteOfferLine,
│                              #   updateOfferDueDate, fetchFeltCatalog, fetchProductCatalog
│                              #   + mapBackendOffer / mapBackendOfferToSummary (DTO boundary)
├── pages/
│   ├── OffersPage.tsx
│   └── OfferDetailPage.tsx
├── components/
│   ├── list/                  # FilterBar, KindChip, StateChip, CustomerCell, DueCell,
│   │                          #   InventoryCell, BulkStateDialog
│   ├── create/                # CreateOfferDialog, FeltSearchDialog, ProductSearchDialog
│   ├── detail/                # OfferHeader, OfferFlowDiagram, LineItemsTable, TotalsCard,
│   │                          #   Editable, LabeledField, OrderConfirmationSummaryCard
│   ├── invoicing/             # InvoiceDocumentPreview, InvoicePreviewCard, PaymentSummaryCard
│   ├── dunning/               # DunningDocumentPreview, DunningSidebarCard
│   └── reservations/          # ReservationChip, ReservationPanel
├── pdf/
│   ├── invoicePdfService.ts   # uses shared/pdf/pdfFactory
│   ├── invoicePdfService.test.ts
│   ├── invoiceTotal.ts        # pure calc, already well tested
│   ├── invoiceTotal.test.ts
│   └── invoiceTotalConsistency.test.ts
├── hooks/
│   ├── useOffer.ts            # shrinks drastically under TanStack Query (§3)
│   └── useOffers.ts
├── types.ts                   # from types/offerte.ts, minus customer types;
│                              #   FeltCatalogItem stays here (it is an offer-catalog shape)
├── constants.ts               # from pages/constants/offerConstants.ts
└── index.ts
```

Moved **out** of `components/offers/`: `StatTile` → shared; `CustomerCard`, `CustomerCompactCard`, `EditCustomerDialog` → customers.

### Worked mapping: felts

```
features/felts/
├── api.ts                     # fetchFelts, fetchSuppliers, fetchFeltTypes,
│                              #   create/update/deleteFelt, fetchBatchesByFelt, fetchFeltCatalog
├── pages/
│   ├── FeltPage.tsx           # + colocated FeltPage.test.tsx
│   ├── FeltDetailPage.tsx     # imports RollList from @/features/rolls
│   └── FeltReorderPage.tsx    # + FeltReorderPage.test.tsx
├── components/
│   ├── FeltDialog.tsx
│   └── DeleteFeltDialog.tsx
├── hooks/
│   └── useFeltManagement.tsx  # DataGrid column JSX moves out into pages/ (see §4 item 7)
├── types.ts                   # from types/felt.ts + supplier.ts + batches.ts
└── index.ts                   # exports felt types + list hook for rolls/offers
```

### The other features, one line each

- **rolls** — api: fetchRolls, fetchRollDetails, fetchRollsByFelt, create/update/split/cut/deleteRoll, fetchAllScraps, fetchScrapsByFelt, fetchScrapDetails, update/deleteScrap; pages: RollDetail, ScrapDetail; components: RollDialog, CutRollDialog, RollList, RollLabel, PieceCard, PieceDetailCard, **DataMatrix** (only consumer is RollLabel); types: roll.ts + scrap parts.
- **products** — api: 14 product/variant/category/inventory functions; pages: ProductsPage, ProductDetailView, CategoriesPage; components: the 5 dialogs + **ExpandableDataGrid** + **SearchField** (single-consumer → feature-private, not shared); types: product.ts.
- **customers** — api: fetchCustomers, createCustomer, updateCustomer + mapBackendCustomer; CustomersPage; CustomerCard, CustomerCompactCard, EditCustomerDialog; customer types out of offerte.ts.
- **stocktakes** — the 9 inventoryAuditing components; pages: InventoryPage, InvAuditingArchive, InvAuditingArchiveView, InventoryAuditingView, StorageAuditingDetailPage; the 10 stocktake api functions; types/inventoryAuditing.ts.
- **labels** — LabelGeneratorPage; LabelDimensionControls, LabelsPreview, ProductSelectionTable; labelPdfService (switched to shared pdfFactory constants); labelConstants.ts.
- **scanning** — ScanPage; Scanner (+ test); useHidScanner (+ test); types/scanner.ts; lookupRollCode; scannerMock.
- **storage** — StoragePage; fetchStorages; types/storage.ts.
- **statistics** — StatisticsPage; ChartCard.
- **shopping** — ShoppingPage (placeholder).

`src/constants/companyConstants.ts` (company/bank data used by offers PDF, labels, and pages) moves to `shared/` — it is app-wide config, not a domain.

**Deleted at the end state:** `src/App.tsx` (dead stub), `src/services/backend.ts`, `src/services/cache.ts`, and the emptied `src/pages/`, `src/components/`, `src/hooks/`, `src/types/`, `src/constants/`, `src/tests/` folders.

---

## 3. Splitting the services

### 3.1 One shared HTTP client with timeout-by-default

The ~15-line `AbortController` + `setTimeout` + `clearTimeout` block copy-pasted into all ~55 backend functions moves into the single `request()` in `shared/api/http.ts`:

```ts
const DEFAULT_TIMEOUT_MS = 5000;
// inside request():
signal: options?.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
```

`AbortSignal.timeout()` is supported in every browser Vite 8 targets and removes the `clearTimeout` bookkeeping entirely. Callers needing a different timeout (today only `fetchOffers` at 10s) pass their own signal. After this one change, every endpoint function collapses to 1–3 lines:

```ts
export const fetchFelts = () => get<FeltDto[]>('/felts');
```

That alone removes ~500 lines and the inconsistent per-function `console.warn` divergence.

### 3.2 Per-feature `api.ts`

`backend.ts` decomposes along the groupings already visible in its export list: felts 6, rolls + scraps 13, products 14, offers 10, customers 3, stocktakes 10, storage 1, scanning 1. Each function moves verbatim (minus boilerplate) into `features/<name>/api.ts`. URL strings stay next to the functions — no endpoint registry.

### 3.3 Replace `cache.ts` with TanStack Query — recommended

**Add `@tanstack/react-query`; delete `cache.ts` and the hand-rolled optimistic-update/rollback code in `useOffer.ts`.**

This app has exactly the problems the library solves:

- `cache.ts` is a query cache reimplemented badly: magic string keys duplicated across sites, 6/55 functions covered, manual invalidation already leaking into `useOffers.ts`.
- `useOffer.ts` hand-rolls optimistic updates + rollback across ~10 mutation actions; Query's `onMutate`/`onError`/`onSettled` is the battle-tested version of that code.
- The three data-fetching patterns and two error strategies converge on one idiom: `useQuery` for reads (uniform `isPending`/`error`), `useMutation` + toast for writes.

Cost: one well-maintained ~13 kB dependency plus a small `keys` object per feature `api.ts` (e.g. `['felts']`, `['offers', id]`). No global store is added — server state is the only global state this app has.

_Rejected alternative:_ keeping `cache.ts` with a typed key union. It fixes the magic strings but still leaves manual invalidation, no request dedup, no staleness handling, and ~15 pages of bespoke `useEffect` loading logic. The ongoing maintenance cost exceeds one dependency.

### 3.4 DTO mapping — keep it proportionate

Mappers live inside the owning feature's `api.ts` and are applied _inside_ the fetch functions, so nothing outside `api.ts` ever sees a `Backend*Dto`. That is already true for offers/customers; the pattern is kept. **Do not** retrofit mappers onto domains where the backend shape already is the UI shape (felts, rolls, products, …) — the type just lives in the feature's `types.ts` and gets a mapper only if the shapes ever diverge. The one hidden mapping (`lookupRollCode` renaming `scrap` → `scrap_piece`) moves with scanning.

### 3.5 PDF services

`shared/pdf/pdfFactory.ts` becomes the single owner of jsPDF construction and A4/margin constants. `invoicePdfService` already uses it; `labelPdfService` switches to importing those constants instead of redeclaring them. Both PDF services themselves are feature code (offers, labels) — `shared/pdf` holds only the factory.

---

## 4. Ranked improvements (value ÷ effort, highest first)

1. **Timeout-by-default HTTP helper** (§3.1). Hours of effort; deletes ~500 duplicated lines and a class of `clearTimeout` bugs. Prerequisite for everything else.
2. **Route-level code splitting.** ~1 hour: `React.lazy(() => import(...))` for all 21 pages in `app/routes.tsx` + one `<Suspense>` fallback around the layout outlet. jspdf, html2canvas, swissqrbill and recharts currently all ship in the initial bundle.
3. **ESLint import boundaries** with the already-installed `eslint-plugin-import-x`: `import-x/no-restricted-paths` zones for the three rules in §2. ~1 hour. This is what stops the new structure from decaying; add it right after the pilot feature.
4. **TanStack Query** (§3.3), adopted feature by feature.
5. **One error/loading idiom**, documented in `project-structure.md`: reads render from `useQuery` state (`isPending` naming; `toErrorMessage` only at the render site), mutations report via `useToast`. Kills the `loading`/`isLoading` and string-vs-toast splits as each feature converts.
6. **Extract the nav config** from the 368-line `NavigationLayout.tsx` into `app/navigation.ts` (an array of `{ label, icon, path, children }`). The layout becomes a renderer; adding a page stops requiring surgery on layout JSX.
7. **Split oversized files opportunistically** — only when a feature is already on the bench: `OffersPage` (480 — filter-bar state + grid columns out), `CreateOfferDialog` (478 — per-step components), `StatisticsPage` (458 — per-chart sections), `FeltDetailPage` (441), and move the DataGrid column JSX out of `useFeltManagement.tsx` (hooks should not own table JSX). Not a dedicated phase.
8. **Colocate tests.** `git mv` the 8 test files next to their subjects; `setup.ts` → `shared/testing/`. Update the vitest `include` accordingly. Low value today, but removes the mirror-tree convention before it grows.
9. **Dissolve both constants roots** (`constants/`, `pages/constants/`) into feature `constants.ts` files — falls out of the migration for free.

---

## 5. Migration path

Each step is a standalone PR that leaves `npm run check:ci` green (eslint, stylelint, spellcheck, prettier, tests + coverage, build). Use `git mv` for every relocation, and keep move-commits separate from edit-commits — a pure rename plus import rewrite stays rename-detectable in git history; a rename plus refactor does not.

1. **Baseline + helper.** Implement timeout-by-default in `services/api.ts`; mechanically strip the AbortController boilerplate from every `backend.ts` function. No signatures change, no files move; `backend.ts` drops to ~400 lines. Existing tests pass unchanged.
2. **`app/` + `shared/` skeletons.** `git mv` `theme.ts` and `NavigationLayout.tsx` → `app/`; `ListPage`, `DetailPage`, `ToastProvider`, `PageUnderConstruction`, `StatTile` → `shared/components/`; `api.ts` → `shared/api/http.ts`; `pdfFactory` → `shared/pdf/`; `utils/pageUtils.ts` → `shared/utils/`; `styles/` → `shared/styles/`. Move routing from `main.tsx` into `app/routes.tsx`; delete the dead `App.tsx`. `cache.ts` stays put for now.
3. **Lazy routes + nav config.** Convert `app/routes.tsx` to `React.lazy` + Suspense; extract `app/navigation.ts`. Small, isolated, verifiable in the bundle output.
4. **Pilot feature: felts.** Create `features/felts/` per §2; move pages/components/hook/types/tests; carve the 6 felt functions out of `backend.ts`. Felts is the right pilot: mid-sized, protected by two page tests, and exercises every mechanic (type split, test colocation, cross-feature import from rolls).
5. **Add the ESLint boundary rules**, with legacy folders exempted until they empty. Every subsequent move must conform.
6. **TanStack Query on the pilot.** Add `QueryClientProvider` in `app/main.tsx`; convert felts reads/writes to `useQuery`/`useMutation`.
7. **Remaining features, one PR each, in dependency order:** storage → scanning → rolls → products → customers → offers → stocktakes → labels → statistics → shopping. Each PR: move files, extract its `backend.ts` slice, convert its data access to Query, dissolve its slice of `types/` and `constants/`. `backend.ts` shrinks monotonically; delete `backend.ts`, `cache.ts` and the emptied folders in the last PR. The offers PR is the largest (~40 files); if needed it splits cleanly into customers-first, then offers.
8. **Cleanup + docs.** Rewrite `docs/project-structure.md` for the feature convention and boundary rules; remove the legacy lint exemptions; run a dead-export sweep.

Rollback story: every step is a vertical slice with no dependency on a future step, so any PR can be reverted alone.

---

## 6. Explicitly not doing

- **No Feature-Sliced Design layers** (entities/widgets/processes) — 11 features + `shared/` is the right altitude for 15k LOC.
- **No barrel-file chains.** Exactly one `index.ts` per feature, and only what other features actually consume goes in it.
- **No global state library** (Redux/Zustand/Jotai). Server state goes to Query; the rest is local component state.
- **No mandatory DTO mapper per domain** — mapping only where backend and UI shapes actually diverge.
- **No per-feature path aliases** (`@felts/...`) — the universal `@/` alias stays.
- **No renames of domain vocabulary or URL routes** — this refactor is invisible to users and to the backend.
- **No new HTTP client** (axios/ky) — the ~50-line fetch wrapper plus the timeout default is sufficient; Query handles retries/staleness above it.
- **No test-coverage crusade or big-bang page rewrites during moves** — file splits happen only when a feature is already open on the bench (§4, item 7).
