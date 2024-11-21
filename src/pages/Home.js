// src/pages/Home.js
import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import './Estilos/HomePage.css'; // Asegúrate de mantener los estilos aplicados

function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Intentar verificar si es el administrador
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

      {/* Contenido principal de bienvenida */}
      <main>
        <h1>Bienvenido a la Plataforma de Asesoría de Moda</h1>
        <p>Explora nuestra comunidad, agenda asesorías con expertos en moda y mucho más.</p>

        {/* Formulario para iniciar sesión */}
        <div className="menu-container">
          <h2>Inicia Sesión</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Iniciar Sesión</button>
          </form>
          {message && <p>{message}</p>}
          
          {/* Enlace para registrar cuenta nueva debajo */}
          <p className="footer">
            ¿No tienes cuenta? 
            <Link to="/register" style={{ color: '#00ffcc', textDecoration: 'none' }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Home;
