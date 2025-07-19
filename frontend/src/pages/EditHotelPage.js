// frontend/src/pages/EditHotelPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';

function EditHotelPage() {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    console.log('Hotel ID desde URL:', hotelId); // Para debug
    
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        address: '',
        description: '',
        price: '',
        image_url: '',
        amenities: [],
        rooms_available: ''
    });

    // Verificar autorización
    const isAuthorized = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user_data'));
            const token = localStorage.getItem('auth_token');
            return token && user && (user.role === 'HotelOwner' || user.role === 'Admin');
        } catch {
            return false;
        }
    };

    // Cargar datos del hotel
    useEffect(() => {
        if (!isAuthorized()) return;
        if (!hotelId) {
            setError('ID de hotel no válido');
            setLoading(false);
            return;
        }

        const fetchHotelData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const url = `http://127.0.0.1:8080/api/hotels/${hotelId}`;
                console.log('Fetching hotel data from:', url);
                
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('No se pudo cargar la información del hotel');

                const data = await response.json();
                console.log('Datos del hotel recibidos:', data); // Para debug
                
                // La respuesta puede venir directamente o dentro de un objeto hotel
                const hotelData = data.hotel || data;
                
                setFormData({
                    name: hotelData.name || '',
                    location: hotelData.location || '',
                    address: hotelData.address || '',
                    description: hotelData.description || '',
                    price: hotelData.price || '',
                    image_url: hotelData.image_url || '',
                    amenities: hotelData.amenities || [],
                    rooms_available: hotelData.rooms_available || ''
                });
            } catch (err) {
                console.error('Error al cargar hotel:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHotelData();
    }, [hotelId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAmenitiesChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            amenities: value.split(',').map(item => item.trim()).filter(item => item)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://127.0.0.1:8080/api/hotels/${hotelId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    rooms_available: parseInt(formData.rooms_available)
                })
            });

            if (!response.ok) throw new Error('Error al actualizar el hotel');

            setSuccess('Hotel actualizado exitosamente');
            setTimeout(() => navigate('/portal'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthorized()) return <Navigate to="/" replace />;
    if (loading) return <div className="p-8 text-center">Cargando información del hotel...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-6">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Editar Hotel</h1>
                        <p className="text-gray-600 mt-2">Actualiza la información de tu propiedad</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-green-800">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Hotel *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ubicación *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dirección *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio por noche (MXN) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Habitaciones disponibles *
                                </label>
                                <input
                                    type="number"
                                    name="rooms_available"
                                    value={formData.rooms_available}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                URL de la imagen
                            </label>
                            <input
                                type="url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amenidades (separadas por comas)
                            </label>
                            <input
                                type="text"
                                value={formData.amenities.join(', ')}
                                onChange={handleAmenitiesChange}
                                placeholder="WiFi, Piscina, Gym, Spa..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition"
                            >
                                {submitting ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => navigate('/portal')}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditHotelPage;