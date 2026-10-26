import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Cliente } from '../clientes/cliente';
import { Empleado } from '../empleados/empleado';
import { Producto } from '../productos/producto';
import { MetodoPagoOption } from './ventas.service';
import { ServicioRelacionado, VentaLinea } from './venta';

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe],
  templateUrl: './venta-form.component.html',
  styleUrl: './venta-form.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class VentaFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) clientes: Cliente[] = [];
  @Input({ required: true }) productos: Producto[] = [];
  @Input({ required: true }) metodosPago: MetodoPagoOption[] = [];
  @Input({ required: true }) serviciosFinalizados: ServicioRelacionado[] = [];
  @Input({ required: true }) serviciosSeleccionados: number[] = [];
  @Input({ required: true }) lineas: VentaLinea[] = [];
  @Input({ required: true }) total = 0;
  @Input({ required: true }) productoSeleccionado: Producto | null = null;
  @Input({ required: true }) cantidadSeleccionada = 1;
  @Input({ required: true }) guardando = false;
  @Input({ required: true }) error = '';
  @Output() readonly clienteChange = new EventEmitter<void>();
  @Output() readonly servicioChange = new EventEmitter<{ id: number; event: Event }>();
  @Output() readonly productoChange = new EventEmitter<void>();
  @Output() readonly cantidadChange = new EventEmitter<Event>();
  @Output() readonly agregarProducto = new EventEmitter<void>();
  @Output() readonly quitarProducto = new EventEmitter<VentaLinea>();
  @Output() readonly completarVenta = new EventEmitter<void>();
  @Output() readonly cancelar = new EventEmitter<void>();

  stockRestante(): number | null {
    const producto = this.productoSeleccionado;
    if (!producto || producto.controla_stock !== 'S') return null;
    const agregado = this.lineas.find((linea) => linea.codigo_producto === producto.codigo_producto)?.cantidad_producto ?? 0;
    return producto.stock_disponible_producto - agregado;
  }

  stockInsuficiente(): boolean {
    const restante = this.stockRestante();
    return restante !== null && this.cantidadSeleccionada > restante;
  }
}
