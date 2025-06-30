import React, { useState } from 'react';
import SubirDocumentos from './SubirDocumentos';

const SolicitudForm = ({ id_usuario, token }) => {
  const [form, setForm] = useState({
    numero_boleta: '',
    nombre_completo: '',
    semestre_actual: '',
    correo_personal: '',
    numero_celular: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:3001/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...form, id_usuario })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear solicitud');
      }
      const data = await res.json();
      setSolicitud(data);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al crear solicitud');
    }
    setLoading(false);
  };

  if (success && solicitud) {
    return (
      <div className="card-form mt-8">
        <h2 className="form-title">¡Solicitud enviada!</h2>
        <p className="mb-2">Estado: <span className="font-semibold">{solicitud.estado}</span></p>
        <p className="mb-2">Puedes continuar con la subida de documentos.</p>
        <SubirDocumentos id_solicitud={solicitud.id_solicitud} />
      </div>
    );
  }

  return (
    <div className="form-bg">
      <form onSubmit={handleSubmit} className="card-form">
        <h2 className="form-title">Solicitud de Casillero</h2>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Número de boleta</label>
          <input name="numero_boleta" value={form.numero_boleta} onChange={handleChange} required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Semestre actual</label>
          <input name="semestre_actual" value={form.semestre_actual} onChange={handleChange} required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Correo personal</label>
          <input name="correo_personal" type="email" value={form.correo_personal} onChange={handleChange} required className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Número de celular</label>
          <input name="numero_celular" value={form.numero_celular} onChange={handleChange} required className="form-input" />
        </div>
        <button type="submit" className="btn btn-blue w-full" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  );
};

export default SolicitudForm;
