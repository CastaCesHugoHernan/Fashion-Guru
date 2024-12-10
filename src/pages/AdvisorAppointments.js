// src/pages/AdvisorAppointments.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';

function AdvisorAppointments() {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Obtener citas del asesor
  useEffect(() => {
    const fetchAppointments = async () => {
      const advisorId = localStorage.getItem('advisor_id');

      if (!advisorId) {
        setMessage('Error: No se encontró el ID del asesor');
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('id, user_id, date, time, status, users(name)')
        .eq('advisor_id', advisorId);

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        const pending = data.filter((app) => app.status === 'pending');
        const completed = data.filter(
          (app) => app.status === 'accepted' || app.status === 'rejected'
        );
        setPendingAppointments(pending);
        setCompletedAppointments(completed);
      }
    };

    fetchAppointments();
  }, []);

  // Crear sala de chat entre usuario y asesor
  const createChatRoom = async (appointmentId, userId, advisorId) => {
    const { data: existingChatRoom, error: checkError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('user_id', userId)
      .eq('advisor_id', advisorId)
      .single();

    if (existingChatRoom) {
      console.log('La sala de chat ya existe.');
      return;
    }

    const { error: chatRoomError } = await supabase.from('chat_rooms').insert([
      {
        user_id: userId,
        advisor_id: advisorId,
        appointment_id: appointmentId,
      },
    ]);

    if (chatRoomError) {
      console.error('Error al crear la sala de chat:', chatRoomError);
    } else {
      console.log('Sala de chat creada correctamente.');
    }
  };

  // Crear notificación para el usuario
  const createNotification = async (userId, advisorId, status) => {
    const content =
      status === 'accepted'
        ? 'Tu asesoría fue aceptada.'
        : 'Tu asesoría fue rechazada.';

    const { error } = await supabase.from('notifications').insert([
      {
        user_id: userId,
        advisor_id: advisorId,
        type: 'appointment',
        content: content,
      },
    ]);

    if (error) {
      console.error('Error al crear la notificación:', error.message);
    } else {
      console.log('Notificación creada correctamente.');
    }
  };

  const handleStatusChange = async (appointmentId, newStatus, userId) => {
    const advisorId = localStorage.getItem('advisor_id');

    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);

    if (error) {
      setMessage(`Error al actualizar el estado: ${error.message}`);
    } else {
      setMessage('Estado de la cita actualizado');
      setPendingAppointments(
        pendingAppointments.filter((app) => app.id !== appointmentId)
      );

      if (newStatus === 'accepted') {
        await createChatRoom(appointmentId, userId, advisorId);
      }

      await createNotification(userId, advisorId, newStatus);
    }
  };

  return (
    <div>
      {/* Botones de navegación */}
      <div className="top-right-buttons">
        <button onClick={() => navigate(-1)} title="Atrás">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button onClick={() => navigate('/advisor/dashboard')} title="Home">
          <FontAwesomeIcon icon={faHome} />
        </button>
      </div>

      <h2>Gestión de Citas Pendientes</h2>
      {message && <p>{message}</p>}
      <ul>
        {pendingAppointments.map((appointment) => (
          <li key={appointment.id}>
            <p>Usuario: {appointment.users.name}</p>
            <p>Fecha: {appointment.date}</p>
            <p>Hora: {appointment.time}</p>
            <button
              onClick={() =>
                handleStatusChange(appointment.id, 'accepted', appointment.user_id)
              }
            >
              Aceptar
            </button>
            <button
              onClick={() =>
                handleStatusChange(appointment.id, 'rejected', appointment.user_id)
              }
            >
              Rechazar
            </button>
          </li>
        ))}
      </ul>

      <h2>Citas Aceptadas/Rechazadas</h2>
      <ul>
        {completedAppointments.map((appointment) => (
          <li key={appointment.id}>
            <p>Usuario: {appointment.users.name}</p>
            <p>Fecha: {appointment.date}</p>
            <p>Hora: {appointment.time}</p>
            <p>Estado: {appointment.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdvisorAppointments;
