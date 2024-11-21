import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import RegisterUser from './pages/RegisterUser';
import LoginUser from './pages/LoginUser';
import UserDashboard from './pages/UserDashboard';
import AdvisorDashboard from './pages/AdvisorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ScheduleAppointment from './pages/ScheduleAppointment';
import ViewAppointments from './pages/ViewAppointments';
import AdvisorAppointments from './pages/AdvisorAppointments';
import Community from './pages/Community';
import AdminReviewAdvisors from './pages/AdminReviewAdvisors';
import AdminStatistics from './pages/AdminStatistics';
import AdminUsersList from './pages/AdminUsersList';
import Chat from './pages/Chat';
import UserChats from './pages/UserChats'; // Importa el nuevo componente de Chats

// Componente para proteger las rutas (Solo permite el acceso si es administrador)
const ProtectedRoute = ({ children, redirectTo }) => {
  const isAdmin = localStorage.getItem('admin');
  return isAdmin ? children : <Navigate to={redirectTo} />;
};

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Rutas generales */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/login" element={<LoginUser />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/schedule" element={<ScheduleAppointment />} />
          <Route path="/user/appointments" element={<ViewAppointments />} />
          <Route path="/user/community" element={<Community />} />

          {/* Ruta para el chat con asesores */}
          <Route path="/user/chats" element={<UserChats />} /> {/* Nueva ruta para el chat */}

          {/* Ruta para el chat dentro de una sala específica */}
          <Route path="/chat/room/:chatRoomId" element={<Chat />} />

          {/* Rutas del asesor */}
          <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
          <Route path="/advisor/appointments" element={<AdvisorAppointments />} />

          {/* Rutas para administrador con protección */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute redirectTo="/login">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/review" element={
            <ProtectedRoute redirectTo="/login">
              <AdminReviewAdvisors />
            </ProtectedRoute>
          } />
          <Route path="/admin/statistics" element={
            <ProtectedRoute redirectTo="/login">
              <AdminStatistics />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute redirectTo="/login">
              <AdminUsersList />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
