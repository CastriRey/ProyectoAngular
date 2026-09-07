// Estos tipos documentan exactamente los datos que intercambia el login.
export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  mensaje: string;
  access: string;
  refresh: string;
  empleado: {
    id: number;
    nombre: string;
    primer_apellido: string;
    correo: string;
    perfil: number;
  };
}
