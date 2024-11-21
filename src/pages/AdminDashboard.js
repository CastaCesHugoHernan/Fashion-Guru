// src/pages/AdminDashboard.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faChartLine, faUsers, faArrowLeft, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Estilos/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();

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
          <p>125</p> {/* Este número puede venir de tu base de datos */}
        </div>
        <div className="stats-card">
          <h3>Asesores Pendientes</h3>
          <p>10</p> {/* Este número puede venir de tu base de datos */}
        </div>
        <div className="stats-card">
          <h3>Solicitudes de Asesoría</h3>
          <p>8</p> {/* Este número puede venir de tu base de datos */}
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
      </ul>
    </div>
  );
}

export default AdminDashboard;
