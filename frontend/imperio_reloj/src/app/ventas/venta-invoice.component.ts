import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

import { Cliente } from '../clientes/cliente';
import { Producto } from '../productos/producto';
import { ServicioRelacionado, Venta } from './venta';

@Component({
  selector: 'app-venta-invoice',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './venta-invoice.component.html',
  styleUrl: './venta-invoice.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class VentaInvoiceComponent {
  @Input({ required: true }) venta!: Venta;
  @Input() cliente?: Cliente;
  @Input({ required: true }) productoDeVenta!: (id: number) => Producto | undefined;
  @Output() readonly imprimir = new EventEmitter<void>();
  @Output() readonly nuevaVenta = new EventEmitter<void>();
  @Output() readonly verVentas = new EventEmitter<void>();
}
