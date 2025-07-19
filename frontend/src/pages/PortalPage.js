// frontend/src/pages/PortalPage.js - VERSIÓN CORREGIDA CON STATUS BADGE

import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Modal from '../components/Modal';

function PortalPage() {
    const [myHotels, setMyHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);

    // Estado para el modal de reservas
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [currentBookings, setCurrentBookings] = useState([]);
    const [selectedHotelName, setSelectedHotelName] = useState('');
    const [bookingsLoading, setBookingsLoading] = useState(false);

    const isAuthorized = useCallback(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user_data'));
            const token = localStorage.getItem('auth_token');
            if (token && user && (user.role === 'HotelOwner' || user.role === 'Admin')) {
                if (!userData) setUserData(user);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, [userData]);

    const fetchMyHotels = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://127.0.0.1:8080/api/hotels/my-hotels', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al cargar tus propiedades.');
            
            const data = await response.json();
            setMyHotels(data.hotels || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Función para ver las reservas de un hotel
    const handleViewBookings = async (hotelId, hotelName) => {
        setBookingsLoading(true);
        setIsBookingModalOpen(true);
        setSelectedHotelName(hotelName);
        setCurrentBookings([]);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://127.0.0.1:8080/api/portal/hotels/${hotelId}/bookings`, {
                 headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('No se pudieron cargar las reservas.');
            
            const data = await response.json();
            setCurrentBookings(data.bookings || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setBookingsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthorized()) {
            fetchMyHotels();
        }
    }, [isAuthorized, fetchMyHotels]);
    
    if (!isAuthorized()) return <Navigate to="/" replace />;
    
    if (loading) return <div className="p-8 text-center">Cargando tu portal...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <>
            <div className="container mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Portal de Negocios</h1>
                        <p className="text-gray-600">Bienvenido, {userData?.first_name}. Aquí puedes gestionar tus propiedades.</p>
                    </div>
                    <Link to="/portal/nuevo-hotel" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
                        + Registrar Nuevo Hotel
                    </Link>
                </div>

                {myHotels.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">No tienes hoteles registrados</h2>
                        <p className="text-gray-600 mb-6">Comienza registrando tu primera propiedad</p>
                        <Link to="/portal/nuevo-hotel" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
                            Registrar Hotel
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myHotels.map(hotel => (
                            <div key={hotel.id} className="bg-white rounded-xl shadow-lg overflow-hidden relative flex flex-col">
                                <StatusBadge status={hotel.status} />
                                <img 
                                    src={hotel.image_url || 'https://via.placeholder.com/400x300'} 
                                    alt={hotel.name} 
                                    className="w-full h-56 object-cover" 
                                />
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-2xl font-bold mb-2">{hotel.name}</h3>
                                    <p className="text-gray-600 mb-4 flex-grow">{hotel.location}</p>
                                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                        <button 
                                            onClick={() => handleViewBookings(hotel.id, hotel.name)} 
                                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-full transition"
                                        >
                                            Ver Reservas
                                        </button>
                                        <div className="space-x-2">
                                            <Link 
                                                to={`/portal/editar-hotel/${hotel.id}`}
                                                className="text-blue-600 hover:underline text-sm font-semibold"
                                            >
                                                Editar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)}>
                <BookingsModal
                    loading={bookingsLoading}
                    bookings={currentBookings}
                    hotelName={selectedHotelName}
                />
            </Modal>
        </>
    );
}

// ✅ COMPONENTE STATUS BADGE IMPLEMENTADO CORRECTAMENTE
const StatusBadge = ({ status }) => {
    const statusConfig = {
        pending: { 
            bg: 'bg-yellow-100', 
            text: 'text-yellow-800', 
            label: 'Pendiente' 
        },
        confirmed: { 
            bg: 'bg-green-100', 
            text: 'text-green-800', 
            label: 'Confirmado' 
        },
        cancelled: { 
            bg: 'bg-red-100', 
            text: 'text-red-800', 
            label: 'Cancelado' 
        },
        completed: { 
            bg: 'bg-blue-100', 
            text: 'text-blue-800', 
            label: 'Completado' 
        },
        approved: { 
            bg: 'bg-green-100', 
            text: 'text-green-800', 
            label: 'Aprobado' 
        },
        rejected: { 
            bg: 'bg-red-100', 
            text: 'text-red-800', 
            label: 'Rechazado' 
        }
    };

    const config = statusConfig[status] || { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        label: status || 'Sin estado' 
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
};

// ✅ MODAL DE RESERVAS CORREGIDO
const BookingsModal = ({ loading, bookings, hotelName }) => (
    <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Reservas para: {hotelName}</h2>
        
        {loading ? (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando reservas...</p>
            </div>
        ) : bookings.length === 0 ? (
            <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <p className="text-gray-600 text-lg">Este hotel aún no tiene reservas.</p>
                <p className="text-gray-500 text-sm mt-2">Las reservas aparecerán aquí cuando los clientes hagan reservaciones.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                        <strong>Total de reservas:</strong> {bookings.length}
                    </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cliente
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Check-in
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Check-out
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Huéspedes
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {booking.customer_name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.customer_email}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(booking.check_in).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(booking.check_out).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {booking.guests}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ${booking.total_price?.toFixed(2)} MXN
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </div>
);

export default PortalPage;