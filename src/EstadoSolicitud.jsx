import React from 'react';

const EstadoSolicitud = ({ solicitud, onLogout, setPaso }) => {
  if (!solicitud) return null;

  let color = '';
  if (solicitud.estado === 'aprobada') color = 'text-success';
  if (solicitud.estado === 'rechazada') color = 'text-error';

  return (
    <div className="estado-container">
      <div className="background" />
        <button className="logout-button" onClick={onLogout}>Cerrar sesión</button>
        <div className="glass-panel">
          <h2 className="text-center">Estado de tu solicitud</h2>
          <p className={`mb-1 ${color}`}><b>Estado:</b> {solicitud.estado}</p>
          {solicitud.estado === 'rechazada' && solicitud.motivo_rechazo && (
            <p className="text-error mb-1">Motivo de rechazo: {solicitud.motivo_rechazo}</p>
          )}
          {solicitud.estado === 'aprobada' && (
            <p className="text-success mb-1">¡Tu solicitud fue aprobada! Continúa con el siguiente paso.</p>
          )}
          {solicitud.estado === 'pendiente' && (
            <p className="mb-1" style={{ color: '#ca8a04' }}>Tu solicitud está en revisión.</p>
          )}

          <div className="btn-group">
            <button className="btn" onClick={() => setPaso('solicitud')}>Subir Solicitud</button>
            <button className="btn" onClick={() => setPaso('documentos')}>Subir Documentos</button>
          </div>
        </div>
      </div>
  );
};

export default EstadoSolicitud;