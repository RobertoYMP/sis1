import { useState, useEffect } from 'react'
import './App.css'
import Login from './Login';
import Register from './Register';
import SolicitudForm from './SolicitudForm';
import SubirDocumentos from './SubirDocumentos';
import TimelineAlumno from './TimelineAlumno';
import PanelCoordinador from './PanelCoordinador';
import EstadoSolicitud from './EstadoSolicitud';
import SubirPago from './SubirPago';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null); // { id_usuario, correo, rol, token, estadoProceso }
  const [paso, setPaso] = useState('solicitud');
  


  // Maneja el login exitoso
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // Decide el paso inicial según el estado del proceso
    if (userData.estadoProceso) {
      if (!userData.estadoProceso.solicitud) setPaso('solicitud');
      else if (
        userData.estadoProceso.solicitud &&
        userData.estadoProceso.solicitud.estado !== 'pendiente'
      ) setPaso('documentos');
      else setPaso('solicitud');
    }
  };

  // Refresca el estado del proceso del usuario cada 5 segundos si es alumno
  useEffect(() => {
    let interval;
    if (user && user.rol === 'alumno') {
      const fetchEstado = async () => {
        try {
          const res = await fetch(`http://localhost:3001/usuarios/estado-proceso/${user.id_usuario}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (res.ok) {
            const estadoProceso = await res.json();
            setUser(u => ({ ...u, estadoProceso }));
            // Cambia el paso automáticamente si cambia el estado
            if (!estadoProceso.solicitud) setPaso('solicitud');
            else if (estadoProceso.solicitud && estadoProceso.solicitud.estado !== 'pendiente') setPaso('documentos');
            else setPaso('solicitud');
          }
        } catch (e) { console.error('Error al obtener estado del proceso:', e);
          /* opcional: manejar error */ }
      };
      interval = setInterval(fetchEstado, 5000);
    }
    return () => interval && clearInterval(interval);
  }, [user]);

  // Cerrar sesión
  const handleLogout = () => {
    setUser(null);
    setPaso('solicitud');
    setShowRegister(false);
  };

  // Si el usuario es coordinador, mostrar el panel de coordinador
  if (user && user.rol === 'coordinador') {
    return (
      <>
        <PanelCoordinador token={user.token} onLogout={handleLogout} />
      </>
    );
  }

  // Si el usuario es alumno y está autenticado, mostrar timeline y el paso correspondiente
  if (user && user.rol === 'alumno') {
    const solicitud = user.estadoProceso?.solicitud;
    const pagos = user.estadoProceso?.pagos || [];
    const pago = pagos[0]; // Asumiendo un pago por solicitud
    const casillero = user.estadoProceso?.casillero;
    return (
      <div>
        <button onClick={handleLogout} className="absolute top-4 right-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cerrar sesión</button>
        <TimelineAlumno pasoActual={paso} setPaso={setPaso} estadoProceso={user.estadoProceso} />
        {solicitud && <EstadoSolicitud solicitud={solicitud} onLogout={handleLogout} setPaso={setPaso} />}
        {/* Mostrar formulario de solicitud solo si no existe solicitud */}
        {!solicitud && (
          <SolicitudForm id_usuario={user.id_usuario} token={user.token} />
        )}
        {/* Mostrar subida de documentos solo si existe solicitud y no se han subido ambos documentos */}
        {solicitud && (!user.estadoProceso.documentos || user.estadoProceso.documentos.length < 2) && (
          <SubirDocumentos id_solicitud={solicitud.id_solicitud} />
        )}
        {/* Paso de pago: solo si solicitud aprobada y documentos completos */}
        {solicitud && solicitud.estado === 'aprobada' && user.estadoProceso.documentos && user.estadoProceso.documentos.length === 2 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">Pago</h3>
            {/* Si ya hay pago, mostrar estado y comprobante */}
            {pago ? (
              <div className="mb-4">
                <p>Estado: <b>{pago.estado_pago}</b> | Validado: <b>{pago.validado_por_coordinador ? 'Sí' : 'No'}</b></p>
                {pago.comprobante_url && (
                  <a href={pago.comprobante_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver comprobante</a>
                )}
                {pago.motivo_rechazo && (
                  <p className="text-red-600">Motivo de rechazo: {pago.motivo_rechazo}</p>
                )}
              </div>
            ) : (
              <SubirPago id_solicitud={solicitud.id_solicitud} token={user.token} />
            )}
          </div>
        )}
        {/* Mostrar casillero asignado si existe */}
        {casillero && (
          <div className="mt-6 bg-green-50 p-4 rounded shadow max-w-md mx-auto">
            <h3 className="text-lg font-bold mb-2 text-green-700">¡Casillero asignado!</h3>
            <p><b>Número:</b> {casillero.numero}</p>
            <p><b>Ubicación:</b> {casillero.ubicacion}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    
  <div>
    <div className="background"></div> {/* Fondo borroso con imagen */}
    {showRegister ? <Register /> : <Login
  onLoginSuccess={handleLoginSuccess}
  onShowRegister={() => setShowRegister(true)}
/>
}
    <div className="flex justify-center mt-4 gap-4">
      <button
        className="btn-small"
        onClick={() => setShowRegister(false)}
      >
        Iniciar sesión
      </button>
      <button
        className="btn-small"
        onClick={() => setShowRegister(true)}
      >
        Registrarse
      </button>
    </div>
  </div>
);

}

export default App
