// src/components/HotelBookingForm.js

import { useState, useEffect } from 'react';

const hotelAddonsData = [
    { name: 'Tour Romántico', price: 1500, icon: '💖' },
    { name: 'Paquete Luna de Miel', price: 3500, icon: '🥂' },
    { name: 'Acceso a Spa', price: 800, icon: '💆‍♀️' }
];

export default function HotelBookingForm({ hotel, onConfirm }) {
    const [checkinDate, setCheckinDate] = useState('');
    const [checkoutDate, setCheckoutDate] = useState('');
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [specialRequests, setSpecialRequests] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- ESTADO PARA EL DESGLOSE ---
    const [itinerary, setItinerary] = useState([]);
    const [total, setTotal] = useState(0);

    // Calcular itinerario y total
    useEffect(() => {
        const newItinerary = [];
        let newTotal = 0;

        // Calcular noches y precio base
        if (checkinDate && checkoutDate) {
            const date1 = new Date(checkinDate);
            const date2 = new Date(checkoutDate);
            if (date2 > date1) {
                const timeDiff = date2.getTime() - date1.getTime();
                const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                for (let i = 0; i < nights; i++) {
                    newItinerary.push({ 
                        description: `Noche ${i + 1} (${rooms} habitación${rooms > 1 ? 'es' : ''})`, 
                        price: hotel.price * rooms 
                    });
                    newTotal += hotel.price * rooms;
                }
            }
        }

        // Agregar extras
        selectedAddons.forEach(addon => {
            newItinerary.push({ description: addon.name, price: addon.price });
            newTotal += addon.price;
        });
        
        setItinerary(newItinerary);
        setTotal(newTotal);
    }, [checkinDate, checkoutDate, rooms, selectedAddons, hotel.price]);

    const handleAddonToggle = (addon) => {
        setSelectedAddons(prevAddons => 
            prevAddons.find(a => a.name === addon.name)
                ? prevAddons.filter(a => a.name !== addon.name)
                : [...prevAddons, addon]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validaciones básicas
        if (!checkinDate || !checkoutDate) {
            alert('Por favor selecciona las fechas de entrada y salida');
            setIsSubmitting(false);
            return;
        }

        if (new Date(checkoutDate) <= new Date(checkinDate)) {
            alert('La fecha de salida debe ser posterior a la fecha de entrada');
            setIsSubmitting(false);
            return;
        }

        // Preparar datos para el backend
        const bookingData = {
            hotel_id: hotel.id,
            check_in: checkinDate,
            check_out: checkoutDate,
            guests: parseInt(guests),
            rooms: parseInt(rooms),
            special_requests: specialRequests.trim() || null,
            addon_services: selectedAddons.length > 0 ? selectedAddons : null
        };

        try {
            // Verificar si hay token (usuario autenticado)
            const token = localStorage.getItem('auth_token');
            if (!token) {
                alert('Debes iniciar sesión para hacer una reserva');
                setIsSubmitting(false);
                return;
            }

            console.log('Enviando reserva:', bookingData);

            const response = await fetch('http://127.0.0.1:8080/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();
            console.log('Respuesta del servidor:', result);

            if (response.ok) {
                // Reserva exitosa
                alert(`¡Reserva confirmada! 🎉

Hotel: ${result.booking.hotel_name}
Referencia: ${result.booking.reference}
Check-in: ${result.booking.check_in}
Check-out: ${result.booking.check_out}
Total: $${result.booking.total_price.toFixed(2)} MXN

Estado: ${result.booking.status}

¡Te enviaremos un email con los detalles!`);
                
                // Cerrar modal y actualizar la aplicación
                onConfirm('hotel', result.booking);
            } else {
                // Error del servidor
                console.error('Error del servidor:', result);
                alert(`Error al crear la reserva: ${result.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('Error de conexión con el servidor. Por favor intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">Reservar en {hotel.name}</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Columna Izquierda: Opciones */}
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 font-semibold">Entrada</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border rounded-lg mt-1" 
                                    value={checkinDate} 
                                    onChange={(e) => setCheckinDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold">Salida</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border rounded-lg mt-1" 
                                    value={checkoutDate} 
                                    onChange={(e) => setCheckoutDate(e.target.value)}
                                    min={checkinDate || new Date().toISOString().split('T')[0]}
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 font-semibold">Huéspedes</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded-lg mt-1" 
                                    value={guests} 
                                    onChange={(e) => setGuests(e.target.value)}
                                    min="1"
                                    max="10"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold">Habitaciones</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded-lg mt-1" 
                                    value={rooms} 
                                    onChange={(e) => setRooms(e.target.value)}
                                    min="1"
                                    max="5"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold">Solicitudes Especiales</label>
                            <textarea 
                                className="w-full p-2 border rounded-lg mt-1" 
                                value={specialRequests} 
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                placeholder="Cama extra, vista al mar, etc."
                                rows="3"
                            />
                        </div>
                        
                        <hr className="my-4" />
                        
                        <div>
                            <h4 className="font-bold text-lg mb-2">Mejora tu Estancia</h4>
                            <div className="space-y-3">
                                {hotelAddonsData.map(addon => (
                                    <div key={addon.name} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100">
                                        <div>
                                            <span className="font-bold">{addon.icon} {addon.name}</span>
                                            <span className="text-sm text-gray-500"> +${addon.price}</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleAddonToggle(addon)} 
                                            className={`${selectedAddons.find(a => a.name === addon.name) 
                                                ? 'bg-red-500 hover:bg-red-600' 
                                                : 'btn-primary'
                                            } text-white text-xs font-bold py-1 px-3 rounded-full transition-colors`}
                                        >
                                            {selectedAddons.find(a => a.name === addon.name) ? 'Quitar' : 'Añadir'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Columna Derecha: Resumen */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                         <h4 className="font-bold text-lg mb-2">Resumen de tu Estancia</h4>
                         
                         <div className="space-y-2 text-sm border-b pb-2 mb-2">
                            {itinerary.length > 0 ? (
                                itinerary.map((item, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span>{item.description}</span>
                                        <span>${item.price.toFixed(2)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">Selecciona tus fechas y extras.</p>
                            )}
                         </div>

                         <div className="font-bold text-xl text-right">
                             Total: ${total.toFixed(2)} MXN
                         </div>
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={isSubmitting || total === 0}
                    className={`w-full font-bold py-3 px-4 rounded-full mt-6 transition-colors ${
                        isSubmitting || total === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'btn-primary hover:bg-blue-600'
                    }`}
                >
                    {isSubmitting ? 'Procesando reserva...' : 'Confirmar Reserva'}
                </button>
            </form>
        </div>
    );
}