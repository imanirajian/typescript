# Address Book UI (Angular 22.1)

Front end for the Address Book Challenge API: **create an address** and **view an address by ID (route parameter)**.
Design, layer rules, state-management decision and test strategy are in **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Run it

Prerequisites: Node `^22.22.0 || ^24.13.1 || ^26.0.0`, and .NET 8 for the API.

```bash
# terminal 1: the supplied API (in its own folder)
dotnet run                 # http://localhost:5062

# terminal 2: this app
npm install
npm start                  # ng serve -> http://localhost:4200
```

The app **must** be served from `http://localhost:4200`: the API's CORS policy allows only that origin.

```bash
npm test                   # Vitest via `ng test`
npm run build              # production build (SSR output in dist/ui)
```

Running the built SSR server (`npm run serve:ssr:ui`) defaults to port 4000, which the API's CORS
does not allow. Use the same port as `ng serve`: `PORT=4200 npm run serve:ssr:ui`.

## What to try

1. Open `/create`, submit empty: nothing is sent, errors appear, focus moves to the first invalid field.
2. Fill it in (a postcode like `CV37 6HP` is fine) and save: you land on `/address/{id}`, which loads the address by GET.
3. Paste any ID into the header's **Find by address ID** box, or open `/address/{unknown-guid}` for the not-found state.
4. Stop the API and retry: friendly "can't reach the service" message with **Try again**.

## Layout

```
src/app/
├── app.* / app.routes.ts / app.config.ts / app.routes.server.ts   shell, routes, providers, SSR routes
├── core/          environments, HTTP interceptor, generic validators
├── shared/        reusable dumb components (error-banner, loading-indicator)
└── features/address/
    ├── data-access/   model, AddressApi, error mapping, pure rules
    ├── feature/       smart pages: address-form, address-detail, address-lookup
    └── ui/            dumb components: address-field, address-card
```

## Verification status

Written without network access, so `npm install`, `ng build` and `ng test` were **not** run.
What was checked: the framework-free modules compile under the project's own `tsconfig` (TypeScript 6.0)
and their logic passes tests in Node; every import and template/style path resolves; every component
used in a template is in its `imports`; layer boundaries hold. Run `npm test && npm run build` first.
If something fails, the likeliest places are the DOM specs' timing and Signal Forms typings.
`@Service()` can be swapped for `@Injectable({ providedIn: 'root' })` if needed.
