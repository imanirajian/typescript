# Architecture

Angular 22.1 front end for the Address Book Challenge API (`POST /address`, `GET /address/{id}`).
Generated with Angular CLI 22.1.8 (Vitest 4, TypeScript 6, SSR enabled).

## 1. Summary

- **Signals-first, standalone, zoneless.** No NgModules, no `zone.js`. OnPush is the Angular 22 default, so it is not repeated on components.
- **Feature-first folders.** Inside the feature: `data-access/` → `feature/` (smart) → `ui/` (dumb). App-wide code is in `core/`, reusable presentational pieces in `shared/`.
- **Local state only.** Form state is a Signal Form, the GET is an `httpResource`, and the URL carries the address id. There is deliberately **no store** (section 6).
- **Errors are a typed application concept** (`AddressApiError`), not raw `HttpErrorResponse`s leaking into components.
- **SSR is on** (from the scaffold) and configured so it works: prerender only the static page, render the parameterised page per request, hydrate on the client (section 10).

## 2. Folder structure

```
src/
├── styles.scss                          design tokens + shared primitives (.page, .button, .actions, .sr-only)
└── app/
    ├── app.ts / app.html / app.scss     shell: brand, "New address" link, header lookup, <router-outlet>
    ├── app.config.ts                    providers: router (+ input binding), HttpClient + interceptor, hydration
    ├── app.config.server.ts             SSR providers (generated)
    ├── app.routes.ts                    root: lazy-loads the address feature; unknown URLs -> /create
    ├── app.routes.server.ts             SSR render modes per route
    ├── core/                            app-wide, no business logic
    │   ├── environments/environment.ts      apiBaseUrl (single place to change the API address)
    │   ├── interceptors/                    error-logging-interceptor (the one central hook for failed requests)
    │   └── validators/required-trimmed.ts   generic Signal Forms rule: required and not just whitespace
    ├── shared/components/               reusable dumb components (no services)
    │   ├── error-banner/                    role="alert" message
    │   └── loading-indicator/               spinner + role="status" label
    └── features/address/                everything about addresses
        ├── address.routes.ts            the feature's routes (lazy chunk)
        ├── data-access/                 NO UI. API contract + rules.
        │   ├── address.model.ts             wire types (UkAddressBody, UkAddress, ApiValidationError)
        │   ├── address.rules.ts             form model, trimming/normalising, postcode rules, toRequest()
        │   ├── address-api.ts               AddressApi: the only place that knows URLs/verbs
        │   └── address-api-error.ts         HTTP failure -> { kind, message, fieldErrors }
        ├── feature/                     SMART: inject services, own state
        │   ├── address-form/                create screen (+ address-form.schema.ts)
        │   ├── address-detail/              view screen for /address/:id
        │   └── address-lookup/              header "find by ID" box (navigates only)
        └── ui/                          DUMB: inputs in, no services
            ├── address-field/               label + input + hint + errors
            └── address-card/                envelope-style address label
```

## 3. Layers and dependency rules

| Layer | Holds | May depend on | Must not depend on |
|---|---|---|---|
| `core` | environment, interceptor, generic validators | Angular, RxJS | `features`, `shared` |
| `shared` | reusable presentational components | Angular | `features`, `core` services |
| `data-access` | wire types, `AddressApi`, error mapping, pure rules | Angular `HttpClient`, RxJS, `core` | `ui`, `feature`, Router |
| `ui` | presentational components (`input()` in, no services, no Router) | `data-access` types and pure helpers, `shared` | `feature`, HTTP, Router |
| `feature` | routed pages and page-level widgets that inject services | `ui`, `data-access`, `core`, `shared` | other features' internals |
| `app` (shell) | root component, routes, providers | everything | n/a |

Direction is one-way: **`feature → ui → data-access`**, with `core` and `shared` as leaves. If a `ui` component needs `inject(...)` or the Router it has become a feature component and should move. These rules were checked by script when this was assembled; they can be enforced later with an ESLint `no-restricted-imports` rule.

## 4. Components

| Component | Layer | Responsibility | State |
|---|---|---|---|
| `App` | shell | header (brand, nav, lookup) + `<router-outlet>` | none |
| `AddressForm` | feature | builds the Signal Form, submits, maps server errors onto fields, navigates on success | form model, `submitError` |
| `AddressDetail` | feature | reads `:id`, owns the `httpResource`, chooses loading / error / success view | resource |
| `AddressLookup` | feature | header "find by ID": validates non-blank, navigates to `/address/:id` | its own tiny form |
| `AddressField` | ui | one labelled input: hint, error text, `aria-*` wiring | derived only |
| `AddressCard` | ui | renders an address like the front of an envelope | derived only |
| `ErrorBanner` | shared | shows a failure message as an alert | none |
| `LoadingIndicator` | shared | spinner + status text | none |

## 5. Data flow

**Create**

```
user types ─► Signal Form model (strings only; optional = '')
submit    ─► schema validation ── invalid ─► errors on fields, focus first invalid, NO request
              │ valid
              ▼
          toRequest(): trim, blank optionals -> null, postcode -> "CV376HP"
              ▼
          AddressApi.create()  ── POST /address        (errorLoggingInterceptor sees failures)
              │ 201 { addressId, ... }                    │ error
              ▼                                           ▼
   router.navigate(['/address', id])        toAddressApiError()
                                             ├─ validation -> message on the matching field
                                             └─ network/server -> <app-error-banner>
```

**View**

```
/address/:id ─► withComponentInputBinding ─► AddressDetail.id (signal input)
             ─► httpResource(GET /address/{id})   re-runs if id changes; reload() = "Try again"
                  ├─ isLoading  -> <app-loading-indicator>
                  ├─ error      -> toAddressApiError() -> <app-error-banner> (404: no retry; else retry)
                  └─ value      -> { ...body, addressId: id } -> <app-address-card>
```

After a successful POST the app **re-fetches** via the detail route instead of rendering the POST response. That is intentional: it exercises both endpoints independently, and the URL becomes a shareable, refreshable address.

## 6. State management: why there is no store

A signal store per feature (`contacts.store.ts` in `data-access/`) fits a *list* with add/edit/delete. This app has none of what a store exists for:

| Store benefit | This app |
|---|---|
| Shared collection across screens | There is no list. Two screens, one address each. |
| Cross-component synchronisation | The form hands over only an id, and the **URL carries it**. |
| Caching / optimistic updates | Not required; the GET is one request. |
| Loading/error bookkeeping | `httpResource` already provides `isLoading()`, `error()`, `value()`, `reload()`. A store would duplicate it. |

| State | Where |
|---|---|
| Form values, touched/dirty, validity, `submitting()` | Signal Form (`form()`) |
| Failure not tied to a field | `submitError` signal in `AddressForm` |
| Loading / error / value of the GET | `httpResource` in `AddressDetail` |
| Which address is being viewed | the route (`/address/:id`) |

**When to add a store:** an address *list*, search, edit, delete, or anything read by more than one route. It goes at `data-access/address.store.ts`, provided at feature-route level (`providers` in `ADDRESS_ROUTES`) so it is scoped to the feature. Expose state with `asReadonly()`; avoid "selectors" that merely re-wrap a signal.

## 7. Forms and validation

- **Signal Forms** (stable in Angular 22): `form()` with the `FormRoot` and `FormField` directives. The model is a plain object of strings; optional fields are `''`, never `null`.
- **Schema** (`address-form.schema.ts`) is a plain function, tested with no component or DOM.
- **Rules come from the documented limits** on `UkAddressBody`: required lines, max 50 characters, postcode 5–8 letters/numbers.
- **`requiredTrimmed`** (`core/validators`): `required()` accepts `"   "`, so this generic rule also rejects whitespace-only input with the same message. It is reused by the address form and the lookup box.
- **Postcode.** The backend validator only checks "not empty and length 5–8" even though its comment says alphanumeric only, so the documented stricter rule is enforced on the client. Spaces are allowed while typing (`SW1A 1AA`), stripped and uppercased on submit, and re-spaced for display only.
- **Optional lines** are sent as `null` when blank (the API describes them as "optional, not empty").
- **Invalid submit** never reaches the network, and focus moves to the first invalid control.

## 8. API contract notes (from reading the supplied C#)

| Observation | Handling |
|---|---|
| `POST` returns `UkAddress` (with `addressId`); `GET` returns the bare `UkAddressBody` | `AddressDetail` merges `id` from the route |
| FluentValidation errors are a JSON array of `{ propertyName: "Postcode", errorMessage }` (PascalCase C# names) | first letter lower-cased and matched to form fields (works if the casing ever changes); unknown properties kept as a general message |
| Postcode "letters and numbers only" is a comment, not enforced by the server | enforced on the client |
| `GET /address/{id:guid}`: a non-GUID id doesn't match the route and returns 404 | shown as "No address was found" |
| CORS allows only `http://localhost:4200` and the `content-type` header | app runs on 4200 and calls the API directly (no proxy) |

## 9. Error handling

`toAddressApiError(err)` is framework-free and duck-typed; it also unwraps errors that carry the HTTP failure in `cause` (how resources may wrap it). Failed requests are additionally logged once, centrally, by `errorLoggingInterceptor`.

| Kind | Trigger | UI |
|---|---|---|
| `validation` | 400 with a FluentValidation array | message under the matching field; banner only for unmapped properties |
| `not-found` | 404 | banner, link to create; no retry |
| `network` | status 0 | banner + **Try again** (detail) or banner (form) |
| `server` | anything else, incl. a 400 that is not a validation list | banner + **Try again** (detail) or banner (form) |

## 10. Routing and SSR

- `app.routes.ts` lazy-loads the feature with `loadChildren`; `address.routes.ts` lazy-loads each page with `loadComponent`. `/` and unknown URLs redirect to `/create`.
- `withComponentInputBinding()` delivers `:id` as a signal `input()`; no `ActivatedRoute` subscription.
- Every route has a `title`.
- **SSR (enabled by the scaffold):**
  - `app.routes.server.ts`: the generated rule `** → Prerender` fails the build on parameterised routes (`address/:id` has no `getPrerenderParams`). So `create` is prerendered, `address/:id` and everything else render per request.
  - `app.config.ts` adds `provideClientHydration(withEventReplay())` so the client reuses the server DOM and the GET response fetched on the server (HTTP transfer cache).
  - Browser-only behaviour (focus, submit) runs only in event handlers, never during render.
  - The SSR server (`serve:ssr:ui`) defaults to port 4000, which the API's CORS rejects; run it as `PORT=4200 npm run serve:ssr:ui`.

## 11. Styling, responsive design, accessibility

- **Tokens** are CSS custom properties in `styles.scss`; component styles are scoped. No UI framework.
- **Mobile-first**: one column by default, a six-column grid from `40rem` (Town/County pair up). The header lookup takes its own row on narrow screens. Controls are at least 44px tall.
- **Identity**: the address renders as an envelope label (serif type, airmail-stripe edge), the one decorative element.
- **Contrast**: text and input borders meet WCAG AA (input outlines 3:1+).
- **Accessibility**: real `<label for>`, `aria-invalid`, `aria-describedby` (hint and error), polite live regions, `role="alert"` / `role="status"`, `role="search"`, `aria-current="page"` on the active nav link, one `<h1>` per page, visible `:focus-visible`, `autocomplete` tokens, button disabled while saving, reduced-motion respected.

## 12. Testing

Vitest (the Angular default), behaviour-driven (DOM in, HTTP out).

| Spec | Proves |
|---|---|
| `address.rules.spec` | postcode normalise/validate/format; `toRequest` trimming and null optionals |
| `address-api-error.spec` | 400 field mapping, 404, network, fallbacks, wrapped errors |
| `address-form.schema.spec` | required, blank, 50-char limit, postcode (isolated Signal Form) |
| `required-trimmed.spec` | the generic rule in isolation |
| `address-api.spec` | POST URL, method, body |
| `error-logging-interceptor.spec` | failed requests are logged and the same error is rethrown; success is silent |
| `address-form.spec` | invalid submit: no request, focus on first error; normalised POST then navigation; button disabled while saving; server 400 on the right field; network failure alert |
| `address-detail.spec` | route id drives the GET; renders; 404 state; unreachable then retry |
| `address-lookup.spec` | trimmed id navigates and clears; blank does nothing |
| `address-card.spec` | optional lines omitted/ordered; formatted postcode |
| `error-banner.spec`, `loading-indicator.spec` | alert / status semantics |
| `app.routes.spec` | lazy routes resolve; `:id` bound; `/` and unknown URLs land on the form |
| `app.spec` | shell renders brand, nav, lookup |

DOM specs wait with a macro-task `settle()` rather than `fixture.whenStable()`, because a pending HTTP request keeps the app "unstable" and would hang `whenStable()`.

## 13. What came from the attached project, and what didn't

| From the attachment | Decision |
|---|---|
| Generated scaffold: `package.json`, `package-lock.json`, `angular.json`, tsconfigs, `.editorconfig`, `.prettierrc`, `server.ts`, `main*.ts`, `index.html`, favicon | **Kept as the project base.** They are the real CLI 22.1.8 output (Vitest 4, TS 6, jsdom 28), so the app is built against your actual toolchain. |
| `core/environments/environment.ts` | **Kept.** One obvious place for the API URL; the `API_BASE_URL` token defaults to it, so tests can still override it. |
| `errorLoggingInterceptor` | **Kept**, wired in `app.config.ts`, and given a real test (its old spec only asserted it "was created"). |
| `requiredTrimmed` validator | **Kept as an idea**, rewritten for Signal Forms (the original targets Reactive Forms `AbstractControl`). |
| Postcode validator's honest note (client enforces the *documented* rule, not the backend's) | **Kept** in the schema and this document. |
| `ApiValidationError` type, PascalCase → camelCase field mapping | **Kept** (`address.model.ts`, `address-api-error.ts`). Its comment said the names are camelCase; they are C# property names, so the mapper handles both. |
| Header search box | **Kept**, rebuilt as `AddressLookup` (Signal Forms, tested). It doubles as an easy way to test the GET-by-id requirement. |
| `error-banner`, `loading-indicator` | **Kept** and implemented (they were placeholders). |
| `core/` + `shared/` structure, `/create` route with `/` redirect, `New address` nav link | **Kept.** |
| `AddressApiService` that throws typed errors from `catchError` | **Replaced.** `httpResource` errors can't pass through a service `pipe`, so mapping happens at the consumption edge with one function used by both screens. |
| Reactive Forms validators and their specs, `HttpClientTestingModule` | **Replaced** by Signal Forms rules and `provideHttpClientTesting()` (the module is deprecated). |
| `standalone: true` and explicit `OnPush` | **Dropped**: both are defaults in Angular 22. |
| Header `<h1>` brand | **Changed** to a `<span>`; each page has its own `<h1>`. |
| `app.routes.server.ts` (`** → Prerender`) and missing hydration provider | **Fixed** (section 10). |

As uploaded, the project would not have compiled: `app.ts` imported `AddressSearch` while the file exported `AddressSearchComponent`, whose `templateUrl` pointed at a file that did not exist, and most other components were "works!" placeholders. All of those are now real implementations.

Also not added, because the README asked for judgment rather than volume: NgRx or any store, e2e tests (a Playwright "create → view" smoke test would be the next addition), i18n.

## 14. Growth path

1. **List / edit / delete** → extend `AddressApi`, add `address.store.ts` in `data-access`, an `address-list` feature page and an `address-row` ui component.
2. **Second feature** → move `AddressField` (generic enough) into `shared/`; grow `core/` (global error handler, auth).
3. **Auth / telemetry** → extend the existing interceptor or add another `HttpInterceptorFn`; point logging at a real sink.

## 15. Verification status

Written without network access, so `npm install`, `ng build` and `ng test` were **not** run. Checked instead: the framework-free modules type-check under this project's own `tsconfig` (TypeScript 6.0) and their logic passes tests in Node; every relative import and template/style path resolves; every component used in a template is in its `imports`; the layer rules in section 3 hold; no legacy patterns (`*ngIf`, `@Input`, `HttpClientTestingModule`, redundant `standalone`). Run `npm test && npm run build` first; the likeliest places to need a tweak are the DOM specs' timing, Signal Forms typings, and SSR prerender.
