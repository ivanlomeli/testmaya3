// pages/PortalPage.js - VERSIÓN CORREGIDA (HOOKS ANTES DE RETURNS)

import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';

function PortalPage({ userData, isLoggedIn }) {
    // 🔥 TODOS LOS HOOKS DEBEN IR AL INICIO ANTES DE CUALQUIER RETURN
    const [hotels, setHotels] = useState([]);
    const [businesses, setBusinesses] = useState([]); // 🔥 NUEVO: Para restaurantes
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState(null);

    // 🔥 FUNCIÓN PARA CARGAR HOTELES
    const fetchHotels = async () => {
        if (!userData || (userData.role !== 'HotelOwner' && userData.role !== 'Admin')) return;
        
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:8080/api/hotels/my-hotels', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setHotels(data);
                console.log('✅ Hoteles cargados:', data);
            } else {
                console.error('Error cargando hoteles:', response.status);
            }
        } catch (error) {
            console.error('Error cargando hoteles:', error);
            setError('Error al cargar hoteles');
        }
    };

    // 🔥 FUNCIÓN PARA CARGAR NEGOCIOS/RESTAURANTES
    const fetchBusinesses = async () => {
        if (!userData || (userData.role !== 'BusinessOwner' && userData.role !== 'Admin')) return;
        
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:8080/api/businesses/my-businesses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBusinesses(data);
                console.log('✅ Negocios cargados:', data);
            } else {
                console.error('Error cargando negocios:', response.status);
            }
        } catch (error) {
            console.error('Error cargando negocios:', error);
            setError('Error al cargar negocios');
        }
    };

    // 🔥 FUNCIÓN PARA CARGAR RESERVAS
    const fetchBookings = async () => {
        if (!userData) return;
        
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:8080/api/bookings/my-bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data);
                console.log('✅ Reservas cargadas:', data);
            }
        } catch (error) {
            console.error('Error cargando reservas:', error);
        }
    };

    // 🔥 HOOK useEffect DEBE IR DESPUÉS DE LAS FUNCIONES PERO ANTES DE LOS RETURNS
    useEffect(() => {
        // Solo ejecutar si tenemos userData válido
        if (!userData) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            
            await Promise.all([
                fetchHotels(),
                fetchBusinesses(), // 🔥 NUEVO
                fetchBookings()
            ]);
            
            setLoading(false);
        };

        loadData();
    }, [userData]); // Dependencia correcta

    // 🔥 AHORA SÍ PODEMOS USAR RETURNS CONDICIONALES (DESPUÉS DE TODOS LOS HOOKS)
    // Verificar autenticación
    if (!isLoggedIn || !userData) {
        return <Navigate to="/" replace />;
    }

    // Verificar que sea hotel owner o business owner
    const isHotelOwner = userData.role === 'HotelOwner';
    const isBusinessOwner = userData.role === 'BusinessOwner';
    const canAccessPortal = isHotelOwner || isBusinessOwner || userData.role === 'Admin';

    if (!canAccessPortal) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="bg-white p-8 rounded-lg shadow">
                    <div className="text-xl">Cargando portal...</div>
                </div>
            </div>
        );
    }

    // 🔥 DETERMINAR QUE TABS MOSTRAR SEGÚN EL ROL
    const getAvailableTabs = () => {
        const tabs = [{ id: 'overview', name: 'Resumen', icon: '📊' }];
        
        if (isHotelOwner || userData.role === 'Admin') {
            tabs.push({ id: 'hotels', name: 'Mis Hoteles', icon: '🏨' });
        }
        
        if (isBusinessOwner || userData.role === 'Admin') {
            tabs.push({ id: 'businesses', name: 'Mis Restaurantes', icon: '🍽️' });
        }
        
        tabs.push({ id: 'bookings', name: 'Reservas', icon: '📅' });
        
        return tabs;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                Portal de {isHotelOwner ? 'Hoteles' : 'Restaurantes'}
                            </h1>
                            <p className="text-gray-600">
                                Bienvenido, {userData.first_name} {userData.last_name}
                            </p>
                        </div>
                        
                        {/* Botón para agregar nuevo */}
                        <div className="flex space-x-4">
                            {isHotelOwner && (
                                <Link
                                    to="/portal/nuevo-hotel"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    + Nuevo Hotel
                                </Link>
                            )}
                            {isBusinessOwner && (
                                <Link
                                    to="/registro-restaurante"
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    + Nuevo Restaurante
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-8 border-b">
                        {getAvailableTabs().map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.icon} {tab.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {activeTab === 'overview' && (
                    <OverviewTab 
                        hotels={hotels} 
                        businesses={businesses} 
                        bookings={bookings} 
                        userRole={userData.role}
                    />
                )}
                {activeTab === 'hotels' && <HotelsTab hotels={hotels} />}
                {activeTab === 'businesses' && <BusinessesTab businesses={businesses} />}
                {activeTab === 'bookings' && <BookingsTab bookings={bookings} />}
            </div>
        </div>
    );
}

// 🔥 COMPONENTE OVERVIEW ACTUALIZADO
function OverviewTab({ hotels, businesses, bookings, userRole }) {
    const totalHotels = hotels.length;
    const totalBusinesses = businesses.length;
    const totalBookings = bookings.length;
    const pendingHotels = hotels.filter(h => h.status === 'pending').length;
    const pendingBusinesses = businesses.filter(b => b.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(userRole === 'HotelOwner' || userRole === 'Admin') && (
                    <>
                        <MetricCard title="Total Hoteles" value={totalHotels} color="blue" />
                        <MetricCard title="Hoteles Pendientes" value={pendingHotels} color="yellow" />
                    </>
                )}
                
                {(userRole === 'BusinessOwner' || userRole === 'Admin') && (
                    <>
                        <MetricCard title="Total Restaurantes" value={totalBusinesses} color="red" />
                        <MetricCard title="Restaurantes Pendientes" value={pendingBusinesses} color="orange" />
                    </>
                )}
                
                <MetricCard title="Total Reservas" value={totalBookings} color="green" />
            </div>

            {/* Estado de aprobación */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Estado de Aprobación</h3>
                
                {userRole === 'HotelOwner' && hotels.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No tienes hoteles registrados</p>
                        <Link
                            to="/portal/nuevo-hotel"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Registrar Primer Hotel
                        </Link>
                    </div>
                )}

                {userRole === 'BusinessOwner' && businesses.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No tienes restaurantes registrados</p>
                        <Link
                            to="/registro-restaurante"
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                        >
                            Registrar Primer Restaurante
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

// 🔥 NUEVO COMPONENTE PARA PESTAÑA DE RESTAURANTES
function BusinessesTab({ businesses }) {
    if (businesses.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">No tienes restaurantes registrados</h3>
                <p className="text-gray-600 mb-6">Registra tu primer restaurante para comenzar</p>
                <Link
                    to="/registro-restaurante"
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                    + Registrar Restaurante
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mis Restaurantes</h2>
                <Link
                    to="/registro-restaurante"
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                    + Nuevo Restaurante
                </Link>
            </div>

            <div className="grid gap-6">
                {businesses.map((business) => (
                    <div key={business.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold mb-2">{business.name}</h3>
                                <p className="text-gray-600 mb-2">{business.description}</p>
                                <p className="text-sm text-gray-500">
                                    📍 {business.location} • {business.address}
                                </p>
                                <p className="text-sm text-gray-500">
                                    📞 {business.phone} • ✉️ {business.email}
                                </p>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                                <StatusBadge status={business.status} />
                                <div className="flex space-x-2">
                                    <Link
                                        to={`/businesses/${business.id}/edit`}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        Editar
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        {business.status === 'pending' && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                                <p className="text-yellow-800 text-sm">
                                    ⏳ Tu restaurante está pendiente de aprobación por el administrador
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Componentes existentes
function HotelsTab({ hotels }) {
    if (hotels.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">No tienes hoteles registrados</h3>
                <p className="text-gray-600 mb-6">Registra tu primer hotel para comenzar</p>
                <Link
                    to="/portal/nuevo-hotel"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Registrar Hotel
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mis Hoteles</h2>
                <Link
                    to="/portal/nuevo-hotel"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Nuevo Hotel
                </Link>
            </div>

            <div className="grid gap-6">
                {hotels.map((hotel) => (
                    <div key={hotel.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                                <p className="text-gray-600 mb-2">{hotel.description}</p>
                                <p className="text-sm text-gray-500">
                                    📍 {hotel.location} • {hotel.address}
                                </p>
                                <p className="text-lg font-bold text-green-600 mt-2">
                                    ${hotel.price} MXN/noche
                                </p>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                                <StatusBadge status={hotel.status} />
                                <div className="flex space-x-2">
                                    <Link
                                        to={`/portal/editar-hotel/${hotel.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        Editar
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        {hotel.status === 'pending' && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                                <p className="text-yellow-800 text-sm">
                                    ⏳ Tu hotel está pendiente de aprobación por el administrador
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function BookingsTab({ bookings }) {
    if (bookings.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">No tienes reservas</h3>
                <p className="text-gray-600">Las reservas de tus clientes aparecerán aquí</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Reservas de mis Servicios</h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Servicio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Monto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {booking.customer_name || booking.customer_email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {booking.service_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(booking.booking_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${booking.total_amount} MXN
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Componente para métricas
function MetricCard({ title, value, color = "blue" }) {
    const colorClasses = {
        blue: "border-blue-500 text-blue-600",
        green: "border-green-500 text-green-600",
        red: "border-red-500 text-red-600",
        yellow: "border-yellow-500 text-yellow-600",
        orange: "border-orange-500 text-orange-600"
    };

    return (
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[color]}`}>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {title}
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
                {value}
            </p>
        </div>
    );
}

// Componente para badges de estado
function StatusBadge({ status }) {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'approved':
                return { text: 'Aprobado', className: 'bg-green-100 text-green-800' };
            case 'pending':
                return { text: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' };
            case 'rejected':
                return { text: 'Rechazado', className: 'bg-red-100 text-red-800' };
            case 'confirmed':
                return { text: 'Confirmada', className: 'bg-green-100 text-green-800' };
            case 'cancelled':
                return { text: 'Cancelada', className: 'bg-red-100 text-red-800' };
            default:
                return { text: status, className: 'bg-gray-100 text-gray-800' };
        }
    };

    const config = getStatusConfig(status);
    
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
            {config.text}
        </span>
    );
}

export default PortalPage;