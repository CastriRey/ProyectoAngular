import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { NavComponent } from '../shared/nav/nav.component';
import { MarcaOption, Producto, TipoProductoOption } from './producto';
import { ProductosService } from './productos.service';

@Component({
  selector: 'app-productos-page',
  imports: [NavComponent, ReactiveFormsModule, DecimalPipe],
  templateUrl: './productos-page.html',
})
export class ProductosPage {
  private readonly service = inject(ProductosService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly marcas = signal<MarcaOption[]>([]);
  protected readonly tiposProducto = signal<TipoProductoOption[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly formularioVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly busqueda = signal('');
  protected readonly productosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.productos();
    return this.productos().filter((producto) => `${producto.codigo_producto} ${producto.nombre_producto} ${producto.marca_nombre ?? ''} ${producto.tipo_producto_nombre ?? ''}`.toLowerCase().includes(texto));
  });
  protected readonly form = this.formBuilder.nonNullable.group({
    codigo_producto: [0],
    nombre_producto: ['', Validators.required],
    codigo_marca: [0, [Validators.required, Validators.min(1)]],
    codigo_tipo_producto: [0, [Validators.required, Validators.min(1)]],
    modelo_producto: [''],
    precio_venta_producto: [0, [Validators.required, Validators.min(0)]],
    costo_producto: [0, [Validators.required, Validators.min(0)]],
    garantia_producto: [0, [Validators.required, Validators.min(0)]],
    descripcion_producto: [''],
    stock_disponible_producto: [0, [Validators.required, Validators.min(0)]],
    stock_minimo_producto: [0, [Validators.required, Validators.min(0)]],
    controla_stock: ['S' as 'S' | 'N', Validators.required],
    ultima_actualizacion_producto: [''],
  });

  constructor() {
    this.cargarDatos();
    const id = this.route.snapshot.paramMap.get('id');
    if (this.route.snapshot.url[0]?.path === 'nuevo') this.nuevo();
    if (id) this.editandoId.set(Number(id));
  }

  protected cargarDatos(): void {
    this.cargando.set(true);
    forkJoin({ productos: this.service.obtenerProductos(), marcas: this.service.obtenerMarcas(), tipos: this.service.obtenerTiposProducto() }).subscribe({
      next: ({ productos, marcas, tipos }) => {
        this.productos.set(productos);
        this.marcas.set(marcas);
        this.tiposProducto.set(tipos);
        this.cargando.set(false);
        const id = this.editandoId();
        if (id !== null) {
          const producto = productos.find((item) => item.codigo_producto === id);
          if (producto) this.cargarEnFormulario(producto);
          this.formularioVisible.set(true);
        }
      },
      error: () => { this.error.set('No se pudieron cargar los productos y sus opciones.'); this.cargando.set(false); },
    });
  }

  protected actualizarBusqueda(event: Event): void { this.busqueda.set((event.target as HTMLInputElement).value); }

  protected nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ codigo_producto: 0, nombre_producto: '', codigo_marca: 0, codigo_tipo_producto: 0, modelo_producto: '', precio_venta_producto: 0, costo_producto: 0, garantia_producto: 0, descripcion_producto: '', stock_disponible_producto: 0, stock_minimo_producto: 0, controla_stock: 'S', ultima_actualizacion_producto: '' });
    this.formularioVisible.set(true);
    void this.router.navigate(['/productos/nuevo']);
  }

  protected editar(producto: Producto): void {
    this.editandoId.set(producto.codigo_producto);
    this.cargarEnFormulario(producto);
    this.formularioVisible.set(true);
    void this.router.navigate(['/productos', producto.codigo_producto, 'editar']);
  }

  private cargarEnFormulario(producto: Producto): void {
    this.form.patchValue({ ...producto, modelo_producto: producto.modelo_producto ?? '', descripcion_producto: producto.descripcion_producto ?? '', ultima_actualizacion_producto: producto.ultima_actualizacion_producto ? producto.ultima_actualizacion_producto.slice(0, 16) : '' });
  }

  protected guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const datos = this.form.getRawValue();
    const request = this.editandoId() === null ? this.service.crearProducto(datos) : this.service.actualizarProducto(this.editandoId()!, datos);
    request.subscribe({ next: () => this.cancelar(), error: (respuesta) => { this.error.set(respuesta.error?.detail ?? 'No se pudo guardar el producto.'); this.guardando.set(false); } });
  }

  protected eliminar(producto: Producto): void {
    if (!confirm(`¿Eliminar el producto "${producto.nombre_producto}"?`)) return;
    this.service.eliminarProducto(producto.codigo_producto).subscribe({ next: () => this.cargarDatos(), error: () => this.error.set('No se pudo eliminar el producto.') });
  }

  protected cancelar(): void {
    this.formularioVisible.set(false);
    this.editandoId.set(null);
    this.guardando.set(false);
    void this.router.navigate(['/productos']);
    this.cargarDatos();
  }
}
