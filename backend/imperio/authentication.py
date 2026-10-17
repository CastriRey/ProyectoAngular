from types import SimpleNamespace

from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import UntypedToken


class EmpleadoJWTAuthentication(BaseAuthentication):
    """Valida el JWT emitido para un empleado y expone su perfil al permiso DRF."""

    def authenticate(self, request):
        authorization = get_authorization_header(request).split()
        if not authorization:
            return None
        if authorization[0].lower() != b'bearer' or len(authorization) != 2:
            raise AuthenticationFailed('El encabezado Authorization debe usar Bearer.')

        try:
            token = UntypedToken(authorization[1])
        except Exception as error:
            raise AuthenticationFailed('El token no es válido o ha expirado.') from error

        payload = dict(token.payload)
        perfil = payload.get('perfil')
        empleado_id = payload.get('user_id')
        if perfil is None or empleado_id is None:
            raise AuthenticationFailed('El token no contiene un empleado válido.')

        usuario = SimpleNamespace(
            id=int(empleado_id),
            is_authenticated=True,
            perfil=int(perfil),
            payload=payload,
        )
        return usuario, token
