# Address Book UI

Angular 22.1 front end for the Address Book Challenge API.

The application demonstrates the two required workflows:

1. Create a new address.
2. Retrieve an address by ID using a route parameter.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the design, state-management decision, validation strategy and testing approach.

## Requirements

- Node.js `^22.22.0 || ^24.13.1 || ^26.0.0`
- npm
- .NET 8 SDK for the supplied API

The project uses Angular 22.1, TypeScript 6 and Vitest.

## Run the application

Start the supplied .NET API first:

```bash
dotnet run
```

The API normally starts at:

```text
http://localhost:5062
```

Then install and start the Angular application:

```bash
npm ci
npm start
```

The Angular development server runs at:

```text
http://localhost:4200
```

The supplied API allows browser requests from `http://localhost:4200`, so use that origin when running the application.

## Verify the project

Run the project's checks with the same toolchain used by the application:

```bash
npm ci
npm test
npm run build
```

`npm test` runs the Vitest test suite through Angular CLI.

`npm run build` creates the production build.

For the assessment, the important verification is that the application can be installed, tested, built and run against the supplied .NET API.

Summary:

* Development

`npm start`

* Development build

`npm run build`

* Production build

`npm run prod`

* Tests

`npm test`

## What to try

### 1. Create an address

Open:

```text
http://localhost:4200/create
```

Submit the empty form.

Expected behaviour:

- no HTTP request is made
- validation messages appear
- focus moves to the first invalid field

Fill in the required fields and submit.

Expected behaviour:

- input is validated
- postcode is normalized before submission
- the address is created with `POST /address`
- the application navigates to `/address/{id}`
- the newly created address is then loaded with `GET /address/{id}`

### 2. Retrieve an address by ID

Use the address ID in:

```text
/address/{id}
```

The application reads the ID from the route and requests:

```text
GET /address/{id}
```

The header also contains a **Find by address ID** field for navigating directly to an address.

### 3. Test failure states

Open an unknown GUID:

```text
/address/{unknown-guid}
```

The application displays a not-found state.

Stop the API and try loading an address again.

The application displays a service/network error and provides a retry action where appropriate.

## Project structure

```text
src/
├── styles.scss
└── app/
    ├── app.* / app.config.ts / app.routes.ts
    ├── core/
    │   ├── environments/
    │   ├── interceptors/
    │   └── validators/
    ├── shared/
    │   └── components/
    └── features/address/
        ├── address.routes.ts
        ├── data-access/
        ├── feature/
        └── ui/
```

The address feature is split into:

- **data-access**: API contract, models, validation rules and error mapping
- **feature**: routed components and stateful page logic
- **ui**: presentational components

## State management

No global state manager is used intentionally.

This application has:

- local form state
- one address request at a time
- route state for the address ID
- no shared address collection

Signal Forms, `httpResource` and the router already provide the appropriate state ownership.

## Testing

The test suite covers the important application behaviours, including:

- validation and normalization
- API request construction
- API error mapping
- invalid form submission
- server validation errors
- network failures
- successful creation and navigation
- address retrieval from the route parameter
- loading, success, 404 and retry states
- address rendering
- lookup navigation
- routing and shell behaviour

The test strategy is described in more detail in [ARCHITECTURE.md](ARCHITECTURE.md).

### Advanced Angular capabilities

SSR, hydration, event replay, and server routes are intentionally included to demonstrate familiarity with Angular's broader rendering capabilities. They are not required for this small CRUD-style assessment, and in a production implementation I would evaluate whether their complexity is justified by the application's requirements.

## Notes for the reviewer

The implementation intentionally stays proportional to the challenge. It does not introduce NgRx, a UI framework or additional address-management functionality because those would not solve a requirement in the supplied assessment.

The application focuses on demonstrating:

- component decomposition
- modern Angular patterns
- responsive styling
- accessible forms
- client and server validation
- typed API integration
- error handling
- routing
- practical automated testing
