from django.db import models
from django.utils import timezone


class Auditoria(models.Model):
	# Registra cambios importantes realizados sobre las tablas del sistema.
	id_auditoria = models.AutoField(primary_key=True)
	tabla_afectada = models.CharField(max_length=50, blank=True, null=True)
	operacion = models.CharField(max_length=1, blank=True, null=True)
	momento = models.CharField(max_length=1, blank=True, null=True)
	usuario_bd = models.CharField(max_length=30, blank=True, null=True)
	fecha_evento = models.DateTimeField(blank=True, null=True)
	descripcion = models.CharField(max_length=1000, blank=True, null=True)

	class Meta:
		db_table = 'auditoria'


class ErrorSistema(models.Model):
	# Guarda errores de negocio o de infraestructura para poder auditarlos.
	codigo_error = models.AutoField(primary_key=True)
	descripcion_error = models.CharField(max_length=255, blank=True, null=True)

	class Meta:
		db_table = 'errores_sistema'


class Rol(models.Model):
	# Un rol agrupa una categoría general de permisos.
	codigo_rol = models.AutoField(primary_key=True)
	nombre_rol = models.CharField(max_length=50)

	class Meta:
		db_table = 'roles'


class Perfil(models.Model):
	# Un perfil concreta los permisos que recibe un empleado.
	codigo_perfil = models.AutoField(primary_key=True)
	nombre_perfil = models.CharField(max_length=50)
	# Se mantiene como entero en esta primera etapa para respetar los datos existentes.
	codigo_rol = models.IntegerField()

	class Meta:
		db_table = 'perfiles'


class Empleado(models.Model):
	# La cédula identifica de forma única al empleado dentro del sistema.
	identificacion_empleado = models.IntegerField(primary_key=True)
	nombre_empleado = models.CharField(max_length=40)
	primer_apellido_empleado = models.CharField(max_length=30)
	segundo_apellido_empleado = models.CharField(max_length=30, blank=True)
	correo_empleado = models.EmailField(max_length=100, unique=True)
	telefono_empleado = models.CharField(max_length=20, blank=True, null=True)
	direccion_empleado = models.CharField(max_length=100, blank=True, null=True)
	# Se almacena un hash; nunca la contraseña escrita directamente.
	password = models.CharField(max_length=200, db_column='hash_contrasena_empleado')
	# Se mantiene como entero hasta migrar también la carga inicial de perfiles.
	codigo_perfil_empleado = models.IntegerField()

	class Meta:
		db_table = 'empleados'

	@property
	def id(self):
		# SimpleJWT necesita una propiedad id para incluir el identificador en el token.
		return self.identificacion_empleado


class Cliente(models.Model):
	# Documento y datos de contacto de la persona que compra o solicita servicios.
	identificacion_cliente = models.IntegerField(primary_key=True)
	nombre_cliente = models.CharField(max_length=40)
	primer_apellido_cliente = models.CharField(max_length=40)
	segundo_apellido_cliente = models.CharField(max_length=40, blank=True, null=True)
	correo_cliente = models.EmailField(max_length=100, unique=True, blank=True, null=True)
	telefono_cliente = models.CharField(max_length=20, blank=True, null=True)
	fecha_registro_cliente = models.DateTimeField(default=timezone.now)
	# Identifica al empleado que registró o atiende al cliente.
	identificacion_empleado = models.IntegerField()
	comentarios = models.CharField(max_length=150, blank=True, null=True)

	class Meta:
		db_table = 'clientes'

	def __str__(self):
		return f'{self.nombre_cliente} {self.primer_apellido_cliente}'


class Ruta(models.Model):
	# Representa una URL del sistema que puede protegerse con permisos.
	codigo_ruta = models.AutoField(primary_key=True)
	nombre_ruta = models.CharField(max_length=50)
	url_ruta = models.CharField(max_length=200)
	nodo_ruta = models.CharField(max_length=1)
	padre_ruta = models.IntegerField(blank=True, null=True)
	orden_ruta = models.IntegerField()

	class Meta:
		db_table = 'rutas'


class Permiso(models.Model):
	# La clave compuesta identifica un permiso por perfil y por ruta.
	codigo_perfil_permiso = models.IntegerField()
	codigo_ruta_permiso = models.IntegerField()
	consultar = models.CharField(max_length=1)
	insertar = models.CharField(max_length=1)
	modificar = models.CharField(max_length=1)
	eliminar = models.CharField(max_length=1)

	class Meta:
		db_table = 'permisos'
		constraints = [
			models.UniqueConstraint(
				fields=('codigo_perfil_permiso', 'codigo_ruta_permiso'),
				name='uq_permisos_perfil_ruta',
			),
		]


class Marca(models.Model):
	# Fabricante de un reloj o de otro producto vendido.
	codigo_marca = models.AutoField(primary_key=True)
	nombre_marca = models.CharField(max_length=20)

	class Meta:
		db_table = 'marcas'


class TipoProducto(models.Model):
	# Categoría de un producto: reloj, repuesto, accesorio, etc.
	codigo_tipo_producto = models.AutoField(primary_key=True)
	nombre_tipo_producto = models.CharField(max_length=40)

	class Meta:
		db_table = 'tipo_productos'


class Producto(models.Model):
	# Artículo que puede venderse y, opcionalmente, controlar inventario.
	codigo_producto = models.AutoField(primary_key=True)
	nombre_producto = models.CharField(max_length=40)
	codigo_marca = models.IntegerField()
	codigo_tipo_producto = models.IntegerField()
	modelo_producto = models.CharField(max_length=15, blank=True, null=True)
	precio_venta_producto = models.DecimalField(max_digits=10, decimal_places=2)
	costo_producto = models.DecimalField(max_digits=10, decimal_places=2)
	garantia_producto = models.IntegerField()
	descripcion_producto = models.CharField(max_length=255, blank=True, null=True)
	stock_disponible_producto = models.IntegerField()
	stock_minimo_producto = models.IntegerField()
	controla_stock = models.CharField(max_length=1)
	ultima_actualizacion_producto = models.DateTimeField(blank=True, null=True)

	class Meta:
		db_table = 'productos'
		constraints = [
			models.CheckConstraint(
				condition=models.Q(controla_stock__in=('S', 'N')),
				name='ck_productos_control_stock',
			),
		]


class MetodoPago(models.Model):
	# Forma en la que se paga una venta.
	codigo_metodo_pago = models.AutoField(primary_key=True)
	nombre_metodo_pago = models.CharField(max_length=30)

	class Meta:
		db_table = 'metodos_pago'


class Venta(models.Model):
	# Cabecera de una factura: cliente, empleado, fecha, total y pago.
	codigo_venta = models.AutoField(primary_key=True)
	identificacion_cliente_venta = models.IntegerField()
	identificacion_empleado_venta = models.IntegerField()
	total_venta = models.DecimalField(max_digits=10, decimal_places=2)
	fecha_venta = models.DateTimeField()
	codigo_metodo_pago = models.IntegerField()

	class Meta:
		db_table = 'ventas'


class DetalleVenta(models.Model):
	# Línea individual de una venta: producto, cantidad y precio aplicado.
	codigo_detalle_venta = models.AutoField(primary_key=True)
	codigo_venta = models.IntegerField()
	codigo_producto = models.IntegerField()
	cantidad_producto = models.IntegerField()
	precio_unitario_producto = models.DecimalField(max_digits=10, decimal_places=2)

	class Meta:
		db_table = 'detalle_ventas'


class TipoServicio(models.Model):
	# Catálogo de trabajos técnicos que puede realizar el taller.
	codigo_tipo_servicio = models.AutoField(primary_key=True)
	nombre_tipo_servicio = models.CharField(max_length=30)

	class Meta:
		db_table = 'tipos_servicio'


class EstadoServicio(models.Model):
	# Estado actual de una reparación, por ejemplo recibido o terminado.
	codigo_estado_servicio = models.AutoField(primary_key=True)
	nombre_estado_reparacion = models.CharField(max_length=20)

	class Meta:
		db_table = 'estados_servicio'


class RelojCliente(models.Model):
	# Reloj propiedad de un cliente que puede entrar a servicio técnico.
	codigo_reloj_cliente = models.AutoField(primary_key=True)
	codigo_cliente = models.IntegerField()
	codigo_marca = models.IntegerField()
	modelo = models.CharField(max_length=15)
	descripcion_reloj = models.CharField(max_length=200, blank=True, null=True)

	class Meta:
		db_table = 'relojes_cliente'


class Servicio(models.Model):
	# Orden de reparación asociada a un reloj y a un técnico.
	codigo_servicio = models.AutoField(primary_key=True)
	codigo_tecnico = models.IntegerField()
	codigo_tipo_servicio = models.IntegerField()
	codigo_estado_servicio = models.IntegerField()
	codigo_reloj_cliente = models.IntegerField()
	codigo_detalle_venta = models.IntegerField(blank=True, null=True)
	fecha_servicio = models.DateTimeField()
	descripcion_falla = models.CharField(max_length=500)

	class Meta:
		db_table = 'servicios'
