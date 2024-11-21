// src/pages/ScheduleAppointment.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';
import './Estilos/ScheduleAppointment.css';

function ScheduleAppointment() {
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdvisors = async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('id, name, specialization')
        .eq('approved', true); // Filtrar asesores aprobados

      if (error) {
        setMessage(`Error al cargar asesores: ${error.message}`);
      } else {
        setAdvisors(data);
      }
    };

    fetchAdvisors();
  }, []);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate < today) {
      setMessage('No puedes seleccionar una fecha pasada.');
      setDate('');
    } else {
      setDate(selectedDate);
      setMessage('');
    }
  };

  const handleTimeChange = async (e) => {
    const selectedTime = e.target.value;
    setTime(selectedTime);

    if (selectedAdvisor && date) {
      const { data, error } = await supabase
        .from('appointments')
        .select('time')
        .eq('advisor_id', selectedAdvisor.id)
        .eq('date', date)
        .eq('status', 'confirmed');

      if (error) {
        setMessage(`Error al verificar disponibilidad: ${error.message}`);
      } else {
        const occupiedTimes = data.map((appointment) => appointment.time);
        if (occupiedTimes.includes(selectedTime)) {
          setMessage('El asesor ya tiene una cita en esa hora. Elige otra hora.');
          setTime('');
        } else {
          setMessage('');
        }
      }
    }
  };

  const handleAppointment = async () => {
    if (!date || !time || !selectedAdvisor) {
      setMessage('Por favor, completa todos los campos.');
      return;
    }

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setMessage('Error: No se encontró el ID del usuario');
      return;
    }

    const { error } = await supabase
      .from('appointments')
      .insert([{ user_id: userId, advisor_id: selectedAdvisor.id, date, time, status: 'pending' }]);

    if (error) {
      setMessage(`Error al agendar cita: ${error.message}`);
    } else {
      setMessage('Cita agendada exitosamente. Espera la confirmación.');
      setDate('');
      setTime('');
      setSelectedAdvisor(null);
    }
  };

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

      <h1>Agendar Asesoría</h1>
      {message && <p className="message">{message}</p>}

      <div className="advisor-list">
        {advisors.length > 0 ? (
          advisors.map((advisor) => (
            <div key={advisor.id} className="advisor-profile">
              <h3>{advisor.name}</h3>
              <p>{advisor.specialization}</p>
              <button onClick={() => setSelectedAdvisor(advisor)} className="schedule-btn">
                Agendar con {advisor.name}
              </button>

              {/* Mostrar el formulario sobre el perfil del asesor seleccionado */}
              {selectedAdvisor && selectedAdvisor.id === advisor.id && (
                <div className="appointment-form-overlay">
                  <h2>Agendar con {selectedAdvisor.name}</h2>
                  <label>
                    Fecha:
                    <input type="date" value={date} onChange={handleDateChange} />
                  </label>
                  <label>
                    Hora:
                    <input type="time" value={time} onChange={handleTimeChange} />
                  </label>
                  <button onClick={handleAppointment} className="confirm-btn">
                    Confirmar Cita
                  </button>
                  <button onClick={() => setSelectedAdvisor(null)} className="cancel-btn">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No hay asesores disponibles.</p>
        )}
      </div>
    </div>
  );
}

export default ScheduleAppointment;
