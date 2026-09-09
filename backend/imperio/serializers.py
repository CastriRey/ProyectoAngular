from django.db import transaction
from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from .models import Cliente, DetalleVenta, Empleado, EstadoServicio, Marca, MetodoPago, Permiso, Perfil, Producto, RelojCliente, Rol, Ruta, Servicio, TipoProducto, TipoServicio, Venta


class ClienteSerializer(serializers.ModelSerializer):
	class Meta:
		model = Cliente
		fields = '__all__'


class EmpleadoSerializer(serializers.ModelSerializer):
	# La contraseña nunca se devuelve en las respuestas JSON.
	password = serializers.CharField(write_only=True, required=False)
	perfil_nombre = serializers.SerializerMethodField()

	class Meta:
		model = Empleado
		fields = '__all__'

	def get_perfil_nombre(self, empleado):
		# Mostramos el nombre del perfil para evitar otra petición desde Angular.
		perfil = Perfil.objects.filter(codigo_perfil=empleado.codigo_perfil_empleado).first()
		return perfil.nombre_perfil if perfil else f'Perfil {empleado.codigo_perfil_empleado}'

	def create(self, validated_data):
		# El hash evita guardar contraseñas legibles en PostgreSQL.
		password = validated_data.get('password')
		if not password:
			raise serializers.ValidationError({'password': 'La contraseña es obligatoria al crear un empleado.'})
		validated_data['password'] = make_password(password)
		return super().create(validated_data)

	def update(self, instance, validated_data):
		# Si el usuario deja la contraseña vacía al editar, conservamos la actual.
		password = validated_data.pop('password', None)
		if password:
			instance.password = make_password(password)
		return super().update(instance, validated_data)


class RolSerializer(serializers.ModelSerializer):
	class Meta:
		model = Rol
		fields = '__all__'


class PerfilSerializer(serializers.ModelSerializer):
	class Meta:
		model = Perfil
		fields = '__all__'


class RutaSerializer(serializers.ModelSerializer):
	class Meta:
		model = Ruta
		fields = '__all__'


class PermisoSerializer(serializers.ModelSerializer):
	class Meta:
		model = Permiso
		fields = '__all__'


class MarcaSerializer(serializers.ModelSerializer):
	class Meta:
		model = Marca
		fields = '__all__'


class MetodoPagoSerializer(serializers.ModelSerializer):
	class Meta:
		model = MetodoPago
		fields = '__all__'


class TipoServicioSerializer(serializers.ModelSerializer):
	class Meta:
		model = TipoServicio
		fields = '__all__'


class EstadoServicioSerializer(serializers.ModelSerializer):
	class Meta:
		model = EstadoServicio
		fields = '__all__'


class TipoProductoSerializer(serializers.ModelSerializer):
	class Meta:
		model = TipoProducto
		fields = '__all__'


class ProductoSerializer(serializers.ModelSerializer):
	marca_nombre = serializers.SerializerMethodField()
	tipo_producto_nombre = serializers.SerializerMethodField()

	class Meta:
		model = Producto
		fields = '__all__'
		read_only_fields = ('marca_nombre', 'tipo_producto_nombre')

	def get_marca_nombre(self, producto):
		marca = Marca.objects.filter(codigo_marca=producto.codigo_marca).first()
		return marca.nombre_marca if marca else f'Marca {producto.codigo_marca}'

	def get_tipo_producto_nombre(self, producto):
		tipo = TipoProducto.objects.filter(codigo_tipo_producto=producto.codigo_tipo_producto).first()
		return tipo.nombre_tipo_producto if tipo else f'Tipo {producto.codigo_tipo_producto}'


class DetalleVentaSerializer(serializers.ModelSerializer):
	producto_nombre = serializers.SerializerMethodField()

	class Meta:
		model = DetalleVenta
		fields = '__all__'
		read_only_fields = ('producto_nombre',)

	def get_producto_nombre(self, detalle):
		producto = Producto.objects.filter(codigo_producto=detalle.codigo_producto).first()
		return producto.nombre_producto if producto else f'Producto {detalle.codigo_producto}'


class VentaSerializer(serializers.ModelSerializer):
	detalles = serializers.SerializerMethodField()
	cliente_nombre = serializers.SerializerMethodField()
	empleado_nombre = serializers.SerializerMethodField()
	metodo_pago_nombre = serializers.SerializerMethodField()
	lineas = serializers.ListField(write_only=True, required=False)

	class Meta:
		model = Venta
		fields = ('codigo_venta', 'identificacion_cliente_venta', 'identificacion_empleado_venta', 'total_venta', 'fecha_venta', 'codigo_metodo_pago', 'detalles', 'cliente_nombre', 'empleado_nombre', 'metodo_pago_nombre', 'lineas')
		read_only_fields = ('cliente_nombre', 'empleado_nombre', 'metodo_pago_nombre', 'detalles')

	def get_detalles(self, venta):
		items = DetalleVenta.objects.filter(codigo_venta=venta.codigo_venta)
		return DetalleVentaSerializer(items, many=True).data

	def get_cliente_nombre(self, venta):
		cliente = Cliente.objects.filter(identificacion_cliente=venta.identificacion_cliente_venta).first()
		return f'{cliente.nombre_cliente} {cliente.primer_apellido_cliente}' if cliente else f'Cliente {venta.identificacion_cliente_venta}'

	def get_empleado_nombre(self, venta):
		empleado = Empleado.objects.filter(identificacion_empleado=venta.identificacion_empleado_venta).first()
		return f'{empleado.nombre_empleado} {empleado.primer_apellido_empleado}' if empleado else f'Empleado {venta.identificacion_empleado_venta}'

	def get_metodo_pago_nombre(self, venta):
		metodo = MetodoPago.objects.filter(codigo_metodo_pago=venta.codigo_metodo_pago).first()
		return metodo.nombre_metodo_pago if metodo else f'Método {venta.codigo_metodo_pago}'

	def create(self, validated_data):
		lineas = validated_data.pop('lineas', [])
		if not lineas:
			raise serializers.ValidationError({'lineas': 'La venta debe incluir al menos un producto.'})
		with transaction.atomic():
			venta = Venta.objects.create(**validated_data)
			for linea in lineas:
				DetalleVenta.objects.create(codigo_venta=venta.codigo_venta, **linea)
		return venta


class RelojClienteSerializer(serializers.ModelSerializer):
	cliente_nombre = serializers.SerializerMethodField()
	marca_nombre = serializers.SerializerMethodField()

	class Meta:
		model = RelojCliente
		fields = '__all__'
		read_only_fields = ('cliente_nombre', 'marca_nombre')

	def get_cliente_nombre(self, reloj):
		cliente = Cliente.objects.filter(identificacion_cliente=reloj.codigo_cliente).first()
		return f'{cliente.nombre_cliente} {cliente.primer_apellido_cliente}' if cliente else f'Cliente {reloj.codigo_cliente}'

	def get_marca_nombre(self, reloj):
		marca = Marca.objects.filter(codigo_marca=reloj.codigo_marca).first()
		return marca.nombre_marca if marca else f'Marca {reloj.codigo_marca}'


class ServicioSerializer(serializers.ModelSerializer):
	tecnico_nombre = serializers.SerializerMethodField()
	tipo_servicio_nombre = serializers.SerializerMethodField()
	estado_servicio_nombre = serializers.SerializerMethodField()
	reloj_cliente_nombre = serializers.SerializerMethodField()
	cliente_nombre = serializers.SerializerMethodField()

	class Meta:
		model = Servicio
		fields = '__all__'
		read_only_fields = ('tecnico_nombre', 'tipo_servicio_nombre', 'estado_servicio_nombre', 'reloj_cliente_nombre', 'cliente_nombre')

	def get_tecnico_nombre(self, servicio):
		empleado = Empleado.objects.filter(identificacion_empleado=servicio.codigo_tecnico).first()
		return f'{empleado.nombre_empleado} {empleado.primer_apellido_empleado}' if empleado else f'Técnico {servicio.codigo_tecnico}'

	def get_tipo_servicio_nombre(self, servicio):
		tipo = TipoServicio.objects.filter(codigo_tipo_servicio=servicio.codigo_tipo_servicio).first()
		return tipo.nombre_tipo_servicio if tipo else f'Tipo {servicio.codigo_tipo_servicio}'

	def get_estado_servicio_nombre(self, servicio):
		estado = EstadoServicio.objects.filter(codigo_estado_servicio=servicio.codigo_estado_servicio).first()
		return estado.nombre_estado_reparacion if estado else f'Estado {servicio.codigo_estado_servicio}'

	def get_reloj_cliente_nombre(self, servicio):
		reloj = RelojCliente.objects.filter(codigo_reloj_cliente=servicio.codigo_reloj_cliente).first()
		marca = Marca.objects.filter(codigo_marca=reloj.codigo_marca).first() if reloj else None
		return f'{reloj.codigo_reloj_cliente} - {marca.nombre_marca if marca else "Reloj"} {reloj.modelo if reloj else ""}'

	def get_cliente_nombre(self, servicio):
		reloj = RelojCliente.objects.filter(codigo_reloj_cliente=servicio.codigo_reloj_cliente).first()
		cliente = Cliente.objects.filter(identificacion_cliente=reloj.codigo_cliente).first() if reloj else None
		return f'{cliente.nombre_cliente} {cliente.primer_apellido_cliente}' if cliente else 'Cliente no disponible'
