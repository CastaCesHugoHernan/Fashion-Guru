import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './Estilos/ActivityGraph.css';

// Registrar elementos necesarios para Chart.js
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

function ActivityGraph() {
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState(null);
  const [retentionData, setRetentionData] = useState(null);
  const [advisorData, setAdvisorData] = useState(null);
  const [appointmentsData, setAppointmentsData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [postsData, setPostsData] = useState(null); // Nueva variable para las publicaciones
  const [analysisResult, setAnalysisResult] = useState(null);
  const [appointmentsAnalysis, setAppointmentsAnalysis] = useState(null);
  const [comparisonAnalysis, setComparisonAnalysis] = useState(null);
  const [postsAnalysis, setPostsAnalysis] = useState(null); // Nueva variable para el análisis de publicaciones

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const { data: users } = await supabase.from('users').select('created_at, id');
        const { data: posts } = await supabase.from('posts').select('user_id, created_at');
        const { data: appointments } = await supabase.from('appointments').select('date');
        const { data: advisors } = await supabase.from('advisors').select('approved');

        // Orden de meses y días
        const monthOrder = [
          'enero',
          'febrero',
          'marzo',
          'abril',
          'mayo',
          'junio',
          'julio',
          'agosto',
          'septiembre',
          'octubre',
          'noviembre',
          'diciembre',
        ];

        const dayOrder = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

        const groupByMonth = (data, key = 'created_at') =>
          data.reduce((acc, item) => {
            const date = new Date(item[key]);
            const month = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {});

        const groupByDayOfWeek = (data) =>
          data.reduce((acc, item) => {
            const date = new Date(item.date);
            const day = date.toLocaleString('es-ES', { weekday: 'long' }).toLowerCase();
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          }, {});

        const sortByOrder = (data, order) =>
          Object.entries(data)
            .sort(([a], [b]) => order.indexOf(a.split(' ')[0].toLowerCase()) - order.indexOf(b.split(' ')[0].toLowerCase()))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        const userCounts = sortByOrder(groupByMonth(users), monthOrder);
        const postCounts = sortByOrder(groupByMonth(posts), monthOrder);
        const appointmentCounts = sortByOrder(groupByMonth(appointments, 'date'), monthOrder);

        const labels = Array.from(
          new Set([...Object.keys(userCounts), ...Object.keys(postCounts), ...Object.keys(appointmentCounts)])
        );

        setActivityData({
          labels,
          datasets: [
            {
              label: 'Usuarios Registrados',
              data: labels.map((label) => userCounts[label] || 0),
              borderColor: 'rgba(75,192,192,1)',
              fill: false,
            },
            {
              label: 'Publicaciones Realizadas',
              data: labels.map((label) => postCounts[label] || 0),
              borderColor: 'rgba(255,99,132,1)',
              fill: false,
            },
            {
              label: 'Citas Agendadas',
              data: labels.map((label) => appointmentCounts[label] || 0),
              borderColor: 'rgba(54,162,235,1)',
              fill: false,
            },
          ],
        });

        const appointmentsByDay = sortByOrder(groupByDayOfWeek(appointments), dayOrder);

        setAppointmentsData({
          labels: Object.keys(appointmentsByDay),
          datasets: [
            {
              label: 'Citas Agendadas',
              data: Object.values(appointmentsByDay),
              backgroundColor: 'rgba(54,162,235,0.6)',
              borderColor: 'rgba(54,162,235,1)',
              borderWidth: 1,
            },
          ],
        });

        const activeUsers = new Set([...posts.map((p) => p.user_id), ...appointments.map((a) => a.user_id)]);
        setRetentionData({
          labels: ['Retención'],
          datasets: [
            {
              label: 'Porcentaje de Retención',
              data: [(activeUsers.size / users.length) * 100],
              borderColor: 'rgba(75,192,192,1)',
              backgroundColor: 'rgba(75,192,192,0.2)',
              fill: true,
            },
          ],
        });

        const approvedCount = advisors.filter((advisor) => advisor.approved).length;
        const pendingCount = advisors.length - approvedCount;

        setAdvisorData({
          labels: ['Aprobados', 'Pendientes'],
          datasets: [
            {
              label: 'Proporción de Asesores',
              data: [approvedCount, pendingCount],
              backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
              borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
              borderWidth: 1,
            },
          ],
        });

        setComparisonData({
          labels: ['Usuarios Registrados', 'Asesores Aprobados', 'Publicaciones', 'Citas Agendadas'],
          datasets: [
            {
              label: 'Comparativa General',
              data: [users.length, approvedCount, posts.length, appointments.length],
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });

        // Nueva lógica para las publicaciones en la comunidad
        const postsByMonth = sortByOrder(groupByMonth(posts), monthOrder);
        setPostsData({
          labels: Object.keys(postsByMonth),
          datasets: [
            {
              label: 'Publicaciones en la Comunidad',
              data: Object.values(postsByMonth),
              backgroundColor: 'rgba(255, 206, 86, 0.6)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error al obtener los datos:', error.message);
      }
    };

    fetchActivityData();
  }, []);

  const executeAnalysis = () => {
    if (!activityData) return;

    const dayActivity = activityData.labels.reduce((acc, label, index) => {
      const date = new Date(label);
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
      acc[dayName] = (acc[dayName] || 0) + activityData.datasets.reduce((sum, dataset) => {
        return sum + dataset.data[index];
      }, 0);
      return acc;
    }, {});

    const mostActiveDay = Object.entries(dayActivity).reduce((a, b) => (a[1] > b[1] ? a : b));

    setAnalysisResult(`El día con más actividad promedio es: ${mostActiveDay[0]}`);
  };

  const executeAppointmentsAnalysis = () => {
    if (!appointmentsData) return;

    const maxDay = appointmentsData.labels.reduce((acc, label, index) => {
      const value = appointmentsData.datasets[0].data[index];
      if (value > acc.value) return { day: label, value };
      return acc;
    }, { day: null, value: 0 });

    setAppointmentsAnalysis(`El día de la semana con más citas es: ${maxDay.day}`);
  };

  const executeComparisonAnalysis = () => {
    if (!comparisonData) return;

    const totals = comparisonData.datasets[0].data;
    const labels = comparisonData.labels;

    const maxIndex = totals.indexOf(Math.max(...totals));
    const minIndex = totals.indexOf(Math.min(...totals));

    setComparisonAnalysis(
      `El área más destacada es: ${labels[maxIndex]} (${totals[maxIndex]}). 
      El área con menos actividad es: ${labels[minIndex]} (${totals[minIndex]}).`
    );
  };

  const executePostsAnalysis = async () => {
    try {
      const { data: users } = await supabase.from('users').select('id, name');
      const { data: posts } = await supabase.from('posts').select('user_id');

      // Contar las publicaciones por usuario
      const userPostCounts = posts.reduce((acc, post) => {
        acc[post.user_id] = (acc[post.user_id] || 0) + 1;
        return acc;
      }, {});

      // Obtener los dos usuarios más activos
      const topUsers = Object.entries(userPostCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([userId, count]) => {
          const user = users.find((u) => u.id === userId);
          return `${user?.name || 'Usuario desconocido'} (${count} publicaciones)`;
        });

      setPostsAnalysis(
        topUsers.length
          ? `Usuarios más activos:\n1. ${topUsers[0] || 'N/A'}\n 2. ${topUsers[1] || 'N/A'}`
          : 'No se encontraron usuarios activos.'
      );
    } catch (error) {
      console.error('Error al analizar los datos de publicaciones:', error.message);
      setPostsAnalysis('Error al analizar los datos de publicaciones.');
    }
  };

  return (
    <div className="activity-graph-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        <FontAwesomeIcon icon={faArrowLeft} /> Atrás
      </button>
      <h1>Gráficas de Actividad</h1>

      {/* Actividad Temporal */}
      <h2>Actividad Temporal</h2>
      {activityData ? (
        <>
          <Line
            data={activityData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Actividad Mensual' },
              },
              scales: {
                x: { title: { display: true, text: 'Mes' } },
                y: { title: { display: true, text: 'Cantidad' } },
              },
            }}
          />
          <button onClick={executeAnalysis} className="analysis-btn">
            Ejecutar Análisis
          </button>
          {analysisResult && <p>{analysisResult}</p>}
        </>
      ) : (
        <p>Cargando datos de actividad...</p>
      )}

      {/* Retención de Usuarios */}
      <h2>Retención de Usuarios</h2>
      {retentionData && <Line data={retentionData} options={{ responsive: true }} />}

      {/* Proporción de Asesores */}
      <h2>Proporción de Asesores</h2>
      {advisorData && <Doughnut data={advisorData} options={{ responsive: true }} />}

      {/* Citas Agendadas */}
      <h2>Citas Agendadas</h2>
      {appointmentsData ? (
        <>
          <Bar
            data={appointmentsData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Citas Agendadas por Día de la Semana' },
              },
              scales: {
                x: { title: { display: true, text: 'Día' } },
                y: { title: { display: true, text: 'Cantidad' } },
              },
            }}
          />
          <button onClick={executeAppointmentsAnalysis} className="analysis-btn">
            Ejecutar Análisis
          </button>
          {appointmentsAnalysis && <p>{appointmentsAnalysis}</p>}
        </>
      ) : (
        <p>Cargando datos de citas...</p>
      )}

      {/* Publicaciones en la Comunidad */}
      <h2>Publicaciones en la Comunidad</h2>
      {postsData ? (
        <>
          <Bar
            data={postsData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Publicaciones en la Comunidad' },
              },
              scales: {
                x: { title: { display: true, text: 'Mes' } },
                y: { title: { display: true, text: 'Cantidad' } },
              },
            }}
          />
          <button
            onClick={executePostsAnalysis}
            className="analysis-btn"
          >
            Ejecutar Análisis
          </button>
          {postsAnalysis && <p className="analysis-result"  style={{ color: '#00ffcc' }} >{postsAnalysis}</p>}
        </>
      ) : (
        <p>Cargando datos de publicaciones...</p>
      )}

      {/* Comparativa General */}
      <h2>Comparativa General</h2>
      {comparisonData ? (
        <>
          <Pie
            data={comparisonData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Comparativa General' },
              },
            }}
          />
          <button onClick={executeComparisonAnalysis} className="analysis-btn">
            Ejecutar Análisis
          </button>
          {comparisonAnalysis && <p>{comparisonAnalysis}</p>}
        </>
      ) : (
        <p>Cargando datos de comparación...</p>
      )}
    </div>
  );
}

export default ActivityGraph;
