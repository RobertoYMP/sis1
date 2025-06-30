import React from 'react';

const TimelineAlumno = ({ pasoActual, setPaso, estadoProceso }) => {
  // Define los pasos del proceso
  const pasos = [
    { key: 'solicitud', label: 'Solicitud' },
    { key: 'documentos', label: 'Documentos' },
    // Puedes agregar más pasos aquí (pago, casillero, etc.)
  ];

  // Determina si un paso está habilitado
  const isHabilitado = (key) => {
    if (key === 'solicitud') return true;
    if (key === 'documentos') return estadoProceso.solicitud && estadoProceso.solicitud.estado !== 'pendiente';
    // Agrega lógica para otros pasos
    return false;
  };

  return (
    <div className="timeline-container">
      {pasos.map((paso, idx) => (
        <button
          key={paso.key}
          className={`timeline-btn ${
            pasoActual === paso.key
              ? 'active'
              : isHabilitado(paso.key)
              ? 'enabled'
              : 'disabled'
          }`}
          onClick={() => isHabilitado(paso.key) && setPaso(paso.key)}
          disabled={!isHabilitado(paso.key)}
        >
          {paso.label}
        </button>
      ))}
    </div>
  );
};

export default TimelineAlumno;
