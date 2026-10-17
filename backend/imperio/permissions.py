import re

from rest_framework.permissions import BasePermission

from .models import Permiso, Ruta


_ROUTE_PARAMETER = re.compile(r'^<(?:(?:int|str):)?[^>]+>$|^\{[^}]+\}$')
_NUMERIC_SEGMENT = re.compile(r'^\d+$')


def _route_matches(path: str, pattern: str) -> bool:
    path_parts = path.strip('/').lower().split('/') if path.strip('/') else []
    pattern_parts = pattern.strip('/').lower().split('/') if pattern.strip('/') else []
    if len(path_parts) != len(pattern_parts):
        return False
    return all(
        route_part == path_part or _ROUTE_PARAMETER.match(route_part)
        for path_part, route_part in zip(path_parts, pattern_parts)
    )


def _find_route(path: str):
    normalized = (path.rstrip('/') or '/').lower()
    for route in Ruta.objects.all():
        stored_path = (route.url_ruta.rstrip('/') or '/').lower()
        if stored_path == normalized or _route_matches(normalized, stored_path):
            return route
    return None


def _route_candidates(path: str):
    """Relaciona endpoints API con las rutas de pantalla administradas."""
    path = path.rstrip('/') or '/'
    candidates = [path + '/']
    if path in ('/roles', '/perfiles', '/rutas', '/permisos'):
        candidates.append('/seguridad' + path + '/')
    parts = path.strip('/').split('/')
    if len(parts) > 1 and _NUMERIC_SEGMENT.match(parts[-1]):
        base = '/' + '/'.join(parts[:-1]) + '/'
        candidates.append(base)
        if base in ('/roles/', '/perfiles/', '/rutas/', '/permisos/'):
            candidates.append('/seguridad' + base)
    return tuple(dict.fromkeys(candidates))


def _permission_action(request) -> str:
    if request.method == 'GET' or request.method == 'HEAD':
        return 'consultar'
    if request.method == 'POST':
        return 'insertar'
    if request.method in ('PUT', 'PATCH'):
        return 'modificar'
    if request.method == 'DELETE':
        return 'eliminar'
    return ''


class RutaPermisoPermission(BasePermission):
    message = 'No tienes permiso para realizar esta acción en esta ruta.'

    def has_permission(self, request, view):
        perfil = getattr(request.user, 'perfil', None)
        if perfil == 1:
            return True

        action = _permission_action(request)
        if perfil is None or not action:
            return False

        path = request.path.removeprefix('/api') or '/'
        ruta = next((route for candidate in _route_candidates(path) if (route := _find_route(candidate))), None)
        if ruta is None:
            return False

        permiso = Permiso.objects.filter(
            codigo_perfil_permiso=perfil,
            codigo_ruta_permiso=ruta.codigo_ruta,
        ).first()
        return bool(permiso and getattr(permiso, action, 'N').strip().upper() == 'S')
