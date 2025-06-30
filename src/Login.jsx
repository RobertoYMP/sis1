import React, { useState } from 'react';

const Login = ({ onLoginSuccess, onShowRegister }) => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json  ' },
        body: JSON.stringify({ correo, contrasena })
      });
      if (!res.ok) {
        throw new Error('Credenciales incorrectas');
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setSuccess(true);
      const estadoRes = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/estado-proceso`, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!estadoRes.ok) {
        throw new Error('No se pudo obtener el estado del proceso');
      }
      const estadoProceso = await estadoRes.json();
      if (onLoginSuccess) {
        onLoginSuccess({ ...data, estadoProceso });
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="background" />
      <div className="login-glass">
        <form onSubmit={handleSubmit}>
          <h2 className="text-center mb-2">Iniciar sesión</h2>

          {success && <div className="text-success mb-1">¡Bienvenido! Inicio de sesión exitoso.</div>}
          {error && <div className="text-error mb-1">{error}</div>}

          <div className="mb-1">
            <label className="label">Correo electrónico</label>
            <input
              type="email"
              className="input"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <div className="create-account mt-2">
            <p>¿No tienes cuenta? <button type="button" onClick={onShowRegister} className="link">Registrarse</button></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
