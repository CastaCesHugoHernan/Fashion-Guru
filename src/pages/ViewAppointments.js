// src/pages/ViewAppointments.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Para navegación
import { supabase } from '../config/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';

function ViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook para manejar navegación

  useEffect(() => {
    const fetchAppointments = async () => {
      const userId = localStorage.getItem('user_id');

      if (!userId) {
        setMessage('Error: No se encontró el ID del usuario.');
        return;
      }

      // Recuperar citas del usuario, incluyendo el nombre del asesor
      const { data, error } = await supabase
        .from('appointments')
        .select('id, date, time, status, advisor_id, advisors(name)')
        .eq('user_id', userId);

      if (error) {
        setMessage(`Error al cargar las citas: ${error.message}`);
      } else {
        setAppointments(data);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="schedule-container">
      {/* Botones de navegación en la esquina superior derecha */}
      <div className="top-right-buttons">
        <button onClick={() => navigate(-1)} title="Atrás">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button onClick={() => navigate('/user/dashboard')} title="Home">
          <FontAwesomeIcon icon={faHome} />
        </button>
      </div>

      <h2>Mis Asesorías Agendadas</h2>
      {message && <p>{message}</p>}
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            <p>Fecha: {appointment.date}</p>
            <p>Hora: {appointment.time}</p>
            <p>Estado: {appointment.status}</p>
            <p>Asesor: {appointment.advisors.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ViewAppointments;
