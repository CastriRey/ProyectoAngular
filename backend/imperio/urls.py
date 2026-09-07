from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ClienteViewSet, login_empleado


router = DefaultRouter()
router.register('clientes', ClienteViewSet, basename='cliente')

urlpatterns = [
	# Esta ruta es pública porque se utiliza antes de tener un token.
	path('login/', login_empleado),
]
urlpatterns += router.urls