// frontend/src/pages/HotelRegistrationPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function HotelRegistrationPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Estados para el formulario
    const [ownerData, setOwnerData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });

    const [hotelData, setHotelData] = useState({
        name: '',
        description: '',
        location: '',
        address: '',
        price: '',
        image_url: '',
        phone: '',
        email: '',
        website: '',
        rooms_available: '',
        amenities: [],
        policies: {
            check_in: '15:00',
            check_out: '11:00',
            cancellation_policy: '',
            pet_policy: '',
            smoking_policy: 'no_smoking'
        }
    });

    // Manejo de cambios en datos del propietario
    const handleOwnerChange = (e) => {
        const { name, value } = e.target;
        setOwnerData(prev => ({ ...prev, [name]: value }));
    };

    // Manejo de cambios en datos del hotel
    const handleHotelChange = (e) => {
        const { name, value } = e.target;
        setHotelData(prev => ({ ...prev, [name]: value }));
    };

    // Manejo de políticas
    const handlePolicyChange = (policy, value) => {
        setHotelData(prev => ({
            ...prev,
            policies: { ...prev.policies, [policy]: value }
        }));
    };

    // Manejo de amenidades
    const handleAmenityToggle = (amenity) => {
        setHotelData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    // Navegación entre pasos
    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // Validación del paso 1
    const validateStep1 = () => {
        if (!ownerData.first_name || !ownerData.last_name || !ownerData.email || !ownerData.password) {
            setError('Todos los campos marcados con * son obligatorios');
            return false;
        }
        if (ownerData.password !== ownerData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }
        if (ownerData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return false;
        }
        return true;
    };

    // Validación del paso 2
    const validateStep2 = () => {
        if (!hotelData.name || !hotelData.location || !hotelData.address || !hotelData.price) {
            setError('Todos los campos marcados con * son obligatorios');
            return false;
        }
        if (parseFloat(hotelData.price) <= 0) {
            setError('El precio debe ser mayor a 0');
            return false;
        }
        return true;
    };

    // Envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Paso 1: Registrar usuario
            const userResponse = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...ownerData,
                    role: 'HotelOwner'
                })
            });

            const userData = await userResponse.json();

            if (!userResponse.ok) {
                throw new Error(userData.error || 'Error al registrar usuario');
            }

            // Paso 2: Crear hotel con el token obtenido
            const hotelResponse = await fetch('/api/hotels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`
                },
                body: JSON.stringify({
                    ...hotelData,
                    price: parseFloat(hotelData.price),
                    rooms_available: parseInt(hotelData.rooms_available) || 1,
                    business_data: {
                        amenities: hotelData.amenities,
                        policies: hotelData.policies
                    }
                })
            });

            const hotelResult = await hotelResponse.json();

            if (!hotelResponse.ok) {
                throw new Error(hotelResult.error || 'Error al registrar hotel');
            }

            setSuccess('¡Registro exitoso! Tu hotel ha sido enviado para aprobación.');
            
            // Redirigir después de 3 segundos
            setTimeout(() => {
                navigate('/portal');
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Componente para indicador de pasos
    const StepIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                            {step}
                        </div>
                        {step < 3 && (
                            <div className={`w-20 h-1 mx-2 ${
                                step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                            }`} />
                        )}
                    </div>
                ))}
            </div>
            <div className="text-center mt-4 text-sm text-gray-600">
                Paso {currentStep} de 3: {
                    currentStep === 1 ? 'Información del Propietario' :
                    currentStep === 2 ? 'Información del Hotel' :
                    'Detalles y Políticas'
                }
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🏨 Únete a Maya Digital
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">
                        Registra tu hotel y llega a miles de viajeros
                    </p>
                    <p className="text-gray-500">
                        Proceso simple y rápido • Comisión competitiva • Soporte 24/7
                    </p>
                </div>

                {/* Benefits Banner */}
                <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-xl mb-8">
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl mb-2">🌍</div>
                            <h3 className="font-bold">Alcance Global</h3>
                            <p className="text-sm">Miles de viajeros buscan tu hotel</p>
                        </div>
                        <div>
                            <div className="text-2xl mb-2">💰</div>
                            <h3 className="font-bold">Sin Costo Inicial</h3>
                            <p className="text-sm">Solo pagas cuando recibes reservas</p>
                        </div>
                        <div>
                            <div className="text-2xl mb-2">📈</div>
                            <h3 className="font-bold">Herramientas de Gestión</h3>
                            <p className="text-sm">Panel completo para administrar</p>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    
                    <StepIndicator />

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        
                        {/* Paso 1: Información del Propietario */}
                        {currentStep === 1 && (
                            <Step1OwnerInfo 
                                data={ownerData}
                                onChange={handleOwnerChange}
                            />
                        )}

                        {/* Paso 2: Información del Hotel */}
                        {currentStep === 2 && (
                            <Step2HotelInfo 
                                data={hotelData}
                                onChange={handleHotelChange}
                            />
                        )}

                        {/* Paso 3: Detalles y Políticas */}
                        {currentStep === 3 && (
                            <Step3Policies 
                                data={hotelData}
                                onPolicyChange={handlePolicyChange}
                                onAmenityToggle={handleAmenityToggle}
                            />
                        )}

                        {/* Navegación */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="bg-gray-500 text-white px-6 py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                            >
                                ← Anterior
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError('');
                                        if (currentStep === 1 && validateStep1()) {
                                            nextStep();
                                        } else if (currentStep === 2 && validateStep2()) {
                                            nextStep();
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Siguiente →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-green-600 text-white px-8 py-3 rounded-lg disabled:bg-green-300 disabled:cursor-not-allowed hover:bg-green-700 transition"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                            Registrando...
                                        </>
                                    ) : (
                                        '🚀 Registrar Hotel'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-600">
                    <p>¿Ya tienes una cuenta? 
                        <Link to="/" className="text-blue-600 hover:underline ml-1">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

// Componente Paso 1: Información del Propietario
function Step1OwnerInfo({ data, onChange }) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Información del Propietario</h2>
                <p className="text-gray-600">Comencemos con tus datos personales</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                    </label>
                    <input
                        type="text"
                        name="first_name"
                        value={data.first_name}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tu nombre"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido *
                    </label>
                    <input
                        type="text"
                        name="last_name"
                        value={data.last_name}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tu apellido"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                </label>
                <input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={onChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Este será tu email de acceso a la plataforma
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                </label>
                <input
                    type="tel"
                    name="phone"
                    value={data.phone}
                    onChange={onChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+52 999 123 4567"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña *
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mínimo 8 caracteres"
                        required
                        minLength="8"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Contraseña *
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={data.confirmPassword}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Repite tu contraseña"
                        required
                    />
                </div>
            </div>
        </div>
    );
}

// Componente Paso 2: Información del Hotel
function Step2HotelInfo({ data, onChange }) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Información del Hotel</h2>
                <p className="text-gray-600">Cuéntanos sobre tu propiedad</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Hotel *
                </label>
                <input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={onChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hotel Paradise Maya"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                </label>
                <textarea
                    name="description"
                    value={data.description}
                    onChange={onChange}
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe tu hotel, qué lo hace especial, sus características principales..."
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación *
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={data.location}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tulum, Quintana Roo"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Habitaciones Disponibles
                    </label>
                    <input
                        type="number"
                        name="rooms_available"
                        value={data.rooms_available}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12"
                        min="1"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección Completa *
                </label>
                <input
                    type="text"
                    name="address"
                    value={data.address}
                    onChange={onChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Carretera Tulum-Bocapaila Km 8.5, Zona Hotelera"
                    required
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio por Noche (MXN) *
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={data.price}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="3500"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono del Hotel
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={data.phone}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+52 984 123 4567"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email del Hotel
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="reservas@tuhotel.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sitio Web
                    </label>
                    <input
                        type="url"
                        name="website"
                        value={data.website}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.tuhotel.com"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Imagen Principal
                </label>
                <input
                    type="url"
                    name="image_url"
                    value={data.image_url}
                    onChange={onChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/imagen-hotel.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Puedes usar imágenes de Unsplash, Pixabay u otros servicios gratuitos
                </p>
            </div>
        </div>
    );
}

// Componente Paso 3: Políticas y Amenidades
function Step3Policies({ data, onPolicyChange, onAmenityToggle }) {
    const commonAmenities = [
        'WiFi gratuito', 'Piscina', 'Gym', 'Spa', 'Restaurante', 'Bar',
        'Estacionamiento', 'Aire acondicionado', 'TV', 'Room service',
        'Lavandería', 'Recepción 24h', 'Desayuno incluido', 'Mascotas permitidas'
    ];

    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalles y Políticas</h2>
                <p className="text-gray-600">Últimos detalles para completar tu perfil</p>
            </div>

            {/* Horarios */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Horarios</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Check-in
                        </label>
                        <input
                            type="time"
                            value={data.policies.check_in}
                            onChange={(e) => onPolicyChange('check_in', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Check-out
                        </label>
                        <input
                            type="time"
                            value={data.policies.check_out}
                            onChange={(e) => onPolicyChange('check_out', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Amenidades */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenidades</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {commonAmenities.map(amenity => (
                        <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.amenities.includes(amenity)}
                                onChange={() => onAmenityToggle(amenity)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Políticas */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Políticas</h3>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Política de Cancelación
                    </label>
                    <select
                        value={data.policies.cancellation_policy}
                        onChange={(e) => onPolicyChange('cancellation_policy', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccionar política</option>
                        <option value="flexible">Flexible - Cancelación gratuita hasta 24h antes</option>
                        <option value="moderate">Moderada - Cancelación gratuita hasta 48h antes</option>
                        <option value="strict">Estricta - Cancelación gratuita hasta 7 días antes</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Política de Mascotas
                    </label>
                    <select
                        value={data.policies.pet_policy}
                        onChange={(e) => onPolicyChange('pet_policy', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccionar política</option>
                        <option value="allowed">Mascotas permitidas</option>
                        <option value="allowed_fee">Mascotas permitidas (con costo adicional)</option>
                        <option value="not_allowed">No se permiten mascotas</option>
                    </select>
                </div>
            </div>
        </div>
    );
}