// src/pages/MisReservasPage.js

import { useState, useEffect } from 'react';

export default function MisReservasPage() {
    const [reservas, setReservas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReservas();
    }, []);

    const fetchReservas = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setError('Debes iniciar sesión para ver tus reservas');
                setIsLoading(false);
                return;
            }

            const response = await fetch('http://127.0.0.1:8080/api/bookings/my-bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReservas(data.bookings || []);
            } else {
                setError('Error al cargar las reservas');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'confirmed': return 'Confirmada';
            case 'pending': return 'Pendiente';
            case 'cancelled': return 'Cancelada';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 py-16">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando tus reservas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-6 py-16">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Mis Reservas</h1>
                
                {reservas.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📅</div>
                        <h2 className="text-2xl font-bold mb-2">No tienes reservas aún</h2>
                        <p className="text-gray-600 mb-6">¡Explora nuestros hoteles y haz tu primera reserva!</p>
                        <a href="/" className="btn-primary inline-block px-6 py-3 rounded-full font-bold">
                            Explorar Hoteles
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reservas.map((reserva) => (
                            <div key={reserva.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold">{reserva.hotel_name}</h3>
                                            <p className="text-gray-600">{reserva.hotel_location}</p>
                                            <p className="text-sm text-gray-500">Referencia: {reserva.booking_reference}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reserva.status)}`}>
                                                {getStatusText(reserva.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold mb-2">Detalles de la Reserva</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Check-in:</span>
                                                    <span className="font-medium">{formatDate(reserva.check_in)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Check-out:</span>
                                                    <span className="font-medium">{formatDate(reserva.check_out)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Huéspedes:</span>
                                                    <span className="font-medium">{reserva.guests}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Habitaciones:</span>
                                                    <span className="font-medium">{reserva.rooms}</span>
                                                </div>
                                                {reserva.special_requests && (
                                                    <div className="pt-2 border-t">
                                                        <span className="font-medium">Solicitudes especiales:</span>
                                                        <p className="text-gray-600 mt-1">{reserva.special_requests}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2">Resumen de Pago</h4>
                                            <div className="space-y-2 text-sm">
                                                {reserva.addon_services && reserva.addon_services.length > 0 && (
                                                    <div>
                                                        <span className="font-medium">Extras incluidos:</span>
                                                        {reserva.addon_services.map((addon, index) => (
                                                            <div key={index} className="flex justify-between ml-2">
                                                                <span>• {addon.name}</span>
                                                                <span>+${addon.price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                                    <span>Total:</span>
                                                    <span className="text-blue-600">${reserva.total_price.toFixed(2)} MXN</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Estado del pago:</span>
                                                    <span className={`font-medium ${
                                                        reserva.payment_status === 'paid' ? 'text-green-600' : 
                                                        reserva.payment_status === 'pending' ? 'text-yellow-600' : 
                                                        'text-red-600'
                                                    }`}>
                                                        {reserva.payment_status === 'paid' ? 'Pagado' : 
                                                         reserva.payment_status === 'pending' ? 'Pendiente' : 
                                                         'Falló'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            Reserva creada el {new Date(reserva.created_at).toLocaleDateString('es-ES')}
                                        </div>
                                        <div className="space-x-2">
                                            {reserva.status === 'pending' && (
                                                <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                                                    Cancelar
                                                </button>
                                            )}
                                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                                                Ver Detalles
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}