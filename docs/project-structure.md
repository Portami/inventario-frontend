# Project Structure

The codebase is organized **feature-first**: everything belonging to one domain — pages, components, hooks, API calls, types, constants, tests — lives in one folder under `src/features/`. Domain-agnostic building blocks live in `src/shared/`, and the composition root lives in `src/app/`.

```
src/
├── app/          # composition root — the only layer that knows all features
│   ├── main.tsx            # createRoot + providers (theme, query client, toasts, router)
│   ├── routes.tsx          # route table; every page is React.lazy-loaded
│   ├── navigation.ts       # sidebar tree config — add a page here, not in the layout
│   ├── NavigationLayout.tsx# app shell; renders navigation.ts and the Suspense outlet
│   └── theme.ts            # MUI theme (design tokens)
│
├── features/
│   ├── felts/        # felts + suppliers + felt types + batches + reorder
│   ├── rolls/        # rolls + pieces + scraps (one physical hierarchy)
│   ├── products/     # products + variants + categories + inventory changes
│   ├── offers/       # offers, invoicing, dunning, reservations, payment
│   ├── customers/
│   ├── stocktakes/   # inventory auditing (URL routes stay /inventory/*)
│   ├── labels/
│   ├── scanning/     # Scanner, useHidScanner, barcode lookup, scanner mock
│   ├── storage/
│   ├── statistics/
│   └── shopping/     # placeholder
│
├── shared/           # domain-agnostic only; never imports features/ or app/
│   ├── api/http.ts   # fetch wrapper: base URL, JSON handling, 5s default timeout
│   ├── components/   # ListPage, DetailPage, ToastProvider, StatTile, LabeledField, ...
│   ├── constants/    # company-wide config (companyConstants)
│   ├── pdf/          # pdfFactory: jsPDF setup + A4/margin constants
│   ├── styles/       # global + print scss
│   ├── testing/      # vitest setup
│   └── utils/        # toErrorMessage etc.
│
└── assets/
```

## Inside a feature

Each feature has the same internal shape, omitting any folder it doesn't need:

```
features/<name>/
├── api.ts        # this domain's endpoint functions + query keys + DTO mappers (if any)
├── pages/        # route components (+ colocated *.test.tsx)
├── components/   # feature-private components
├── hooks/
├── types.ts      # domain types
├── constants.ts  # domain constants
└── index.ts      # the ONLY barrel: the feature's public API for cross-feature use
```

## Import rules (lint-enforced)

`eslint.config.js` enforces these with `import/no-restricted-paths`:

1. `shared/` never imports from `features/` or `app/`.
2. Features never import from `app/`.
3. A feature imports another feature **only via `@/features/<name>`** (its `index.ts`) or its `types.ts`. Deep paths into another feature are rejected. Inside a feature, deep relative or `@/` imports are fine — no internal barrels.

Cross-feature _type_ imports should be `import type` so they are erased at compile time and cannot create runtime cycles.

## Data fetching

- Endpoint functions are one-liners in the feature's `api.ts` on top of `@/shared/api/http` (`get`/`post`/`patch`/`del`). Every request gets a 5-second timeout by default; pass your own `AbortSignal` to override.
- **TanStack Query is the target idiom**: reads via `useQuery` (render from `isPending`/`error`), writes via `useMutation` + `useToast`, cache invalidation via the `<feature>Keys` objects exported from `api.ts`. The felts feature and the offers list are converted and serve as the reference; remaining pages still use manual `useEffect` state and should be converted opportunistically when touched.
- DTO mappers live inside `api.ts` and are applied inside the fetch functions, so nothing outside `api.ts` sees a `Backend*Dto`. Only add a mapper where the backend shape and the UI shape actually diverge (today: offers, customers, barcode lookup).

## Adding a page

1. Create the page in `features/<name>/pages/`.
2. Add a `React.lazy` route in `app/routes.tsx`.
3. Add a nav entry in `app/navigation.ts` if it belongs in the sidebar.

## Tests

Tests are colocated next to their subject (`FeltPage.tsx` + `FeltPage.test.tsx`); vitest picks up `src/**/*.test.{ts,tsx}`. The shared setup lives in `src/shared/testing/setup.ts`. Components using TanStack Query need a `QueryClientProvider` in the test render.

## Styling

MUI `sx` props first, `app/theme.ts` for design tokens, SCSS only for the physical label/data-matrix printing styles in `shared/styles/`.
