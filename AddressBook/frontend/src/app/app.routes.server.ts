import { RenderMode, type ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static page: safe to prerender at build time.
  { path: 'create', renderMode: RenderMode.Prerender },
  // Parameterised and data-driven: render per request on the server.
  { path: 'address/:id', renderMode: RenderMode.Server },
  // Root redirect, unknown URLs.
  { path: '**', renderMode: RenderMode.Server },
];
