// src/pages/AdvisorDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../config/supabaseClient';
import './Estilos/AdvisorDashboard.css'; // Importa los estilos que creamos

function AdvisorDashboard() {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [acceptedAppointments, setAcceptedAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const advisorId = localStorage.getItem('advisor_id'); // Recuperar el ID del asesor desde localStorage
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      // Obtener citas pendientes
      const { data: pendingData, error: pendingError } = await supabase
        .from('appointments')
        .select('id, user_id, date, time, status, users(name)')
        .eq('advisor_id', advisorId)
        .eq('status', 'pending');

      if (pendingError) {
        setMessage(`Error al cargar citas pendientes: ${pendingError.message}`);
      } else {
        setPendingAppointments(pendingData);
      }

      // Obtener citas aceptadas
      const { data: acceptedData, error: acceptedError } = await supabase
        .from('appointments')
        .select('id, user_id, date, time, status, users(name)')
        .eq('advisor_id', advisorId)
        .eq('status', 'accepted');

      if (acceptedError) {
        setMessage(`Error al cargar citas aceptadas: ${acceptedError.message}`);
      } else {
        setAcceptedAppointments(acceptedData);
      }
    };

    fetchAppointments();
  }, [advisorId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleAccept = async (id) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'accepted' })
      .eq('id', id);

    if (error) {
      setMessage(`Error al aceptar cita: ${error.message}`);
    } else {
      setMessage('Cita aceptada exitosamente');
      setPendingAppointments(pendingAppointments.filter(appt => appt.id !== id));
    }
  };

  const handleReject = async (id) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      setMessage(`Error al rechazar cita: ${error.message}`);
    } else {
      setMessage('Cita rechazada exitosamente');
      setPendingAppointments(pendingAppointments.filter(appt => appt.id !== id));
    }
  };

  const handleCreateChatRoom = async (appointmentId, userId) => {
    const { data: existingChatRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('user_id', userId)
      .eq('advisor_id', advisorId)
      .single();

    if (existingChatRoom) {
      setMessage('La sala de chat ya existe.');
      window.location.href = `/chat/room/${existingChatRoom.id}`;
      return;
    }

    const { data: chatRoom, error } = await supabase
      .from('chat_rooms')
      .insert([{ appointment_id: appointmentId, user_id: userId, advisor_id: advisorId }])
      .select();

    if (error) {
      setMessage(`Error al crear la sala de chat: ${error.message}`);
    } else if (chatRoom && chatRoom.length > 0) {
      const chatRoomId = chatRoom[0].id;
      setMessage('Sala de chat creada correctamente');
      window.location.href = `/chat/room/${chatRoomId}`;
    }
  };

  return (
    <div className="advisor-dashboard-container">
      {/* Botones de navegación y cierre de sesión en la esquina superior derecha */}
      <div className="top-right-buttons">
        <button onClick={() => navigate(-1)} title="Atrás">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button onClick={() => navigate('/advisor/dashboard')} title="Home">
          <FontAwesomeIcon icon={faHome} />
        </button>
        <button onClick={handleLogout} title="Cerrar Sesión">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>

      <h1>Panel de Asesor</h1>
      {message && <p className="message">{message}</p>}

      <h2>Gestión de Citas Pendientes</h2>
      <ul>
        {pendingAppointments.length > 0 ? (
          pendingAppointments.map((appointment) => (
            <li key={appointment.id}>
              <p>Fecha: {appointment.date}</p>
              <p>Hora: {appointment.time}</p>
              <p>Usuario: {appointment.users.name}</p>
              <button onClick={() => handleAccept(appointment.id)}>Aceptar</button>
              <button className="reject-btn" onClick={() => handleReject(appointment.id)}>Rechazar</button>
            </li>
          ))
        ) : (
          <p>No hay citas pendientes.</p>
        )}
      </ul>

      <h2>Citas Aceptadas</h2>
      <ul>
        {acceptedAppointments.length > 0 ? (
          acceptedAppointments.map((appointment) => (
            <li key={appointment.id}>
              <p>Fecha: {appointment.date}</p>
              <p>Hora: {appointment.time}</p>
              <p>Usuario: {appointment.users.name}</p>
              <button onClick={() => handleCreateChatRoom(appointment.id, appointment.user_id)}>Iniciar Chat</button>
            </li>
          ))
        ) : (
          <p>No hay citas aceptadas.</p>
        )}
      </ul>

      <div className="menu">
        <ul>
          <li>
            <Link to="/advisor/appointments">
              <button>Ver Citas Agendadas</button>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AdvisorDashboard;
