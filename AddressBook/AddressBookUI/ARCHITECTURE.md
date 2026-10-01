# Architecture

Angular 22.1 front end for the Address Book Challenge API.

The application demonstrates the two required flows:

- create a new address with `POST /address`
- retrieve an address by ID with `GET /address/{id}`

The implementation intentionally keeps state local to the screens. There is no global state manager because the challenge has no shared collection or cross-route application state.

## 1. Architecture summary

- **Standalone Angular components** with a feature-first structure.
- **Signals-first state** using Signal Forms for form state and `httpResource` for the address GET request.
- **Typed API boundary** so components do not work directly with raw `HttpErrorResponse` values.
- **Feature / UI separation**: routed/page components own state and orchestration; presentational components render data and validation state.
- **No global store**: the form, route and HTTP resource already own the state required by this application.
- **Responsive, accessible UI** using semantic HTML, labels, keyboard focus handling, ARIA attributes and mobile-first CSS.
- **Unit and component tests** cover validation, API requests, routing, success states and failure states.

## 2. Folder structure

```text
src/
├── styles.scss
└── app/
    ├── app.ts / app.html / app.scss
    ├── app.config.ts
    ├── app.routes.ts
    │
    ├── core/
    │   ├── environments/environment.ts
    │   ├── interceptors/
    │   └── validators/required-trimmed.ts
    │
    ├── shared/
    │   └── components/
    │       ├── error-banner/
    │       └── loading-indicator/
    │
    └── features/address/
        ├── address.routes.ts
        ├── data-access/
        │   ├── address.model.ts
        │   ├── address.rules.ts
        │   ├── address-api.ts
        │   └── address-api-error.ts
        ├── feature/
        │   ├── address-form/
        │   ├── address-detail/
        │   └── address-lookup/
        └── ui/
            ├── address-field/
            └── address-card/
```

### Responsibilities

| Area | Responsibility |
|---|---|
| `core` | Application-wide infrastructure such as the API configuration, HTTP interceptor and generic validation |
| `shared` | Reusable presentational components with no address-specific business logic |
| `features/address/data-access` | Address models, API calls, validation rules and API-error normalization |
| `features/address/feature` | Routed/page-level components that own state and coordinate the UI |
| `features/address/ui` | Small presentational components |
| `app` | Application shell, router and providers |

The intended dependency direction is:

```text
feature
   ↓
ui / data-access
   ↓
core / shared
```

Presentational components do not make HTTP requests or perform navigation.

## 3. Main flows

### Create address

```text
AddressForm
    │
    ├── Signal Form validation
    │       └── invalid → field errors + focus first invalid control
    │
    └── valid
          │
          ▼
       toRequest()
          │
          ▼
   AddressApi.create()
          │
          ▼
     POST /address
          │
          ▼
 navigate /address/{id}
          │
          ▼
 AddressDetail
          │
          ▼
 GET /address/{id}
```

The POST response contains the new address ID. The application navigates to the detail route and performs the GET independently. This exercises both API requirements and leaves the address accessible through a refreshable URL.

### Get address by ID

```text
/address/:id
      │
      ▼
withComponentInputBinding()
      │
      ▼
AddressDetail.id
      │
      ▼
httpResource(GET /address/{id})
      │
      ├── loading → LoadingIndicator
      ├── 404 → not-found error state
      ├── other failure → ErrorBanner + retry
      └── success → AddressCard
```

The route parameter is exposed directly as a signal input rather than subscribing manually to `ActivatedRoute`.

## 4. Forms and validation

The create form uses Angular Signal Forms.

Validation is performed before the request:

- required fields reject empty and whitespace-only values
- fields respect the API's documented 50-character limit
- postcode accepts the documented 5–8 alphanumeric characters
- postcode input may contain a space while typing
- submitted postcode is normalized to uppercase without spaces
- optional address lines are sent as `null` when blank

Server validation is also handled. API validation errors are converted into field-level errors so backend validation can be displayed next to the corresponding input.

## 5. API error handling

`AddressApi` is the only application layer that knows the API URLs and HTTP methods.

Raw HTTP failures are normalized into:

```ts
AddressApiError {
  kind,
  message,
  fieldErrors
}
```

The UI therefore does not need to know about ASP.NET validation response details.

The mapping covers:

- validation errors
- not found
- network failures
- unexpected server failures
- unknown validation fields

Expected HTTP responses such as validation `400` and not-found `404` are treated as application states rather than being logged as unexpected errors. Unexpected failures such as network errors and `5xx` responses can be logged centrally.

## 6. State management

No NgRx or global store is used.

| State | Owner |
|---|---|
| Form values and validity | Signal Form in `AddressForm` |
| Form submission error | `AddressForm` |
| GET loading/error/value | `httpResource` in `AddressDetail` |
| Address being viewed | Router URL |

A store would become useful if the application gained shared address collections, edit/delete workflows, caching, optimistic updates, or state consumed by multiple unrelated routes.

## 7. Routing

The address feature is route-based:

```text
/create
/address/:id
```

The root URL redirects to `/create`, and unknown application URLs also redirect to `/create`.

`withComponentInputBinding()` maps the `:id` route parameter directly to `AddressDetail.id`.

Each routed screen has its own page heading and route title.

## 8. Responsive design and accessibility

The UI is mobile-first:

- one-column layout by default
- multi-column form layout on wider screens
- header lookup adapts to narrow screens
- controls have comfortable touch targets
- no UI framework is required

Accessibility includes:

- real `<label>` elements associated with inputs
- `aria-invalid` and `aria-describedby`
- live regions for loading/error feedback
- semantic `role="alert"` and `role="status"`
- visible `:focus-visible` styling
- keyboard focus on the first invalid field after an invalid submission
- appropriate autocomplete attributes
- one page-level `<h1>`
- reduced-motion support

## 9. Testing strategy

Tests focus on observable behaviour rather than implementation details.

Covered areas include:

- pure address/postcode rules
- Signal Forms validation
- POST request method, URL and body
- API error normalization
- invalid form submission
- server-side validation errors
- network failures
- successful navigation after creation
- route ID → GET request
- loading, success, 404 and retry states
- address rendering
- lookup navigation
- shared error/loading components
- application routing and shell behaviour

The next natural addition for a production application would be a small browser-level smoke test covering:

```text
create → POST → navigate → GET → render
```

It is not necessary to introduce an end-to-end framework solely for this assessment.

## 10. Verification

The repository should be verified with the actual project toolchain before submission:

```bash
npm ci
npm test
npm run build
```

The development application can then be run with:

```bash
npm start
```

The supplied .NET API should be running separately on its configured address, normally:

```text
http://localhost:5062
```

The browser application should be served from:

```text
http://localhost:4200
```

because that is the origin allowed by the supplied API's CORS configuration.

## 11. Design decisions

### Why no global state manager?

The challenge has only two screens and no shared address collection. Form state belongs to the form, request state belongs to the HTTP resource, and the selected address ID belongs in the URL. A global store would add ceremony without solving a current requirement.

### Why normalize API errors?

It keeps ASP.NET-specific response details at the data-access boundary and gives the UI a stable, typed error model.

### Why separate feature and UI components?

The feature components coordinate state, routing and API calls. The UI components remain small, reusable and easy to test.

### Why test behaviour rather than private implementation?

The important contracts are things such as:

- invalid input prevents a request
- valid input produces the correct request
- API failures are presented appropriately
- a route ID produces the expected GET
- successful creation navigates to the created address

These are more valuable regression guarantees than tests coupled to private component implementation details.

## 12. Advanced Angular capabilities and proportionality

SSR, hydration, event replay, and server routes are intentionally included to demonstrate familiarity with Angular's broader rendering capabilities. They are not required for this small CRUD-style assessment, and in a production implementation I would evaluate whether their complexity is justified by the application's requirements.

The application otherwise deliberately avoids adding infrastructure that is not required by the challenge:

- no NgRx/global store
- no UI component library
- no unnecessary domain abstraction layer
- no end-to-end framework solely to increase test count
- no additional address-management features

The goal is to demonstrate production-quality Angular practices while keeping the implementation proportional to the small problem being solved.

## The entire system in one picture

                         ┌──────────────────────────┐
                         │        Browser           │
                         │      Angular 22          │
                         │                          │
                         │  Create Address          │
                         │       │                  │
                         │       ▼                  │
                         │  AddressForm             │
                         │       │                  │
                         │       ▼                  │
                         │  Validation              │
                         │       │                  │
                         │       ▼                  │
                         │  AddressApi              │
                         └─────────┬────────────────┘
                                   │
                              HTTP POST
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │       .NET 8 API         │
                    │                          │
                    │ POST /address            │
                    │ GET  /address/{id}       │
                    │                          │
                    │ FluentValidation         │
                    │ ConcurrentDictionary     │
                    └────────────┬─────────────┘
                                 │
                           Address created
                                 │
                                 ▼
                          { addressId: ... }
                                 │
                                 ▼
                        Angular navigates to
                            /address/{id}
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │     AddressDetail        │
                    │                          │
                    │ route :id                │
                    │      ↓                   │
                    │ httpResource             │
                    │      ↓                   │
                    │ GET /address/{id}        │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                            AddressCard