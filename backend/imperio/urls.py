from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
	ClienteViewSet,
	EmpleadoViewSet,
	EstadoServicioViewSet,
	MarcaViewSet,
	MetodoPagoViewSet,
	PermisoViewSet,
	PerfilViewSet,
	ProductoViewSet,
	RolViewSet,
	RutaViewSet,
	TipoProductoViewSet,
	TipoServicioViewSet,
	VentaViewSet,
	RelojClienteViewSet,
	ServicioViewSet,
	login_empleado,
)


router = DefaultRouter()
router.register('clientes', ClienteViewSet, basename='cliente')
router.register('empleados', EmpleadoViewSet, basename='empleado')
router.register('roles', RolViewSet, basename='rol')
router.register('perfiles', PerfilViewSet, basename='perfil')
router.register('rutas', RutaViewSet, basename='ruta')
router.register('permisos', PermisoViewSet, basename='permiso')
router.register('marcas', MarcaViewSet, basename='marca')
router.register('metodos-pago', MetodoPagoViewSet, basename='metodo-pago')
router.register('tipos-servicio', TipoServicioViewSet, basename='tipo-servicio')
router.register('estados-servicio', EstadoServicioViewSet, basename='estado-servicio')
router.register('tipos-producto', TipoProductoViewSet, basename='tipo-producto')
router.register('productos', ProductoViewSet, basename='producto')
router.register('ventas', VentaViewSet, basename='venta')
router.register('relojes-clientes', RelojClienteViewSet, basename='reloj-cliente')
router.register('servicios', ServicioViewSet, basename='servicio')

urlpatterns = [
	# Esta ruta es pública porque se utiliza antes de tener un token.
	path('login/', login_empleado),
]
urlpatterns += router.urls