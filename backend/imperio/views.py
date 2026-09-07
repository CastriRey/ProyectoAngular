from django.contrib.auth.hashers import check_password
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Cliente, Empleado, Permiso, Perfil, Rol, Ruta
from .serializers import (
	ClienteSerializer,
	EmpleadoSerializer,
	PermisoSerializer,
	PerfilSerializer,
	RolSerializer,
	RutaSerializer,
)


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login_empleado(request):
	# El frontend envía estas dos propiedades desde el formulario de login.
	correo = request.data.get('correo')
	contrasena = request.data.get('contrasena')

	if not correo or not contrasena:
		return Response(
			{'error': 'Correo y contraseña son obligatorios'},
			status=status.HTTP_400_BAD_REQUEST,
		)

	try:
		empleado = Empleado.objects.get(correo_empleado__iexact=correo)
	except Empleado.DoesNotExist:
		return Response(
			{'error': 'Credenciales inválidas'},
			status=status.HTTP_401_UNAUTHORIZED,
		)

	# check_password compara la contraseña recibida contra el hash almacenado.
	if not check_password(contrasena, empleado.password):
		return Response(
			{'error': 'Credenciales inválidas'},
			status=status.HTTP_401_UNAUTHORIZED,
		)

	# RefreshToken genera un token corto de acceso y otro de renovación.
	refresh = RefreshToken.for_user(empleado)
	return Response({
		'mensaje': 'Login exitoso',
		'empleado': {
			'id': empleado.identificacion_empleado,
			'nombre': empleado.nombre_empleado,
			'primer_apellido': empleado.primer_apellido_empleado,
			'correo': empleado.correo_empleado,
			'perfil': empleado.codigo_perfil_empleado,
		},
		'access': str(refresh.access_token),
		'refresh': str(refresh),
	})


class ClienteViewSet(viewsets.ModelViewSet):
	queryset = Cliente.objects.all().order_by('identificacion_cliente')
	serializer_class = ClienteSerializer


class EmpleadoViewSet(viewsets.ModelViewSet):
	queryset = Empleado.objects.all().order_by('identificacion_empleado')
	serializer_class = EmpleadoSerializer


class RolViewSet(viewsets.ModelViewSet):
	queryset = Rol.objects.all().order_by('codigo_rol')
	serializer_class = RolSerializer


class PerfilViewSet(viewsets.ModelViewSet):
	queryset = Perfil.objects.all().order_by('codigo_perfil')
	serializer_class = PerfilSerializer


class RutaViewSet(viewsets.ModelViewSet):
	queryset = Ruta.objects.all().order_by('codigo_ruta')
	serializer_class = RutaSerializer


class PermisoViewSet(viewsets.ModelViewSet):
	queryset = Permiso.objects.all().order_by('codigo_perfil_permiso', 'codigo_ruta_permiso')
	serializer_class = PermisoSerializer
