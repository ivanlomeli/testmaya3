import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

function AdminPage() {
    const [metrics, setMetrics] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [error, setError] = useState(null);
    
    // Verificar si el usuario está logueado y es admin
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const token = localStorage.getItem('auth_token');
    
    // Redirigir si no es admin
    if (!token || !userData || userData.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Función para obtener métricas del backend
    const fetchMetrics = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/metrics', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Métricas cargadas:', data);
            setMetrics(data);
        } catch (error) {
            console.error('Error cargando métricas:', error);
            setError('Error al cargar métricas: ' + error.message);
        }
    };

    // Función para obtener negocios
    const fetchBusinesses = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/businesses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Negocios cargados:', data);
            setBusinesses(data);
        } catch (error) {
            console.error('Error cargando negocios:', error);
            setError('Error al cargar negocios: ' + error.message);
        }
    };

    // Función para obtener reservas
    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Reservas cargadas:', data);
            setBookings(data);
        } catch (error) {
            console.error('Error cargando reservas:', error);
            setError('Error al cargar reservas: ' + error.message);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                await fetchMetrics();
                await fetchBusinesses(); 
                await fetchBookings();
            } catch (err) {
                setError('Error al cargar datos del panel');
            }
            
            setLoading(false);
        };
        
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow">
                    <div className="text-xl">Cargando panel de administración...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow max-w-md">
                    <div className="text-xl text-red-600 mb-4">Error</div>
                    <div className="text-gray-700">{error}</div>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                            Panel de Administración - Maya Digital
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-3 py-2 text-sm rounded ${
                                    activeTab === 'dashboard' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('businesses')}
                                className={`px-3 py-2 text-sm rounded ${
                                    activeTab === 'businesses' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Negocios
                            </button>
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`px-3 py-2 text-sm rounded ${
                                    activeTab === 'bookings' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Reservas
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {activeTab === 'dashboard' && (
                    <DashboardTab metrics={metrics} />
                )}
                {activeTab === 'businesses' && (
                    <BusinessesTab businesses={businesses} />
                )}
                {activeTab === 'bookings' && (
                    <BookingsTab bookings={bookings} />
                )}
            </div>
        </div>
    );
}

// Componente para la pestaña Dashboard  
function DashboardTab({ metrics }) {
    if (!metrics) {
        return (
            <div className="bg-white p-8 rounded-lg shadow">
                <div>No se pudieron cargar las métricas</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                    title="Total Hoteles"
                    value={metrics.total_hotels || 0}
                    color="blue"
                />
                <MetricCard
                    title="Total Usuarios" 
                    value={metrics.total_users || 0}
                    color="green"
                />
                <MetricCard
                    title="Total Reservas"
                    value={metrics.total_bookings || 0}
                    color="purple"
                />
                <MetricCard
                    title="Hoteles Pendientes"
                    value={metrics.pending_hotels || 0}
                    color="yellow"
                />
            </div>

            {/* Segunda fila de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <MetricCard
                    title="Ingresos Totales"
                    value={`$${(metrics.total_revenue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`}
                    subtitle="Revenue total"
                    color="green"
                />
                <MetricCard
                    title="Reservas Este Mes"
                    value={metrics.bookings_this_month || 0}
                    subtitle="Reservas del mes actual"
                    color="blue"
                />
                <MetricCard
                    title="Nuevos Usuarios"
                    value={metrics.new_users_this_month || 0}
                    subtitle="Usuarios nuevos este mes"
                    color="indigo"
                />
            </div>
        </div>
    );
}

// Componente para mostrar métricas individuales
function MetricCard({ title, value, subtitle, color = "blue" }) {
    const colorClasses = {
        blue: "border-blue-500 text-blue-600",
        green: "border-green-500 text-green-600", 
        purple: "border-purple-500 text-purple-600",
        indigo: "border-indigo-500 text-indigo-600",
        yellow: "border-yellow-500 text-yellow-600"
    };

    return (
        <div className={`bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 ${colorClasses[color]}`}>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                {title}
            </h3>
            <p className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                {value}
            </p>
            {subtitle && (
                <p className="mt-2 text-xs sm:text-sm text-gray-600">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

// Componente para la pestaña de Negocios
function BusinessesTab({ businesses }) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Lista de Negocios</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Nombre
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Tipo
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Ubicación
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Reservas
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {businesses.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                                    No hay negocios registrados
                                </td>
                            </tr>
                        ) : (
                            businesses.map((business) => (
                                <tr key={business.id}>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {business.name}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {business.business_type}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {business.location}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {business.total_bookings}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            business.status === 'approved' 
                                                ? 'bg-green-100 text-green-800'
                                                : business.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {business.status === 'approved' ? 'Aprobado' : 
                                             business.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Componente para la pestaña de Reservas
function BookingsTab({ bookings }) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Reservas Recientes</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Usuario
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Servicio
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Monto
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                                    No hay reservas registradas
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {booking.user_email}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {booking.service_name}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${booking.total_amount?.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            booking.status === 'confirmed' 
                                                ? 'bg-green-100 text-green-800'
                                                : booking.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {booking.status === 'confirmed' ? 'Confirmada' : 
                                             booking.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPage;