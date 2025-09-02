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

    const response = await fetch(`/api/admin/${endpoint}`, {
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
    const [pendingHotels, setPendingHotels] = useState([]);
    const [pendingBusinesses, setPendingBusinesses] = useState([]); // 🔥 NUEVO: Estado para negocios pendientes
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [error, setError] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(undefined);
    const [processing, setProcessing] = useState(null); // 🔥 NUEVO: Para manejar estados de procesamiento

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
            // 🔥 AGREGADA LA LLAMADA PARA OBTENER NEGOCIOS PENDIENTES
            const [metricsData, businessesData, bookingsData, pendingHotelsData, pendingBusinessesData] = await Promise.all([
                fetchAdminData('metrics'),
                fetchAdminData('businesses'),
                fetchAdminData('bookings'),
                fetchAdminData('hotels/pending'),
                fetchAdminData('businesses/pending') // 🔥 NUEVO: Obtener negocios pendientes
            ]);
            
            setMetrics(metricsData);
            setBusinesses(businessesData);
            setBookings(bookingsData);
            setPendingHotels(pendingHotelsData?.hotels || pendingHotelsData || []);
            setPendingBusinesses(pendingBusinessesData || []); // 🔥 NUEVO: Guardar negocios pendientes

            console.log('🎉 Todos los datos cargados exitosamente!');
            console.log('📊 Negocios pendientes:', pendingBusinessesData?.length || 0);
        } catch (err) {
            console.error('💥 Error durante la carga de datos del panel:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            console.log('🏁 Carga de datos finalizada.');
        }
    }, []);

    // Función para manejar la aprobación/rechazo de HOTELES
    const handleHotelDecision = async (hotelId, action) => {
        const originalPendingHotels = [...pendingHotels];
        setPendingHotels(current => current.filter(h => h.id !== hotelId));
        setProcessing(hotelId);

        try {
            const endpoint = `hotels/${hotelId}/${action}`;
            await fetchAdminData(endpoint, { method: 'PUT' });
            console.log(`✅ Hotel ${hotelId} ${action === 'approve' ? 'aprobado' : 'rechazado'}`);
            await loadAllData(); // Recargamos todo para mantener consistencia
        } catch (err) {
            setError(`No se pudo completar la acción: ${err.message}`);
            setPendingHotels(originalPendingHotels); // Revertir en caso de error
        } finally {
            setProcessing(null);
        }
    };

    // 🔥 NUEVA FUNCIÓN para manejar la aprobación/rechazo de NEGOCIOS
    const handleBusinessDecision = async (businessId, action) => {
        const originalPendingBusinesses = [...pendingBusinesses];
        setPendingBusinesses(current => current.filter(b => b.id !== businessId));
        setProcessing(businessId);

        try {
            const endpoint = `businesses/${businessId}/${action}`;
            await fetchAdminData(endpoint, { method: 'PUT' });
            console.log(`✅ Negocio ${businessId} ${action === 'approve' ? 'aprobado' : 'rechazado'}`);
            
            // Mostrar mensaje de éxito
            const actionText = action === 'approve' ? 'aprobado' : 'rechazado';
            alert(`Negocio ${actionText} exitosamente`);
            
            await loadAllData(); // Recargamos todo para mantener consistencia
        } catch (err) {
            console.error('❌ Error en decisión de negocio:', err);
            setError(`No se pudo completar la acción: ${err.message}`);
            setPendingBusinesses(originalPendingBusinesses); // Revertir en caso de error
        } finally {
            setProcessing(null);
        }
    };

    useEffect(() => {
        if (isAuthorized === true) {
            loadAllData();
        }
    }, [isAuthorized, loadAllData]);

    // Estados de carga y autorización
    if (isAuthorized === undefined) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow">
                    <div className="text-xl">Verificando autorización...</div>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return <Navigate to="/" replace />;
    }

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

    // 🔥 PESTAÑAS ACTUALIZADAS CON CONTADORES
    const totalPending = pendingHotels.length + pendingBusinesses.length;
    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { 
            id: 'pending-hotels', 
            label: `Hoteles (${pendingHotels.length})`, 
            highlight: pendingHotels.length > 0 
        },
        { 
            id: 'pending-businesses', 
            label: `Restaurantes (${pendingBusinesses.length})`, 
            highlight: pendingBusinesses.length > 0 
        },
        { id: 'businesses', label: 'Todos los Negocios' },
        { id: 'bookings', label: 'Reservas' }
    ];
    
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-2xl font-bold text-gray-900">🏛️ Panel de Administración</h1>
                        {totalPending > 0 && (
                            <p className="text-sm text-orange-600 font-medium">
                                ⚠️ {totalPending} elementos pendientes de aprobación
                            </p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                                {tab.highlight && (
                                    <span className="ml-1.5 inline-block w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && metrics && <DashboardTab metrics={metrics} />}
                {activeTab === 'pending-hotels' && (
                    <PendingHotelsTab 
                        hotels={pendingHotels} 
                        onDecision={handleHotelDecision}
                        processing={processing}
                    />
                )}
                {activeTab === 'pending-businesses' && (
                    <PendingBusinessesTab 
                        businesses={pendingBusinesses} 
                        onDecision={handleBusinessDecision}
                        processing={processing}
                    />
                )}
                {activeTab === 'businesses' && businesses && <BusinessesTab businesses={businesses} />}
                {activeTab === 'bookings' && bookings && <BookingsTab bookings={bookings} />}
            </main>
        </div>
    );
}

// --- COMPONENTES DE PESTAÑAS EXISTENTES ---

function DashboardTab({ metrics }) {
    const metricCards = [
        { title: "Total Hoteles", value: metrics.total_hotels, subtitle: `Pendientes: ${metrics.pending_hotels}` },
        { title: "Total Usuarios", value: metrics.total_users, subtitle: `Nuevos este mes: ${metrics.new_users_this_month}` },
        { title: "Total Reservas", value: metrics.total_bookings, subtitle: `Este mes: ${metrics.bookings_this_month}` },
        { title: "Ingresos Totales", value: `$${(metrics.total_revenue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, subtitle: "MXN" }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">📊 Dashboard General</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map(card => <MetricCard key={card.title} {...card} />)}
            </div>
        </div>
    );
}

function BusinessesTab({ businesses }) {
    if (!businesses || businesses.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">No hay negocios para mostrar</h3>
                <p className="text-gray-500">Los negocios aparecerán aquí una vez que sean registrados</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">🏢 Todos los Negocios</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Negocio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {businesses.map((biz) => (
                            <tr key={biz.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">#{biz.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{biz.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biz.business_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biz.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={biz.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{biz.total_bookings || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BookingsTab({ bookings }) {
    if (!bookings || bookings.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">No hay reservas para mostrar</h3>
                <p className="text-gray-500">Las reservas aparecerán aquí una vez que los usuarios realicen bookings</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">📅 Todas las Reservas</h2>
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
        </div>
    );
}

// COMPONENTE EXISTENTE PARA HOTELES PENDIENTES
function PendingHotelsTab({ hotels, onDecision, processing }) {
    if (!hotels || hotels.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">✅ No hay hoteles pendientes</h3>
                <p className="text-gray-500">Todos los hoteles han sido procesados</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">🏨 Hoteles Pendientes de Aprobación</h2>
            {hotels.map(hotel => (
                <div key={hotel.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-6">
                    <img 
                        src={hotel.image_url || 'https://via.placeholder.com/200x200'} 
                        alt={hotel.name} 
                        className="w-full md:w-48 h-48 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold">{hotel.name}</h3>
                        <p className="text-gray-500">{hotel.location}</p>
                        <p className="mt-2 text-sm text-gray-700">{hotel.address}</p>
                        <div className="mt-4 pt-4 border-t border-dashed">
                            <p className="text-sm"><span className="font-semibold">Precio:</span> ${hotel.price || 'N/A'} MXN/noche</p>
                            <p className="text-sm"><span className="font-semibold">Email:</span> {hotel.email}</p>
                            <p className="text-sm"><span className="font-semibold">Propietario:</span> {hotel.owner?.first_name} {hotel.owner?.last_name} ({hotel.owner?.owner_email})</p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-3 justify-center flex-shrink-0">
                        <button 
                            onClick={() => onDecision(hotel.id, 'approve')} 
                            disabled={processing === hotel.id}
                            className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                        >
                            {processing === hotel.id ? 'Procesando...' : '✅ Aprobar'}
                        </button>
                        <button 
                            onClick={() => onDecision(hotel.id, 'reject')} 
                            disabled={processing === hotel.id}
                            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                        >
                            {processing === hotel.id ? 'Procesando...' : '❌ Rechazar'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// 🔥 NUEVO COMPONENTE PARA NEGOCIOS PENDIENTES
function PendingBusinessesTab({ businesses, onDecision, processing }) {
    if (!businesses || businesses.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">✅ No hay restaurantes pendientes</h3>
                <p className="text-gray-500">Todos los restaurantes han sido procesados</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">🍽️ Restaurantes Pendientes de Aprobación</h2>
            {businesses.map(business => (
                <div key={business.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                                <h3 className="text-xl font-semibold">{business.name}</h3>
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                                    {business.business_type}
                                </span>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-gray-600 mb-2">{business.description}</p>
                                    <p className="text-sm text-gray-500">
                                        📍 {business.location} • {business.address}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        📞 {business.phone} • ✉️ {business.email}
                                    </p>
                                    {business.website && (
                                        <p className="text-sm text-gray-500">
                                            🌐 <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {business.website}
                                            </a>
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <strong>Propietario:</strong> {business.owner_name || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <strong>Email:</strong> {business.owner_email}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>Registrado:</strong> {new Date(business.created_at).toLocaleDateString('es-MX')}
                                    </p>
                                </div>
                            </div>

                            {/* Mostrar datos específicos del negocio */}
                            {business.business_data && Object.keys(business.business_data).length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h4 className="font-semibold mb-2">Información del Restaurante:</h4>
                                    <div className="text-sm space-y-1">
                                        {business.business_data.specialty && (
                                            <p><strong>Especialidad:</strong> {business.business_data.specialty}</p>
                                        )}
                                        {business.business_data.cuisine_type && (
                                            <p><strong>Tipo de Cocina:</strong> {business.business_data.cuisine_type}</p>
                                        )}
                                        {business.business_data.capacity && (
                                            <p><strong>Capacidad:</strong> {business.business_data.capacity} personas</p>
                                        )}
                                        {business.business_data.price_range && (
                                            <p><strong>Rango de Precios:</strong> {business.business_data.price_range}</p>
                                        )}
                                        {business.business_data.delivery_available && (
                                            <p><strong>Delivery:</strong> {business.business_data.delivery_available ? 'Sí' : 'No'}</p>
                                        )}
                                        {business.business_data.reservation_required && (
                                            <p><strong>Reservas Requeridas:</strong> {business.business_data.reservation_required ? 'Sí' : 'No'}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-col space-y-3 ml-6">
                            <button
                                onClick={() => onDecision(business.id, 'approve')}
                                disabled={processing === business.id}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                            >
                                {processing === business.id ? 'Procesando...' : '✅ Aprobar'}
                            </button>
                            
                            <button
                                onClick={() => onDecision(business.id, 'reject')}
                                disabled={processing === business.id}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                            >
                                {processing === business.id ? 'Procesando...' : '❌ Rechazar'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// --- COMPONENTES DE UI REUTILIZABLES ---

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