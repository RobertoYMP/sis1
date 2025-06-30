import React, { useState } from 'react';

const Register = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('alumno');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:3001/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena, rol })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al registrar usuario');
      }
      setSuccess(true);
      setCorreo('');
      setContrasena('');
      setRol('alumno');
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    }
    setLoading(false);
  };

  return (
    <div className="container mt-2">
      <form onSubmit={handleSubmit}>
        <h2 className="text-center mb-2">Registro</h2>
        {success && <div className="text-success mb-1">¡Usuario registrado correctamente!</div>}
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
        <div className="mb-1">
          <label className="label">Contraseña</label>
          <input
            type="password"
            className="input"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <label className="label">Rol</label>
          <select
            className="input"
            value={rol}
            onChange={e => setRol(e.target.value)}
            required
          >
            <option value="alumno">Alumno</option>
            <option value="coordinador">Coordinador</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
};

export default Register;
