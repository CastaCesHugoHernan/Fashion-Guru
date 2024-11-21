// src/pages/UserDashboard.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Estilos/UserDashboard.css'; // Archivo de estilos específico para el Dashboard
import Community from './Community'; // Importa la comunidad de estilo

function UserDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Limpia el localStorage para cerrar sesión
    navigate('/'); // Redirige al Home (página de inicio)
  };

  return (
    <div className="dashboard-container">
      {/* Botones de navegación y cierre de sesión en la esquina superior derecha */}
      <div className="top-right-buttons">
        <button onClick={() => navigate(-1)} title="Atrás">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button onClick={() => navigate('/user/dashboard')} title="Home">
          <FontAwesomeIcon icon={faHome} />
        </button>
        <button onClick={handleLogout} title="Cerrar Sesión">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>

      {/* Menú lateral */}
      <aside className="sidebar">
        <h2>Menú del Usuario</h2>
        <ul>
          <li><Link to="/user/schedule">Agendar Asesoría</Link></li>
          <li><Link to="/user/appointments">Ver Asesorías Agendadas</Link></li>
          <li><Link to="/user/chats">Chats con Asesores</Link></li> {/* Nueva opción para los chats */}
        </ul>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <h1>Comunidad de Estilo</h1>
        {/* Mostrar la Comunidad de Estilo como la vista principal */}
        <Community />
      </main>
    </div>
  );
}

export default UserDashboard;
