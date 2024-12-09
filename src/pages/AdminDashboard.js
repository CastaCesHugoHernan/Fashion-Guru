// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faChartLine, faUsers, faArrowLeft, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Estilos/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [pendingAdvisors, setPendingAdvisors] = useState(0);
  const [pendingAppointments, setPendingAppointments] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Contar usuarios registrados
        const { count: userCount, error: userError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (userError) {
          console.error('Error al obtener el conteo de usuarios:', userError.message);
        } else {
          setUserCount(userCount);
        }

        // Contar asesores pendientes
        const { count: advisorCount, error: advisorError } = await supabase
          .from('advisors')
          .select('*', { count: 'exact', head: true })
          .eq('approved', false);

        if (advisorError) {
          console.error('Error al obtener el conteo de asesores pendientes:', advisorError.message);
        } else {
          setPendingAdvisors(advisorCount);
        }

        // Contar solicitudes de asesoría pendientes
        const { count: appointmentCount, error: appointmentError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (appointmentError) {
          console.error('Error al obtener el conteo de solicitudes de asesoría:', appointmentError.message);
        } else {
          setPendingAppointments(appointmentCount);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error.message);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="admin-dashboard-container">
      {/* Botones de navegación y cierre de sesión en la esquina superior derecha */}
      <div className="top-right-buttons">
        <button onClick={() => navigate(-1)} title="Atrás">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button onClick={() => navigate('/admin/dashboard')} title="Home">
          <FontAwesomeIcon icon={faHome} />
        </button>
        <button onClick={handleLogout} title="Cerrar Sesión">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>

      <h1>Bienvenido, Admin</h1>

      <div className="quick-stats">
        <div className="stats-card">
          <h3>Usuarios Registrados</h3>
          <p>{userCount}</p>
        </div>
        <div className="stats-card">
          <h3>Asesores Pendientes</h3>
          <p>{pendingAdvisors}</p>
        </div>
        <div className="stats-card">
          <h3>Solicitudes de Asesoría</h3>
          <p>{pendingAppointments}</p>
        </div>
      </div>

      <h2>Funciones del Administrador</h2>

      <ul className="admin-functions-list">
        <li>
          <Link to="/admin/review">
            <button className="admin-btn">
              <FontAwesomeIcon icon={faUserCheck} /> Revisión de Solicitudes de Asesores
            </button>
          </Link>
        </li>
        <li>
          <Link to="/admin/statistics">
            <button className="admin-btn">
              <FontAwesomeIcon icon={faChartLine} /> Estadísticas del Sitio
            </button>
          </Link>
        </li>
        <li>
          <Link to="/admin/users">
            <button className="admin-btn">
              <FontAwesomeIcon icon={faUsers} /> Lista de Usuarios Registrados
            </button>
          </Link>
        </li>
        
        <li>
          <Link to="/admin/activity-graph">
            <button className="admin-btn">
              <FontAwesomeIcon icon={faChartLine} /> Ver Gráficas
            </button>
          </Link>
        </li>
        
      </ul>
    </div>
  );
}

export default AdminDashboard;