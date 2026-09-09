import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Los identificadores llegan desde la API y no se conocen durante el build.
  { path: 'empleados/:id/**', renderMode: RenderMode.Client },
  { path: 'clientes/:id/**', renderMode: RenderMode.Client },
  { path: 'relojes-clientes/:id/**', renderMode: RenderMode.Client },
  { path: 'productos/:id/**', renderMode: RenderMode.Client },
  { path: 'marcas/:id/**', renderMode: RenderMode.Client },
  { path: 'tipos-producto/:id/**', renderMode: RenderMode.Client },
  { path: 'metodos-pago/:id/**', renderMode: RenderMode.Client },
  { path: 'ventas/:id', renderMode: RenderMode.Client },
  { path: 'ventas/crear', renderMode: RenderMode.Client },
  { path: 'servicios/:id/**', renderMode: RenderMode.Client },
  { path: 'tipos-servicio/:id/**', renderMode: RenderMode.Client },
  { path: 'estados-servicio/:id/**', renderMode: RenderMode.Client },
  { path: 'seguridad/roles/:id/**', renderMode: RenderMode.Client },
  { path: 'seguridad/perfiles/:id/**', renderMode: RenderMode.Client },
  { path: 'seguridad/rutas/:id/**', renderMode: RenderMode.Client },
  { path: 'seguridad/permisos/:id/**', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
