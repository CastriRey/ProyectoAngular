import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Venta } from './venta';

@Component({
  selector: 'app-ventas-list',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './ventas-list.component.html',
  styleUrl: './ventas-list.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class VentasListComponent {
  @Input({ required: true }) ventas: Venta[] = [];
  @Input({ required: true }) cargando = false;
  @Input({ required: true }) busqueda = '';
  @Output() readonly busquedaChange = new EventEmitter<string>();
  @Output() readonly nuevaVenta = new EventEmitter<void>();
  @Output() readonly verVenta = new EventEmitter<Venta>();
}
