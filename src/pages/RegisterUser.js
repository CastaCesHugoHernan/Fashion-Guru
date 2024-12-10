import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import './Estilos/RegisterUser.css'; // Importar los estilos específicos para RegisterUser

function RegisterUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Usuario o Asesor
  const [specialization, setSpecialization] = useState('');
  const [certification, setCertification] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      if (role === 'user') {
        const { error: userError } = await supabase.from('users').insert([
          { name, email, password, role }
        ]);

        if (userError) {
          if (userError.code === '23505') {
            setMessage('El correo electrónico ya está registrado. Por favor, intenta con otro.');
          } else {
            setMessage(`Error: ${userError.message}`);
          }
          return;
        }
      } else if (role === 'advisor') {
        const { error: advisorError } = await supabase.from('advisors').insert([
          { name, email, password, specialization, certification, approved: false }
        ]);

        if (advisorError) {
          if (advisorError.code === '23505') {
            setMessage('El correo electrónico ya está registrado. Por favor, intenta con otro.');
          } else {
            setMessage(`Error al registrar al asesor: ${advisorError.message}`);
          }
          return;
        }
      }

      setMessage('Usuario registrado exitosamente');
    } catch (error) {
      setMessage(`Error inesperado: ${error.message}`);
    }
  };

  return (
    <div className="register-container">
      <h2>Registro de Usuario</h2>
      <form className="register-form" onSubmit={handleRegister}>
        <label>
          Nombre:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Rol:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Usuario</option>
            <option value="advisor">Asesor</option>
          </select>
        </label>

        {role === 'advisor' && (
          <>
            <label>
              Especialización:
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
              />
            </label>
            <label>
              Certificación (URL):
              <input
                type="text"
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                required
              />
            </label>
          </>
        )}

        <button type="submit">Registrar</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default RegisterUser;
