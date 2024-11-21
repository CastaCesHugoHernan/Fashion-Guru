// src/pages/ViewAppointments.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

function ViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');

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
    <div>
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
