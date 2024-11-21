import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import './Chat.css'; // Asegúrate de tener este archivo para los estilos

function Chat() {
  const { chatRoomId } = useParams(); // Obtener el ID de la sala de chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const userId = localStorage.getItem('user_id'); // ID del usuario
  const advisorId = localStorage.getItem('advisor_id'); // ID del asesor
  const [message, setMessage] = useState('');

  // Validar la participación en la sala de chat
  const validateParticipant = async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('user_id, advisor_id')
      .eq('id', chatRoomId)
      .single();

    if (error) {
      setMessage(`Error al validar el participante: ${error.message}`);
      return false;
    }

    // Verifica si el remitente (usuario o asesor) está en la sala de chat
    return data.user_id === userId || data.advisor_id === advisorId;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      // Obtener los mensajes en la sala de chat específica
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, sender_id, sender_type, created_at') // Incluye sender_type
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true });

      if (error) {
        setMessage(`Error al cargar mensajes: ${error.message}`);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  // Escuchar mensajes en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('public:messages') // Canal de la tabla messages
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // Actualizar mensajes cuando se detecta un nuevo INSERT
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .subscribe();

    return () => {
      // Eliminar la suscripción cuando se desmonte el componente
      supabase.removeChannel(channel);
    };
  }, [chatRoomId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      setMessage('No puedes enviar un mensaje vacío.');
      return;
    }

    // Validar si el remitente es un participante de la sala de chat
    const isParticipant = await validateParticipant();
    if (!isParticipant) {
      setMessage('No estás autorizado para enviar mensajes en esta sala.');
      return;
    }

    const senderId = userId || advisorId; // Identificar al remitente
    const senderType = userId ? 'user' : 'advisor'; // Determinar el tipo de remitente

    if (!senderId) {
      setMessage('Error: No se puede determinar el remitente del mensaje.');
      return;
    }

    // Insertar el mensaje en la base de datos
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          chat_room_id: chatRoomId,
          sender_id: senderId, // Sin conversión a entero
          sender_type: senderType, // Indicar el tipo de remitente
          content: newMessage,
        },
      ]);

    if (error) {
      setMessage(`Error al enviar el mensaje: ${error.message}`);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat</h2>
      {message && <p>{message}</p>}

      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.sender_type === 'user'
                  ? 'user-message' // Mensaje del usuario
                  : 'advisor-message' // Mensaje del asesor
              }`}
            >
              <p>{msg.content}</p>
              <small>{new Date(msg.created_at).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>No hay mensajes en esta sala de chat.</p>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje"
        />
        <button onClick={handleSendMessage}>Enviar</button>
      </div>
    </div>
  );
}

export default Chat;
