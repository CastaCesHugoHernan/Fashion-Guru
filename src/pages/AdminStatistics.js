// src/pages/AdminStatistics.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './Estilos/AdminStatistics.css'; // Importar los nuevos estilos

function AdminStatistics() {
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalAdvisors: 0,
    totalAppointments: 0,
    totalPosts: 0,
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact' });

        const { count: totalAdvisors } = await supabase
          .from('advisors')
          .select('*', { count: 'exact' })
          .eq('approved', true);

        const { count: totalAppointments } = await supabase
          .from('appointments')
          .select('*', { count: 'exact' });

        const { count: totalPosts } = await supabase
          .from('posts')
          .select('*', { count: 'exact' });

        setStatistics({
          totalUsers: totalUsers || 0,
          totalAdvisors: totalAdvisors || 0,
          totalAppointments: totalAppointments || 0,
          totalPosts: totalPosts || 0,
        });
      } catch (error) {
        setMessage(`Error al obtener estadísticas: ${error.message}`);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="admin-statistics-container">
      {/* Botón Atrás */}
      <div className="activity-graph-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FontAwesomeIcon icon={faArrowLeft} /> Atrás
        </button>
      </div>

      <h2>Estadísticas del Sitio</h2>
      {message && <p className="message">{message}</p>}
      <ul>
        <li>Total de Usuarios Registrados: {statistics.totalUsers}</li>
        <li>Total de Asesores Aprobados: {statistics.totalAdvisors}</li>
        <li>Total de Citas Agendadas: {statistics.totalAppointments}</li>
        <li>Total de Publicaciones en la Comunidad: {statistics.totalPosts}</li>
      </ul>
    </div>
  );
}

export default AdminStatistics;
