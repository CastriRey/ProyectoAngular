from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
	ClienteViewSet,
	EmpleadoViewSet,
	PermisoViewSet,
	PerfilViewSet,
	RolViewSet,
	RutaViewSet,
	login_empleado,
)


router = DefaultRouter()
router.register('clientes', ClienteViewSet, basename='cliente')
router.register('empleados', EmpleadoViewSet, basename='empleado')
router.register('roles', RolViewSet, basename='rol')
router.register('perfiles', PerfilViewSet, basename='perfil')
router.register('rutas', RutaViewSet, basename='ruta')
router.register('permisos', PermisoViewSet, basename='permiso')

urlpatterns = [
	# Esta ruta es pública porque se utiliza antes de tener un token.
	path('login/', login_empleado),
]
urlpatterns += router.urls