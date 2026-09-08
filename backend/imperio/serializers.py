from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from .models import Cliente, Empleado, EstadoServicio, Marca, MetodoPago, Permiso, Perfil, Producto, Rol, Ruta, TipoProducto, TipoServicio


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
