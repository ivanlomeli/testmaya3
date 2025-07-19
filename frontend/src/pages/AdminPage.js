import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Función helper para centralizar las llamadas fetch, añadir el token
 * y manejar errores de forma consistente.
 */
const fetchAdminData = async (endpoint, options = {}) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        throw new Error('No se encontró el token de autenticación.');
    }

    const response = await fetch(`http://127.0.0.1:8080/api/admin/${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error en el endpoint [${endpoint}]:`, response.status, errorBody);
        throw new Error(`Error del servidor (${response.status}) en ${endpoint}: ${errorBody}`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength === "0" || response.status === 204) {
        return null;
    }

    return response.json();
};

function AdminPage() {
    const [metrics, setMetrics] = useState(null);
    const [businesses, setBusinesses] = useState(null);
    const [bookings, setBookings] = useState(null);
    const [pendingHotels, setPendingHotels] = useState([]); // <-- AÑADIDO: Estado para hoteles pendientes
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [error, setError] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(undefined);

    useEffect(() => {
        console.log('---[AdminPage Mounted]---');
        try {
            const userDataString = localStorage.getItem('user_data');
            const token = localStorage.getItem('auth_token');
            if (!token || !userDataString) {
                console.log('❌ Auth Check: Token o datos de usuario no encontrados.');
                setIsAuthorized(false);
                return;
            }
            const userData = JSON.parse(userDataString);
            if (userData && userData.role === 'Admin') {
                console.log('✅ Auth Check: Usuario autorizado como Admin.', userData);
                setIsAuthorized(true);
            } else {
                console.log('❌ Auth Check: Rol no es "Admin". Rol encontrado:', userData.role);
                setIsAuthorized(false);
            }
        } catch (e) {
            console.error('❌ Auth Check: Error al parsear user_data de localStorage.', e);
            localStorage.clear();
            setIsAuthorized(false);
        }
    }, []);

    const loadAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        console.log('🚀 Iniciando carga de datos del panel...');

        try {
            // AÑADIDA LA LLAMADA PARA OBTENER HOTELES PENDIENTES
            const [metricsData, businessesData, bookingsData, pendingData] = await Promise.all([
                fetchAdminData('metrics'),
                fetchAdminData('businesses'),
                fetchAdminData('bookings'),
                fetchAdminData('hotels/pending')
            ]);
            
            setMetrics(metricsData);
            setBusinesses(businessesData);
            setBookings(bookingsData);
            setPendingHotels(pendingData.hotels || []); // GUARDAMOS LOS HOTELES PENDIENTES

            console.log('🎉 Todos los datos cargados exitosamente!');
        } catch (err) {
            console.error('💥 Error durante la carga de datos del panel:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            console.log('🏁 Carga de datos finalizada.');
        }
    }, []);

    // --- NUEVA FUNCIÓN PARA MANEJAR LA APROBACIÓN/RECHAZO ---
    const handleHotelDecision = async (hotelId, action) => {
        const originalPendingHotels = [...pendingHotels];
        setPendingHotels(current => current.filter(h => h.id !== hotelId));

        try {
            const endpoint = `hotels/${hotelId}/${action}`;
            await fetchAdminData(endpoint, { method: 'PUT' });
            await loadAllData(); // Recargamos todo para mantener consistencia
        } catch (err) {
            setError(`No se pudo completar la acción: ${err.message}`);
            setPendingHotels(originalPendingHotels); // Revertir en caso de error
        }
    };


    useEffect(() => {
        if (isAuthorized === true) {
            loadAllData();
        }
    }, [isAuthorized, loadAllData]);

    if (isAuthorized === undefined) { /* ... codigo base sin camvios v anterior ... */ }
    if (!isAuthorized) { /* ... codigo base sin camvios v anterior ... */ }
    if (loading) { /* ... codigo base sin camvios v anterior ... */ }
    if (error) { /* ... codigo base sin camvios v anterior ... */ }

    // Array de pestañas ahora es dinámico
    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'pending', label: `Aprobaciones (${pendingHotels.length})`, highlight: pendingHotels.length > 0 },
        { id: 'businesses', label: 'Negocios' },
        { id: 'bookings', label: 'Reservas' }
    ];
    
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">🏛️ Panel de Administración</h1>
                    <div className="flex space-x-2">
                         {/* Renderizado dinámico de pestañas */}
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm rounded-md font-semibold transition-colors duration-200 ${
                                    activeTab === tab.id 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                            >
                                {tab.label}
                                {tab.highlight && <span className="ml-1.5 inline-block w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && metrics && <DashboardTab metrics={metrics} />}
                {activeTab === 'pending' && <PendingHotelsTab hotels={pendingHotels} onDecision={handleHotelDecision} />}
                {activeTab === 'businesses' && businesses && <BusinessesTab businesses={businesses} />}
                {activeTab === 'bookings' && bookings && <BookingsTab bookings={bookings} />}
            </main>
        </div>
    );
}


// --- COMPONENTES DE PESTAÑAS EXISTENTES ( CÓDIGO ORIGINAL INTACTO) ---

function DashboardTab({ metrics }) {
    const metricCards = [
        { title: "Total Hoteles", value: metrics.total_hotels, subtitle: `Pendientes: ${metrics.pending_hotels}` },
        { title: "Total Usuarios", value: metrics.total_users, subtitle: `Nuevos este mes: ${metrics.new_users_this_month}` },
        { title: "Total Reservas", value: metrics.total_bookings, subtitle: `Este mes: ${metrics.bookings_this_month}` },
        { title: "Ingresos Totales", value: `$${(metrics.total_revenue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, subtitle: "MXN" }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map(card => <MetricCard key={card.title} {...card} />)}
        </div>
    );
}

function BusinessesTab({ businesses }) {
    if (!businesses || businesses.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow">No hay negocios para mostrar.</div>;
    }
    return (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Negocio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {businesses.map((biz) => (
                        <tr key={biz.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">#{biz.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{biz.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={biz.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biz.total_bookings}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(biz.total_revenue || 0).toLocaleString('es-MX')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function BookingsTab({ bookings }) {
     if (!bookings || bookings.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow">No hay reservas para mostrar.</div>;
    }
    return (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referencia</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{booking.booking_reference}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.user_email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.service_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(booking.total_amount || 0).toLocaleString('es-MX')}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={booking.status} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


// --- NUEVO COMPONENTE AÑADIDO PARA LA PESTAÑA DE APROBACIONES ---
function PendingHotelsTab({ hotels, onDecision }) {
    if (!hotels || hotels.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow">✅ No hay negocios pendientes de aprobación.</div>;
    }
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hoteles Esperando Aprobación</h2>
            {hotels.map(hotel => (
                <div key={hotel.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-6">
                    <img src={hotel.image_url || 'https://via.placeholder.com/200x200'} alt={hotel.name} className="w-full md:w-48 h-48 object-cover rounded-lg"/>
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold">{hotel.name}</h3>
                        <p className="text-gray-500">{hotel.location}</p>
                        <p className="mt-2 text-sm text-gray-700">{hotel.address}</p>
                        <div className="mt-4 pt-4 border-t border-dashed">
                            <p className="text-sm"><span className="font-semibold">Precio:</span> ${hotel.price || 'N/A'} MXN</p>
                            <p className="text-sm"><span className="font-semibold">Email:</span> {hotel.email}</p>
                            <p className="text-sm"><span className="font-semibold">Propietario:</span> {hotel.owner.first_name} {hotel.owner.last_name} ({hotel.owner.owner_email})</p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-3 justify-center flex-shrink-0">
                         <button onClick={() => onDecision(hotel.id, 'approve')} className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition">
                            Aprobar
                        </button>
                        <button onClick={() => onDecision(hotel.id, 'reject')} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition">
                            Rechazar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}


// --- COMPONENTES DE UI REUTILIZABLES (CÓDIGO ORIGINAL INTACTO) ---

const MetricCard = ({ title, value, subtitle }) => (
    <div className="bg-white rounded-xl shadow p-6 transition hover:shadow-lg hover:-translate-y-1">
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
);

const StatusBadge = ({ status }) => {
    const statusStyles = {
        approved: 'bg-green-100 text-green-800',
        confirmed: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        rejected: 'bg-red-100 text-red-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    const statusText = {
        approved: 'Aprobado',
        confirmed: 'Confirmada',
        pending: 'Pendiente',
        rejected: 'Rechazado',
        cancelled: 'Cancelada',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {statusText[status] || status}
        </span>
    );
};

export default AdminPage;