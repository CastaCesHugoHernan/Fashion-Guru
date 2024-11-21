// src/pages/LoginUser.js
import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

function LoginUser() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Intentar primero verificar si es el administrador
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('email', email)
      .eq('password', password)
      .eq('role', 'admin')
      .single();

    if (adminData) {
      setMessage('Bienvenido, Admin');
      localStorage.setItem('admin', true);  // Guardamos en localStorage que es administrador
      navigate('/admin/dashboard');        // Redirige al dashboard del administrador
      return;
    }

    if (adminError) {
      // Intentar en la tabla 'users' para usuarios regulares
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (userError) {
        // Intentar en la tabla 'advisors' si no es un usuario regular
        const { data: advisorData, error: advisorError } = await supabase
          .from('advisors')
          .select('id, name, approved')  // Incluye el estado 'approved'
          .eq('email', email)
          .eq('password', password)
          .single();

        if (advisorError) {
          setMessage('Error: Usuario o contraseña incorrectos.');
        } else {
          // Verificar si el asesor ha sido aprobado, rechazado o está en proceso
          if (advisorData.approved === null) {
            setMessage('Tu solicitud de registro está en proceso de revisión por parte del administrador.');
          } else if (advisorData.approved === false) {
            setMessage('Tu solicitud de registro está pendiente de revisión.');
          } else if (advisorData.approved === true) {
            setMessage(`Bienvenido, ${advisorData.name}`);
            localStorage.setItem('advisor_id', advisorData.id);
            navigate('/advisor/dashboard');
          }
        }
      } else {
        setMessage(`Bienvenido, ${userData.name}`);
        localStorage.setItem('user_id', userData.id);
        navigate('/user/dashboard');
      }
    }
  };

  return (
    <div>
      <h2>Inicio de Sesión</h2>
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
      <p>{message}</p>

      <p>¿No tienes una cuenta?</p>
      <Link to="/register">
        <button>Crea una nueva cuenta</button>
      </Link>

      <p>O</p>
      <Link to="/">
        <button>Volver a la pantalla de inicio</button>
      </Link>
    </div>
  );
}

export default LoginUser;
