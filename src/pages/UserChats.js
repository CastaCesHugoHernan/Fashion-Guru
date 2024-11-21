// src/pages/UserChats.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import './Estilos/UserChats.css'; // Archivo CSS específico para esta sección

function UserChats() {
  const [chatRooms, setChatRooms] = useState([]);
  const [message, setMessage] = useState('');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchChatRooms = async () => {
      // Obtener las salas de chat donde el usuario está involucrado
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          appointment_id,
          advisors ( name ),
          appointments ( date, time )
        `)
        .eq('user_id', userId);

      if (error) {
        setMessage(`Error al cargar salas de chat: ${error.message}`);
      } else {
        setChatRooms(data);
      }
    };

    fetchChatRooms();
  }, [userId]);

  return (
    <div className="chat-container">
      <h1>Chats con Asesores</h1>
      {message && <p>{message}</p>}
      <section className="chat-section">
        {chatRooms.length > 0 ? (
          chatRooms.map((chatRoom) => (
            <div key={chatRoom.id} className="chat-room-item">
              <div className="chat-header">
                <h3>Asesor: {chatRoom.advisors.name}</h3>
                <span>{new Date(chatRoom.appointments.date).toLocaleDateString()}</span>
              </div>
              <p>Hora de la cita: {chatRoom.appointments.time}</p>
              <Link to={`/chat/room/${chatRoom.id}`}>
                <button className="chat-button">Acceder al Chat</button>
              </Link>
            </div>
          ))
        ) : (
          <p>No tienes chats habilitados con asesores.</p>
        )}
      </section>
    </div>
  );
}

export default UserChats;
    