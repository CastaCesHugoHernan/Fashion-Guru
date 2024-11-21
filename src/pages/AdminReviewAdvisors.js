// src/pages/AdminReviewAdvisors.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import './Estilos/AdminReviewAdvisors.css'; // Importar estilos

function AdminReviewAdvisors() {
  const [advisorRequests, setAdvisorRequests] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAdvisorRequests = async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select('id, name, email, specialization, certification, approved')
        .eq('approved', false); // Filtrar por asesores no aprobados

      if (error) {
        setMessage(`Error al cargar solicitudes: ${error.message}`);
      } else {
        setAdvisorRequests(data);
      }
    };

    fetchAdvisorRequests();
  }, []);

  const handleApprove = async (id) => {
    const { error } = await supabase
      .from('advisors')
      .update({ approved: true })
      .eq('id', id);

    if (error) {
      setMessage(`Error al aprobar asesor: ${error.message}`);
    } else {
      setMessage('Asesor aprobado exitosamente');
      setAdvisorRequests(advisorRequests.filter(advisor => advisor.id !== id)); // Remover asesor aprobado
    }
  };

  const handleReject = async (id) => {
    const { error } = await supabase
      .from('advisors')
      .delete()
      .eq('id', id);

    if (error) {
      setMessage(`Error al rechazar asesor: ${error.message}`);
    } else {
      setMessage('Asesor rechazado exitosamente');
      setAdvisorRequests(advisorRequests.filter(advisor => advisor.id !== id)); // Remover asesor rechazado
    }
  };

  return (
    <div className="admin-review-container">
      <h2>Revisión de Solicitudes de Asesores</h2>
      {message && <p className="message">{message}</p>}
      <div className="advisor-cards">
        {advisorRequests.map((advisor) => (
          <div key={advisor.id} className="advisor-card">
            <p><strong>Nombre:</strong> {advisor.name}</p>
            <p><strong>Email:</strong> {advisor.email}</p>
            <p><strong>Especialización:</strong> {advisor.specialization}</p>
            <p><strong>Certificación:</strong> {advisor.certification}</p>
            <div className="button-group">
              <button className="approve-btn" onClick={() => handleApprove(advisor.id)}>Aprobar</button>
              <button className="reject-btn" onClick={() => handleReject(advisor.id)}>Rechazar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminReviewAdvisors;
