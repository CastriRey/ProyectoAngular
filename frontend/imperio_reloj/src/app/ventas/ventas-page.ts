import { Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { apiErrorMessage, formValidationMessage } from '../shared/form-errors';
import { PermissionService } from '../auth/permission.service';

import { Cliente } from '../clientes/cliente';
import { Empleado } from '../empleados/empleado';
import { Producto } from '../productos/producto';
import { NavComponent } from '../shared/nav/nav.component';
import { AuthService } from '../auth/auth.service';
import { ServicioRelacionado, Venta, VentaLinea } from './venta';
import { MetodoPagoOption, VentasService } from './ventas.service';
import { VentaFormComponent } from './venta-form.component';
import { VentaInvoiceComponent } from './venta-invoice.component';
import { VentasListComponent } from './ventas-list.component';

@Component({
  selector: 'app-ventas-page',
  imports: [NavComponent, VentasListComponent, VentaFormComponent, VentaInvoiceComponent],
  templateUrl: './ventas-page.html',
  styleUrl: './ventas-page.css',
  encapsulation: ViewEncapsulation.None,
})
export class VentasPage {
  private readonly service = inject(VentasService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly permissionService = inject(PermissionService);
  private readonly authService = inject(AuthService);

  protected readonly ventas = signal<Venta[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly metodosPago = signal<MetodoPagoOption[]>([]);
  protected readonly servicios = signal<ServicioRelacionado[]>([]);
  protected readonly serviciosSeleccionados = signal<number[]>([]);
  protected readonly lineas = signal<VentaLinea[]>([]);
  protected readonly productoSeleccionado = signal<Producto | null>(null);
  protected readonly cantidadSeleccionada = signal(1);
  protected readonly ventaSeleccionada = signal<Venta | null>(null);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly formularioVisible = signal(false);
  protected readonly error = signal('');
  protected readonly busqueda = signal('');
  protected readonly total = computed(() => this.lineas().reduce((total, linea) => total + Number(linea.precio_unitario_producto) * linea.cantidad_producto, 0));
  protected readonly ventasFiltradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.ventas();
    return this.ventas().filter((venta) => `${venta.codigo_venta} ${venta.cliente_nombre ?? ''} ${venta.empleado_nombre ?? ''} ${venta.metodo_pago_nombre ?? ''} ${venta.fecha_venta}`.toLowerCase().includes(texto));
  });
  protected readonly productoLookup = (id: number): Producto | undefined => this.productoDeVenta(id);
  protected readonly form = this.formBuilder.nonNullable.group({
    identificacion_cliente_venta: [0, [Validators.required, Validators.min(1)]],
    identificacion_empleado_venta: [0, [Validators.required, Validators.min(1)]],
    codigo_metodo_pago: [0, [Validators.required, Validators.min(1)]],
    codigo_producto: [0, [Validators.required, Validators.min(1)]],
    cantidad_producto: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.cargarDatos();
    const id = this.route.snapshot.paramMap.get('id');
    if (this.route.snapshot.url[0]?.path === 'nueva' || this.route.snapshot.url[0]?.path === 'crear') this.formularioVisible.set(true);
    if (id) this.cargarDetalle(Number(id));
  }

  protected cargarDatos(): void {
    this.cargando.set(true);
    forkJoin({
      ventas: this.service.obtenerVentas(),
      clientes: this.service.obtenerClientes().pipe(catchError(() => of([] as Cliente[]))),
      empleados: this.service.obtenerEmpleados().pipe(catchError(() => of([] as Empleado[]))),
      productos: this.service.obtenerProductos().pipe(catchError(() => of([] as Producto[]))),
      metodosPago: this.service.obtenerMetodosPago().pipe(catchError(() => of([] as MetodoPagoOption[]))),
      servicios: this.service.obtenerServicios().pipe(catchError(() => of([] as ServicioRelacionado[]))),
    }).subscribe({
      next: (datos) => { this.ventas.set(datos.ventas); this.clientes.set(datos.clientes); this.empleados.set(datos.empleados); this.productos.set(datos.productos); this.metodosPago.set(datos.metodosPago); this.servicios.set(datos.servicios); this.asignarEmpleadoActual(datos.empleados); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar las ventas y sus opciones.'); this.cargando.set(false); },
    });
  }

  private asignarEmpleadoActual(empleados: Empleado[]): void {
    const id = this.authService.obtenerIdUsuario();
    const correo = typeof localStorage !== 'undefined' ? localStorage.getItem('user_correo') : null;
    const empleado = (id ? empleados.find((item) => item.identificacion_empleado === id) : undefined)
      ?? empleados.find((item) => item.correo_empleado === correo);
    if (empleado) this.form.controls.identificacion_empleado_venta.setValue(empleado.identificacion_empleado);
  }

  protected cargarDetalle(id: number): void { this.service.obtenerVenta(id).subscribe({ next: (venta) => this.ventaSeleccionada.set(venta), error: () => this.error.set('No se pudo cargar el detalle de la venta.') }); }
  protected actualizarBusqueda(event: Event): void { this.busqueda.set((event.target as HTMLInputElement).value); }
  protected serviciosFinalizadosDelCliente(): ServicioRelacionado[] {
    const clienteId = this.form.controls.identificacion_cliente_venta.value;
    return this.servicios().filter((servicio) => servicio.cliente_id === clienteId && servicio.estado_servicio_nombre?.toLowerCase().includes('final') && !servicio.codigo_detalle_venta);
  }
  protected nombreCliente(id: number): string {
    const cliente = this.clientes().find((item) => item.identificacion_cliente === id);
    return cliente ? `${cliente.nombre_cliente} ${cliente.primer_apellido_cliente}` : '';
  }
  protected cambiarCliente(): void { this.serviciosSeleccionados.set([]); }
  protected alternarServicio(id: number, event: Event): void { const checked = (event.target as HTMLInputElement).checked; this.serviciosSeleccionados.update((ids) => checked ? [...ids, id] : ids.filter((actual) => actual !== id)); }
  protected nueva(): void { this.formularioVisible.set(true); this.ventaSeleccionada.set(null); void this.router.navigate(['/ventas/crear']); }
  protected ver(venta: Venta): void { this.formularioVisible.set(false); void this.router.navigate(['/ventas', venta.codigo_venta]); this.cargarDetalle(venta.codigo_venta); }

  protected clienteDeVenta(): Cliente | undefined {
    const venta = this.ventaSeleccionada();
    return venta ? this.clientes().find((cliente) => cliente.identificacion_cliente === venta.identificacion_cliente_venta) : undefined;
  }

  protected productoDeVenta(id: number): Producto | undefined {
    return this.productos().find((producto) => producto.codigo_producto === id);
  }

  protected imprimirFactura(): void {
    window.print();
  }

  protected agregarProducto(): void {
    if (this.form.controls.codigo_producto.invalid || this.form.controls.cantidad_producto.invalid) { this.form.controls.codigo_producto.markAsTouched(); this.form.controls.cantidad_producto.markAsTouched(); return; }
    const id = this.form.controls.codigo_producto.value;
    const producto = this.productos().find((item) => item.codigo_producto === id);
    if (!producto) return;
    const cantidad = this.form.controls.cantidad_producto.value;
    const existente = this.lineas().find((linea) => linea.codigo_producto === id);
    const cantidadFinal = (existente?.cantidad_producto ?? 0) + cantidad;
    if (producto.controla_stock === 'S' && cantidadFinal > producto.stock_disponible_producto) {
      this.error.set(`No hay stock suficiente de "${producto.nombre_producto}". Disponible: ${producto.stock_disponible_producto} unidad(es).`);
      return;
    }
    this.error.set('');
    if (existente) this.lineas.update((lineas) => lineas.map((linea) => linea.codigo_producto === id ? { ...linea, cantidad_producto: linea.cantidad_producto + cantidad } : linea));
    else this.lineas.update((lineas) => [...lineas, { codigo_producto: id, nombre_producto: producto.nombre_producto, cantidad_producto: cantidad, precio_unitario_producto: Number(producto.precio_venta_producto), codigo_venta: 0 }]);
    this.form.controls.codigo_producto.reset(0);
    this.form.controls.cantidad_producto.reset(1);
    this.productoSeleccionado.set(null);
    this.cantidadSeleccionada.set(1);
  }

  protected quitarProducto(linea: VentaLinea): void { this.lineas.update((lineas) => lineas.filter((actual) => actual.codigo_producto !== linea.codigo_producto)); }

  protected actualizarProductoSeleccionado(): void {
    this.productoSeleccionado.set(this.productos().find((producto) => producto.codigo_producto === this.form.controls.codigo_producto.value) ?? null);
    this.error.set('');
  }

  protected actualizarCantidad(event: Event): void {
    this.cantidadSeleccionada.set(Number((event.target as HTMLInputElement).value) || 0);
  }

  protected stockRestante(): number | null {
    const producto = this.productoSeleccionado();
    if (!producto || producto.controla_stock !== 'S') return null;
    const agregado = this.lineas().find((linea) => linea.codigo_producto === producto.codigo_producto)?.cantidad_producto ?? 0;
    return producto.stock_disponible_producto - agregado;
  }

  protected stockInsuficiente(): boolean {
    const restante = this.stockRestante();
    return restante !== null && this.cantidadSeleccionada() > restante;
  }

  protected completarVenta(): void {
    this.guardar();
  }

  protected guardar(): void {
    this.error.set('');
    const datos = this.form.getRawValue();
    const clienteId = Number(datos.identificacion_cliente_venta);
    const empleadoId = Number(datos.identificacion_empleado_venta);
    const metodoPagoId = Number(datos.codigo_metodo_pago);
    const ventaInvalida = clienteId < 1 || empleadoId < 1 || metodoPagoId < 1;
    if (ventaInvalida || (this.lineas().length === 0 && this.serviciosSeleccionados().length === 0)) {
      if (ventaInvalida) {
        this.form.controls.identificacion_cliente_venta.markAsTouched();
        this.form.controls.identificacion_empleado_venta.markAsTouched();
        this.form.controls.codigo_metodo_pago.markAsTouched();
        this.error.set(formValidationMessage(this.form));
      } else {
        this.error.set('Agrega al menos un producto o servicio a la venta.');
      }
      return;
    }
    this.guardando.set(true);
    this.service.crearVenta({ identificacion_cliente_venta: clienteId, identificacion_empleado_venta: empleadoId, codigo_metodo_pago: metodoPagoId, total_venta: this.total(), fecha_venta: new Date().toISOString(), lineas: this.lineas().map((linea) => ({ codigo_producto: linea.codigo_producto, cantidad_producto: linea.cantidad_producto, precio_unitario_producto: linea.precio_unitario_producto })), servicios: this.serviciosSeleccionados() }).subscribe({
      next: (venta) => {
        this.guardando.set(false);
        this.formularioVisible.set(false);
        this.lineas.set([]);
        this.serviciosSeleccionados.set([]);
        this.ventaSeleccionada.set(venta);
        void this.router.navigate(['/ventas', venta.codigo_venta]);
        this.cargarDatos();
      },
      error: (respuesta) => {
        const detalle = respuesta.error && typeof respuesta.error === 'object' ? Object.values(respuesta.error).flat().join(' ') : '';
        this.error.set(apiErrorMessage(respuesta.error, `No se pudo guardar la venta (${respuesta.status || 'sin respuesta del servidor'}).`));
        this.guardando.set(false);
      },
    });
  }

  protected cancelar(): void { this.formularioVisible.set(false); this.lineas.set([]); this.error.set(''); void this.router.navigate(['/ventas']); this.cargarDatos(); }
}
