import React, { useEffect, useState } from 'react';

<div className="background"></div>


const PanelCoordinador = ({ token, onLogout }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentos, setDocumentos] = useState({}); // { id_solicitud: [docs] }
  const [pagos, setPagos] = useState({}); // { id_solicitud: [pagos] }
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [casilleros, setCasilleros] = useState([]); // Casilleros disponibles
  const [asignando, setAsignando] = useState(false);
  const [casilleroAsignado, setCasilleroAsignado] = useState(null);

  // Obtener todos los casilleros (no solo disponibles)
  const API_URL = import.meta.env.VITE_API_URL;
  const [todosCasilleros, setTodosCasilleros] = useState([]);
  useEffect(() => {
    const fetchTodos = async () => {
      const res = await fetch(`${API_URL}/casilleros`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTodosCasilleros(await res.json());
    };
    fetchTodos();
  }, [token]);

  // Crear casillero
  const [nuevoNumero, setNuevoNumero] = useState('');
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');
  const [creando, setCreando] = useState(false);
  const handleCrearCasillero = async (e) => {
    e.preventDefault();
    setCreando(true);
    const res = await fetch(`${API_URL}/casilleros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ numero: nuevoNumero, ubicacion: nuevaUbicacion })
    });
    if (res.ok) {
      setNuevoNumero('');
      setNuevaUbicacion('');
      // Refrescar listas
      const resTodos = await fetch(`${API_URL}/casilleros`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }); //fetch('${API_URL}/solicitudes'
      setTodosCasilleros(await resTodos.json());
      const resDisponibles = await fetch('${API_URL}/casilleros/disponibles');
      setCasilleros(await resDisponibles.json());
    }
    setCreando(false);
  };

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setLoading(true);
      try {
        const res = await fetch('${API_URL}/solicitudes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener solicitudes');
        const data = await res.json();
        setSolicitudes(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchSolicitudes();
  }, [token]);

// Cargar documentos y pagos al seleccionar una solicitud
  useEffect(() => {
    if (!solicitudSeleccionada) return;
    const id = solicitudSeleccionada.id_solicitud;

    const fetchDocs = async () => {
      const res = await fetch(`${API_URL}/documentos/solicitud/${id}`);
      const docs = await res.json();
      setDocumentos(d => ({ ...d, [id]: docs }));
    };

    const fetchPagos = async () => {
      const res = await fetch(`${API_URL}/pagos/solicitud/${id}`);
      const pagos = await res.json();
      setPagos(p => ({ ...p, [id]: pagos }));
    };

    fetchDocs();
    fetchPagos();
  }, [solicitudSeleccionada]);

// Obtener casilleros disponibles al seleccionar solicitud
  useEffect(() => {
    if (!solicitudSeleccionada) return;

    const fetchCasilleros = async () => {
      const res = await fetch(`${API_URL}/casilleros/disponibles`);
      const data = await res.json();
      setCasilleros(data);
    };

    const fetchAsignacion = async () => {
      const pagosSolicitud = pagos[solicitudSeleccionada.id_solicitud] || [];
      const pagoAprobado = pagosSolicitud.find(
          p => p.estado_pago === 'pagado' && p.validado_por_coordinador
      );

      if (pagoAprobado) {
        const res = await fetch(`${API_URL}/asignaciones/pago/${pagoAprobado.id_pago}`);
        if (res.ok) {
          const asignacion = await res.json();
          setCasilleroAsignado(asignacion);
        } else {
          setCasilleroAsignado(null);
        }
      } else {
        setCasilleroAsignado(null);
      }
    };

    fetchCasilleros();
    fetchAsignacion();
  }, [solicitudSeleccionada, pagos]);

// Cambiar estado solicitud
  const cambiarEstado = async (id_solicitud, nuevoEstado, motivo = '') => {
    try {
      const res = await fetch(`${API_URL}/solicitudes/${id_solicitud}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado, motivo_rechazo: motivo })
      });

      if (!res.ok) throw new Error('Error al cambiar estado');

      setSolicitudes(solicitudes =>
          solicitudes.map(s =>
              s.id_solicitud === id_solicitud ? { ...s, estado: nuevoEstado, motivo_rechazo: motivo } : s
          )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Cargando solicitudes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
  <div className="panel-scroll">
  <div className="background" />
    <button className="logout-button" onClick={onLogout}>
          Cerrar sesión
        </button>
    <div className="container">
      <h2 className="title">Panel de Coordinador - Solicitudes</h2>
      <table className="table mb-8">
        <thead>
          <tr>
            <th className="table-header">ID</th>
            <th className="table-header">Alumno</th>
            <th className="table-header">Estado</th>
            <th className="table-header">Acciones</th>
            <th className="table-header">Ver</th>
            <th className="table-header">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map(s => (
            <tr key={s.id_solicitud}>
              <td className="table-cell">{s.id_solicitud}</td>
              <td className="table-cell">{s.nombre_completo}</td>
              <td className="table-cell">{s.estado}</td>
              <td className="table-cell">
                {s.estado === 'pendiente' && (
                  <>
                    <button className="btn btn-green mr-2" onClick={() => cambiarEstado(s.id_solicitud, 'aprobada')}>Aprobar</button>
                    <button className="btn btn-red" onClick={() => {
                      const motivo = prompt('Motivo de rechazo:');
                      if (motivo) cambiarEstado(s.id_solicitud, 'rechazada', motivo);
                    }}>Rechazar</button>
                  </>
                )}
                {s.estado === 'rechazada' && (
                  <span className="text-red">Rechazada</span>
                )}
                {s.estado === 'aprobada' && (
                  <span className="text-green">Aprobada</span>
                )}
              </td>
              <td className="table-cell">
                <button className="link" onClick={() => setSolicitudSeleccionada(s)}>Ver detalles</button>
              </td>
              <td className="table-cell">
                <button
                    className={`btn btn-red${s.estado !== 'pendiente' ? ' disabled' : ''}`}
                    onClick={async () => {
                      const confirmar = window.confirm('¿Seguro que deseas eliminar esta solicitud?');
                      if (!confirmar) return;

                      try {
                        const res = await fetch(`${API_URL}/solicitudes/${s.id_solicitud}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });

                        if (res.ok) {
                          setSolicitudes(solicitudes.filter(x => x.id_solicitud !== s.id_solicitud));
                        } else {
                          const data = await res.json();
                          alert(data.error || 'No se pudo eliminar');
                        }
                      } catch (error) {
                        console.error('Error al eliminar la solicitud:', error);
                        alert('Error al conectar con el servidor');
                      }
                    }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {solicitudSeleccionada && (
          <div className="card mb-8">
            <h3 className="subtitle">Detalles de la Solicitud #{solicitudSeleccionada.id_solicitud}</h3>
            <p><b>Alumno:</b> {solicitudSeleccionada.nombre_completo}</p>
            <p><b>Estado:</b> {solicitudSeleccionada.estado}</p>
            {solicitudSeleccionada.motivo_rechazo && (
                <p className="text-red"><b>Motivo de rechazo:</b> {solicitudSeleccionada.motivo_rechazo}</p>
            )}
            <h4 className="section-title">Documentos:</h4>
            <ul className="list">
              {(documentos[solicitudSeleccionada.id_solicitud] || []).map(doc => (
                  <li key={doc.id_documento}>
                    {doc.tipo}: <a href={doc.ruta_archivo} target="_blank" rel="noopener noreferrer" className="link">Ver documento</a>
              </li>
            ))}
          </ul>
          <h4 className="section-title">Pagos:</h4>
          <ul className="list">
            {(pagos[solicitudSeleccionada.id_solicitud] || []).map(pago => (
              <li key={pago.id_pago} className="mb-2">
                Estado: {pago.estado_pago} | Validado: {pago.validado_por_coordinador ? 'Sí' : 'No'}
                {pago.comprobante_url && (
                  <>
                    {' '}|{' '}
                    <a href={pago.comprobante_url} target="_blank" rel="noopener noreferrer" className="link mr-2">
                      Ver comprobante
                    </a>
                    {/* Botones para aprobar/rechazar pago si aún no está validado */}
                    {!pago.validado_por_coordinador && (
                      <>
                        <button className="btn btn-green mr-2" onClick={async () => {
                          await  fetch(`${API_URL}/pagos/${pago.id_pago}/validar`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ validado: true, estado_pago: 'pagado' })
                          });
                          // Refrescar pagos
                          const res = await fetch(`${API_URL}/pagos/solicitud/${solicitudSeleccionada.id_solicitud}`);
                          const pagosActualizados = await res.json();
                          setPagos(p => ({ ...p, [solicitudSeleccionada.id_solicitud]: pagosActualizados }));
                        }}>
                          Aprobar
                        </button>
                        <button className="btn btn-red" onClick={async () => {
                          const motivo = prompt('Motivo de rechazo del pago:');
                          await fetch(`${API_URL}/pagos/${pago.id_pago}/validar`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ validado: false, estado_pago: 'no pagado', motivo_rechazo: motivo })
                          });
                          // Refrescar pagos
                          const res = await fetch(`${API_URL}/pagos/solicitud/${solicitudSeleccionada.id_solicitud}`);
                          const pagosActualizados = await res.json();
                          setPagos(p => ({ ...p, [solicitudSeleccionada.id_solicitud]: pagosActualizados }));
                        }}>
                          Rechazar
                        </button>
                      </>
                    )}
                  </>
                )}
                {/* Mostrar motivo de rechazo si existe */}
                {pago.motivo_rechazo && (
                  <span className="text-red ml-2">Motivo de rechazo: {pago.motivo_rechazo}</span>
                )}
              </li>
            ))}
          </ul>
          <h4 className="section-title">Asignación de Casillero:</h4>
          {/* Mostrar casillero asignado si existe */}
          {casilleroAsignado ? (
            <div className="casillero-asignado mb-2">
              <b>Casillero asignado:</b> #{casilleroAsignado.numero} - {casilleroAsignado.ubicacion}
            </div>
          ) : (
            <>
              {/* Solo mostrar si hay pago aprobado y no hay casillero asignado */}
              {(() => {
                const pagosSolicitud = pagos[solicitudSeleccionada.id_solicitud] || [];
                const pagoAprobado = pagosSolicitud.find(p => p.estado_pago === 'pagado' && p.validado_por_coordinador);
                if (!pagoAprobado) return <div className="text-gray">Primero debe aprobarse el pago.</div>;
                if (casilleros.length === 0) return <div className="text-red">No hay casilleros disponibles.</div>;
                return (
                  <form onSubmit={async e => {
                    e.preventDefault();
                    setAsignando(true);
                    const id_casillero = e.target.casillero.value;
                    const res = await fetch('${API_URL}/asignaciones', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ id_pago: pagoAprobado.id_pago, id_casillero })
                    });
                    if (res.ok) {
                      const asignacion = await res.json();
                      setCasilleroAsignado(asignacion);
                      // Opcional: refrescar casilleros
                      const res2 = await fetch('${API_URL}/casilleros/disponibles');
                      setCasilleros(await res2.json());
                    }
                    setAsignando(false);
                  }}>
                    <label className="label">Selecciona casillero:</label>
                    <select name="casillero" className="input mb-2" required>
                      {casilleros.map(c => (
                        <option key={c.id_casillero} value={c.id_casillero}>
                          #{c.numero} - {c.ubicacion}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-blue ml-2" disabled={asignando}>
                      {asignando ? 'Asignando...' : 'Asignar casillero'}
                    </button>
                  </form>
                );
              })()}
            </>
          )}
          <button className="btn btn-gray mt-4" onClick={() => setSolicitudSeleccionada(null)}>Cerrar</button>
        </div>
      )}

      {/* Gestión de casilleros */}
      <div className="mb-8">
        <h2 className="subtitle">Gestión de Casilleros</h2>
        <form onSubmit={handleCrearCasillero} className="form-row mb-4">
          <div>
            <label className="label">Número</label>
            <input type="number" value={nuevoNumero} onChange={e => setNuevoNumero(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">Ubicación</label>
            <input type="text" value={nuevaUbicacion} onChange={e => setNuevaUbicacion(e.target.value)} className="input" required />
          </div>
          <button type="submit" className="btn btn-blue" disabled={creando}>
            {creando ? 'Creando...' : 'Agregar casillero'}
          </button>
        </form>
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Número</th>
              <th className="table-header">Ubicación</th>
              <th className="table-header">Disponible</th>
              <th className="table-header">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {todosCasilleros.map(c => (
              <tr key={c.id_casillero}>
                <td className="table-cell">{c.numero}</td>
                <td className="table-cell">{c.ubicacion}</td>
                <td className="table-cell">{c.disponible ? 'Sí' : 'No'}</td>
                <td className="table-cell">
                  <button
                    className={`btn btn-red${!c.disponible ? ' disabled' : ''}`}
                    disabled={!c.disponible}
                    title={c.disponible ? 'Eliminar casillero' : 'No se puede eliminar un casillero asignado'}
                    onClick={async () => {
                      if (!c.disponible) return;
                      if (window.confirm('¿Seguro que deseas eliminar este casillero?')) {
                        const res = await fetch('${API_URL}/casilleros/${c.id_casillero}', {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                          setTodosCasilleros(todosCasilleros.filter(x => x.id_casillero !== c.id_casillero));
                          const resDisponibles = await fetch('${API_URL}/casilleros/disponibles');
                          setCasilleros(await resDisponibles.json());
                        } else {
                          const data = await res.json();
                          alert(data.error || 'No se pudo eliminar');
                        }
                      }
                    }}
                  >Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};

export default PanelCoordinador;
