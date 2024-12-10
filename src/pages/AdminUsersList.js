import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './Estilos/AdminUsersList.css'; // Importar los nuevos estilos

function AdminUsersList() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role');

        if (error) {
          setMessage(`Error al obtener los usuarios: ${error.message}`);
        } else {
          setUsers(data);
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="admin-users-list-container">
      {/* Botón Atrás */}
      <div className="activity-graph-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FontAwesomeIcon icon={faArrowLeft} /> Atrás
        </button>
      </div>

      <h2>Lista de Usuarios Registrados</h2>
      {message && <p className="message">{message}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.id} className="user-item">
            <p><strong>Nombre:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.role === 'user' ? 'Usuario' : 'Asesor'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminUsersList;
