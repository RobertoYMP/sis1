import React, { useState } from 'react';

const SubirPago = ({ id_solicitud, token }) => {
  const [comprobante, setComprobante] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setComprobante(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      if (!comprobante) throw new Error('Selecciona un archivo');
      if (!id_solicitud) throw new Error('No se encontró id_solicitud');
      const formData = new FormData();
      formData.append('comprobante', comprobante);
      formData.append('id_solicitud', id_solicitud);
      const res = await fetch('http://localhost:3001/pagos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al subir comprobante de pago');
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al subir comprobante de pago');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-2">
      <h3 className="text-center mb-1">Subir comprobante de pago</h3>
      {success && <div className="text-success mb-1">¡Comprobante subido correctamente!</div>}
      {error && <div className="text-error mb-1">{error}</div>}
      <div className="mb-1">
        <label className="label">Comprobante de pago (JPG, PNG o PDF)</label>
        <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} className="input" required />
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Enviando...' : 'Subir comprobante'}
      </button>
    </form>
  );
};

export default SubirPago;
