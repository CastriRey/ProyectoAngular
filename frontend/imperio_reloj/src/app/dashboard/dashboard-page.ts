import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { Cliente } from '../clientes/cliente';
import { ClientesService } from '../clientes/clientes.service';
import { NavComponent } from '../shared/nav/nav.component';
import { Producto } from '../productos/producto';
import { ProductosService } from '../productos/productos.service';
import { Servicio } from '../servicios/servicio';
import { ServiciosService } from '../servicios/servicios.service';
import { Venta } from '../ventas/venta';
import { VentasService } from '../ventas/ventas.service';

interface ChartPoint {
  label: string;
  value: number;
}

interface TopProduct {
  name: string;
  quantity: number;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, NavComponent],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css'],
})
export class DashboardPage {
  protected readonly authService = inject(AuthService);
  private readonly clientesService = inject(ClientesService);
  private readonly productosService = inject(ProductosService);
  private readonly serviciosService = inject(ServiciosService);
  private readonly ventasService = inject(VentasService);

  protected readonly nombre = this.authService.obtenerNombreUsuario();
  protected readonly fechaInicio = signal(this.primerDiaDelMes());
  protected readonly fechaFin = signal(this.fechaActual());
  protected readonly fechaInicioFiltro = signal(this.fechaInicio());
  protected readonly fechaFinFiltro = signal(this.fechaFin());
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly ventas = signal<Venta[]>([]);

  protected readonly ventasPeriodo = computed(() => this.ventas().filter((venta) => this.enPeriodo(venta.fecha_venta)));
  protected readonly serviciosPeriodo = computed(() => this.servicios().filter((servicio) => this.enPeriodo(servicio.fecha_servicio)));
  protected readonly clientesPeriodo = computed(() => this.clientes().filter((cliente) => this.enPeriodo(cliente.fecha_registro_cliente)));
  protected readonly ingresos = computed(() => this.ventasPeriodo().reduce((total, venta) => total + Number(venta.total_venta), 0));
  protected readonly pendientes = computed(() => this.serviciosPeriodo().filter((servicio) => !this.esFinalizado(servicio)).length);
  protected readonly terminadas = computed(() => this.serviciosPeriodo().filter((servicio) => this.esFinalizado(servicio)).length);
  protected readonly productosDisponibles = computed(() => this.productos().filter((producto) => producto.controla_stock !== 'S' || producto.stock_disponible_producto > 0).length);
  protected readonly stockBajo = computed(() => this.productos().filter((producto) => producto.controla_stock === 'S' && producto.stock_disponible_producto <= producto.stock_minimo_producto).length);
  protected readonly tasaFinalizacion = computed(() => {
    const total = this.pendientes() + this.terminadas();
    return total ? Math.round((this.terminadas() / total) * 100) : 0;
  });
  protected readonly ventasPorMes = computed(() => this.agruparPorMes(this.ventasPeriodo().map((venta) => venta.fecha_venta)));
  protected readonly clientesNuevosPorMes = computed(() => this.agruparPorMes(this.clientesPeriodo().map((cliente) => cliente.fecha_registro_cliente)));
  protected readonly estadosReparacion = computed(() => {
    const conteo = new Map<string, number>();
    for (const servicio of this.serviciosPeriodo()) {
      const estado = servicio.estado_servicio_nombre || `Estado ${servicio.codigo_estado_servicio}`;
      conteo.set(estado, (conteo.get(estado) ?? 0) + 1);
    }
    return Array.from(conteo, ([label, value]) => ({ label, value }));
  });
  protected readonly productosMasVendidos = computed(() => {
    const cantidades = new Map<string, number>();
    for (const venta of this.ventasPeriodo()) {
      for (const detalle of venta.detalles ?? []) {
        const producto = detalle.producto_nombre || this.nombreProducto(detalle.codigo_producto);
        cantidades.set(producto, (cantidades.get(producto) ?? 0) + Number(detalle.cantidad_producto));
      }
    }
    return Array.from(cantidades, ([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  });
  protected readonly alertasStock = computed(() => this.productos()
    .filter((producto) => producto.controla_stock === 'S' && producto.stock_disponible_producto <= producto.stock_minimo_producto)
    .sort((a, b) => a.stock_disponible_producto - b.stock_disponible_producto)
    .slice(0, 6));
  protected readonly reparacionesAtrasadas = computed(() => this.servicios()
    .filter((servicio) => !this.esFinalizado(servicio) && this.diasDesde(servicio.fecha_servicio) > 7)
    .slice(0, 6));

  constructor() {
    this.cargarDatos();
  }

  protected cargarDatos(): void {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      clientes: this.clientesService.obtenerClientes(),
      productos: this.productosService.obtenerProductos(),
      servicios: this.serviciosService.obtenerServicios(),
      ventas: this.ventasService.obtenerVentas(),
    }).subscribe({
      next: (datos) => {
        this.clientes.set(datos.clientes);
        this.productos.set(datos.productos);
        this.servicios.set(datos.servicios);
        this.ventas.set(datos.ventas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del dashboard. Verifica que la API esté disponible.');
        this.cargando.set(false);
      },
    });
  }

  protected aplicarFiltro(): void {
    const inicio = this.fechaInicioFiltro();
    const fin = this.fechaFinFiltro();
    if (!inicio || !fin || inicio > fin) {
      this.error.set('La fecha de inicio debe ser anterior o igual a la fecha final.');
      return;
    }
    this.error.set('');
    this.fechaInicio.set(inicio);
    this.fechaFin.set(fin);
  }

  protected limpiarFiltro(): void {
    const inicio = this.primerDiaDelMes();
    const fin = this.fechaActual();
    this.fechaInicioFiltro.set(inicio);
    this.fechaFinFiltro.set(fin);
    this.fechaInicio.set(inicio);
    this.fechaFin.set(fin);
    this.error.set('');
  }

  protected actualizarFechaInicio(event: Event): void {
    this.fechaInicioFiltro.set((event.target as HTMLInputElement).value);
  }

  protected actualizarFechaFin(event: Event): void {
    this.fechaFinFiltro.set((event.target as HTMLInputElement).value);
  }

  protected porcentajeEstado(value: number): number {
    const total = this.serviciosPeriodo().length;
    return total ? Math.round((value / total) * 100) : 0;
  }

  protected maxValue(points: ChartPoint[]): number {
    return Math.max(1, ...points.map((point) => point.value));
  }

  protected colorEstado(index: number): string {
    return ['#0d6efd', '#198754', '#f59e0b', '#dc3545', '#6f42c1', '#20c997'][index % 6];
  }

  protected formatearMoneda(value: number): string {
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value);
  }

  protected formatearFecha(value: string): string {
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(value));
  }

  private enPeriodo(value?: string): boolean {
    if (!value) return false;
    const fecha = value.slice(0, 10);
    return fecha >= this.fechaInicio() && fecha <= this.fechaFin();
  }

  private agruparPorMes(fechas: (string | undefined)[]): ChartPoint[] {
    const meses: ChartPoint[] = [];
    const inicio = new Date(`${this.fechaInicio()}T00:00:00`);
    const fin = new Date(`${this.fechaFin()}T00:00:00`);
    const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    while (cursor <= fin) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      meses.push({ label: new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(cursor), value: fechas.filter((fecha) => fecha?.slice(0, 7) === key).length });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return meses.slice(-12);
  }

  private esFinalizado(servicio: Servicio): boolean {
    const estado = servicio.estado_servicio_nombre?.toLowerCase() ?? '';
    return estado.includes('final') || estado.includes('entreg') || estado.includes('complet');
  }

  private diasDesde(value: string): number {
    return Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
  }

  private nombreProducto(id: number): string {
    return this.productos().find((producto) => producto.codigo_producto === id)?.nombre_producto || `Producto ${id}`;
  }

  private fechaActual(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private primerDiaDelMes(): string {
    const fecha = new Date();
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString().slice(0, 10);
  }
}
