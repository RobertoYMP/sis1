import React, { useState } from 'react';

const SubirDocumentos = ({ id_solicitud }) => {
  const [horario, setHorario] = useState(null);
  const [credencial, setCredencial] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, tipo) => {
    if (tipo === 'horario') setHorario(e.target.files[0]);
    if (tipo === 'credencial') setCredencial(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    // Validar que ambos archivos estén presentes
    if (!horario || !credencial) {
      setError('Debes seleccionar ambos archivos PDF.');
      setLoading(false);
      return;
    }
    try {
      // Subir horario
      const formDataHorario = new FormData();
      formDataHorario.append('archivo', horario);
      formDataHorario.append('id_solicitud', id_solicitud);
      formDataHorario.append('tipo', 'comprobante horario');
      const resHorario = await fetch('http://localhost:3001/documentos', {
        method: 'POST',
        body: formDataHorario
      });
      if (!resHorario.ok) throw new Error('Error al subir comprobante de horario');
      // Subir credencial
      const formDataCredencial = new FormData();
      formDataCredencial.append('archivo', credencial);
      formDataCredencial.append('id_solicitud', id_solicitud);
      formDataCredencial.append('tipo', 'credencial vigente');
      const resCredencial = await fetch('http://localhost:3001/documentos', {
        method: 'POST',
        body: formDataCredencial
      });
      if (!resCredencial.ok) throw new Error('Error al subir credencial escolar');
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al subir documentos');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-2">
      <h3 className="text-center mb-1">Subir documentos</h3>
      {success && <div className="text-success mb-1">¡Documentos subidos correctamente!</div>}
      {error && <div className="text-error mb-1">{error}</div>}
      <div className="mb-1">
        <label className="label">Comprobante de horario vigente (PDF)</label>
        <input type="file" accept="application/pdf" onChange={e => handleFileChange(e, 'horario')} className="input" />
      </div>
      <div className="mb-2">
        <label className="label">Credencial escolar vigente (PDF)</label>
        <input type="file" accept="application/pdf" onChange={e => handleFileChange(e, 'credencial')} className="input" />
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Subiendo...' : 'Subir documentos'}
      </button>
    </form>
  );
};

export default SubirDocumentos;
