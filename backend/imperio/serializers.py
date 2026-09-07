from rest_framework import serializers

from .models import Cliente, Permiso, Perfil, Rol, Ruta


class ClienteSerializer(serializers.ModelSerializer):
	class Meta:
		model = Cliente
		fields = '__all__'


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
