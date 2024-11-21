import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import './Estilos/AdminUsersList.css'; // Importar los nuevos estilos

function AdminUsersList() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

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
    <div>
      <h2>Lista de Usuarios Registrados</h2>
      {message && <p className="message">{message}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <p>Nombre: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Rol: {user.role === 'user' ? 'Usuario' : 'Asesor'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminUsersList;
