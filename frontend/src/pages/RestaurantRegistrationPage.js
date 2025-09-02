// frontend/src/pages/RestaurantRegistrationPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RestaurantRegistrationPage() {
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

    const [restaurantData, setRestaurantData] = useState({
        name: '',
        description: '',
        specialty: '',
        cuisine_type: '',
        location: '',
        address: '',
        image_url: '',
        phone: '',
        email: '',
        website: '',
        capacity: '',
        price_range: '$$',
        delivery_available: false,
        reservation_required: false,
        operating_hours: {
            monday: { open: '09:00', close: '22:00', closed: false },
            tuesday: { open: '09:00', close: '22:00', closed: false },
            wednesday: { open: '09:00', close: '22:00', closed: false },
            thursday: { open: '09:00', close: '22:00', closed: false },
            friday: { open: '09:00', close: '22:00', closed: false },
            saturday: { open: '09:00', close: '22:00', closed: false },
            sunday: { open: '09:00', close: '22:00', closed: false }
        },
        services: [],
        menu_highlights: [
            { name: '', description: '', price: '', image_url: '', category: '' }
        ]
    });

    // Manejo de cambios en datos del propietario
    const handleOwnerChange = (e) => {
        const { name, value } = e.target;
        setOwnerData(prev => ({ ...prev, [name]: value }));
    };

    // Manejo de cambios en datos del restaurante
    const handleRestaurantChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRestaurantData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Manejo de horarios
    const handleScheduleChange = (day, field, value) => {
        setRestaurantData(prev => ({
            ...prev,
            operating_hours: {
                ...prev.operating_hours,
                [day]: { ...prev.operating_hours[day], [field]: value }
            }
        }));
    };

    // Manejo de servicios
    const handleServiceToggle = (service) => {
        setRestaurantData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    // Manejo de platillos destacados
    const handleMenuHighlightChange = (index, field, value) => {
        setRestaurantData(prev => ({
            ...prev,
            menu_highlights: prev.menu_highlights.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    // Agregar nuevo platillo
    const addMenuHighlight = () => {
        setRestaurantData(prev => ({
            ...prev,
            menu_highlights: [
                ...prev.menu_highlights,
                { name: '', description: '', price: '', image_url: '', category: '' }
            ]
        }));
    };

    // Eliminar platillo
    const removeMenuHighlight = (index) => {
        if (restaurantData.menu_highlights.length > 1) {
            setRestaurantData(prev => ({
                ...prev,
                menu_highlights: prev.menu_highlights.filter((_, i) => i !== index)
            }));
        }
    };

    // Navegación entre pasos
    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
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
        if (!restaurantData.name || !restaurantData.specialty || !restaurantData.location || !restaurantData.address) {
            setError('Todos los campos marcados con * son obligatorios');
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
                    role: 'BusinessOwner'
                })
            });

            const userData = await userResponse.json();

            if (!userResponse.ok) {
                throw new Error(userData.error || 'Error al registrar usuario');
            }

            // Paso 2: Crear restaurante con el token obtenido
            const restaurantPayload = {
                business_type: 'restaurant',
                name: restaurantData.name,
                description: restaurantData.description,
                location: restaurantData.location,
                address: restaurantData.address,
                phone: restaurantData.phone,
                email: restaurantData.email,
                website: restaurantData.website,
                business_data: {
                    specialty: restaurantData.specialty,
                    cuisine_type: restaurantData.cuisine_type,
                    price_range: restaurantData.price_range,
                    capacity: parseInt(restaurantData.capacity) || null,
                    delivery_available: restaurantData.delivery_available,
                    reservation_required: restaurantData.reservation_required,
                    services: restaurantData.services,
                    menu_highlights: restaurantData.menu_highlights.filter(item => item.name.trim())
                },
                operating_hours: restaurantData.operating_hours,
                images: restaurantData.image_url ? [{ 
                    image_url: restaurantData.image_url, 
                    image_type: 'main', 
                    display_order: 0 
                }] : []
            };

            console.log('Enviando payload:', JSON.stringify(restaurantPayload, null, 2));

            const restaurantResponse = await fetch('/api/businesses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`
                },
                body: JSON.stringify(restaurantPayload)
            });

            const restaurantResult = await restaurantResponse.json();

            if (!restaurantResponse.ok) {
                throw new Error(restaurantResult.error || 'Error al registrar restaurante');
            }

            setSuccess('¡Registro exitoso! Tu restaurante ha sido enviado para aprobación.');
            
            // Redirigir después de 3 segundos
            setTimeout(() => {
                navigate('/portal');
            }, 3000);

        } catch (err) {
            console.error('Error en registro:', err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Componente para indicador de pasos
    const StepIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3, 4].map(step => (
                    <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            step <= currentStep ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                            {step}
                        </div>
                        {step < 4 && (
                            <div className={`w-20 h-1 mx-2 ${
                                step < currentStep ? 'bg-red-600' : 'bg-gray-300'
                            }`} />
                        )}
                    </div>
                ))}
            </div>
            <div className="text-center mt-4 text-sm text-gray-600">
                Paso {currentStep} de 4: {
                    currentStep === 1 ? 'Información del Propietario' :
                    currentStep === 2 ? 'Información del Restaurante' :
                    currentStep === 3 ? 'Horarios y Servicios' :
                    'Menú Destacado'
                }
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🍽️ Únete a Maya Digital
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">
                        Registra tu restaurante y conecta con amantes de la gastronomía
                    </p>
                    <p className="text-gray-500">
                        Proceso simple y rápido • Comisión competitiva • Soporte especializado
                    </p>
                </div>

                {/* Benefits Banner */}
                <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-6 rounded-xl mb-8">
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl mb-2">🍴</div>
                            <h3 className="font-bold">Más Comensales</h3>
                            <p className="text-sm">Foodlovers buscan tu cocina</p>
                        </div>
                        <div>
                            <div className="text-2xl mb-2">📱</div>
                            <h3 className="font-bold">Pedidos Online</h3>
                            <p className="text-sm">Sistema integrado de reservas</p>
                        </div>
                        <div>
                            <div className="text-2xl mb-2">📈</div>
                            <h3 className="font-bold">Herramientas Pro</h3>
                            <p className="text-sm">Analíticas y gestión avanzada</p>
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

                        {/* Paso 2: Información del Restaurante */}
                        {currentStep === 2 && (
                            <Step2RestaurantInfo 
                                data={restaurantData}
                                onChange={handleRestaurantChange}
                            />
                        )}

                        {/* Paso 3: Horarios y Servicios */}
                        {currentStep === 3 && (
                            <Step3ScheduleServices 
                                data={restaurantData}
                                onScheduleChange={handleScheduleChange}
                                onServiceToggle={handleServiceToggle}
                                onChange={handleRestaurantChange}
                            />
                        )}

                        {/* Paso 4: Menú Destacado */}
                        {currentStep === 4 && (
                            <Step4MenuHighlights 
                                data={restaurantData}
                                onMenuChange={handleMenuHighlightChange}
                                onAddMenu={addMenuHighlight}
                                onRemoveMenu={removeMenuHighlight}
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

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError('');
                                        if (currentStep === 1 && validateStep1()) {
                                            nextStep();
                                        } else if (currentStep === 2 && validateStep2()) {
                                            nextStep();
                                        } else if (currentStep === 3) {
                                            nextStep();
                                        }
                                    }}
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
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
                                        '🚀 Registrar Restaurante'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-600">
                    <p>¿Ya tienes una cuenta? 
                        <Link to="/" className="text-red-600 hover:underline ml-1">
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Repite tu contraseña"
                        required
                    />
                </div>
            </div>
        </div>
    );
}

// Componente Paso 2: Información del Restaurante
function Step2RestaurantInfo({ data, onChange }) {
    const cuisineTypes = [
        'Mexicana Tradicional', 'Yucateca', 'Oaxaqueña', 'Poblana', 'Veracruzana',
        'Mariscos', 'Antojitos', 'Cocina de Autor', 'Fusión', 'Vegetariana', 'Parrilla'
    ];

    const priceRanges = [
        { value: '$', label: '$ - Económico (menos de $200 por persona)' },
        { value: '$$', label: '$$ - Moderado ($200 - $500 por persona)' },
        { value: '$$$', label: '$$$ - Caro ($500 - $1000 por persona)' },
        { value: '$$$$', label: '$$$$ - Muy caro (más de $1000 por persona)' }
    ];

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Información del Restaurante</h2>
                <p className="text-gray-600">Cuéntanos sobre tu establecimiento</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Restaurante *
                </label>
                <input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={onChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="La Cocina de Abuela"
                    required
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Especialidad *
                    </label>
                    <input
                        type="text"
                        name="specialty"
                        value={data.specialty}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Cocina Yucateca Tradicional"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Cocina
                    </label>
                    <select
                        name="cuisine_type"
                        value={data.cuisine_type}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                        <option value="">Seleccionar tipo</option>
                        {cuisineTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Describe tu restaurante, ambiente, historia, qué lo hace especial..."
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Mérida, Yucatán"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidad (personas)
                    </label>
                    <input
                        type="number"
                        name="capacity"
                        value={data.capacity}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="50"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Calle 60 #123 x 45 y 47, Centro Histórico"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rango de Precios
                </label>
                <select
                    name="price_range"
                    value={data.price_range}
                    onChange={onChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                    {priceRanges.map(range => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono del Restaurante
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={data.phone}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="+52 999 123 4567"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email del Restaurante
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="reservas@turestaurante.com"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sitio Web
                    </label>
                    <input
                        type="url"
                        name="website"
                        value={data.website}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="https://www.turestaurante.com"
                    />
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="https://ejemplo.com/imagen-restaurante.jpg"
                    />
                </div>
            </div>
        </div>
    );
}

// Componente Paso 3: Horarios y Servicios
function Step3ScheduleServices({ data, onScheduleChange, onServiceToggle, onChange }) {
    const days = [
        { key: 'monday', label: 'Lunes' },
        { key: 'tuesday', label: 'Martes' },
        { key: 'wednesday', label: 'Miércoles' },
        { key: 'thursday', label: 'Jueves' },
        { key: 'friday', label: 'Viernes' },
        { key: 'saturday', label: 'Sábado' },
        { key: 'sunday', label: 'Domingo' }
    ];

    const availableServices = [
        'Desayunos', 'Comidas', 'Cenas', 'Servicio a domicilio', 
        'Para llevar', 'Reservaciones', 'Eventos privados', 
        'Música en vivo', 'Terraza', 'Estacionamiento', 
        'WiFi gratis', 'Aire acondicionado'
    ];

    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Horarios y Servicios</h2>
                <p className="text-gray-600">Define cuándo y cómo atiendes a tus clientes</p>
            </div>

            {/* Horarios de Operación */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Horarios de Operación</h3>
                <div className="space-y-3">
                    {days.map(day => (
                        <div key={day.key} className="grid grid-cols-4 gap-4 items-center">
                            <div className="font-medium text-gray-700">{day.label}</div>
                            <div>
                                <input
                                    type="time"
                                    value={data.operating_hours[day.key].open}
                                    onChange={(e) => onScheduleChange(day.key, 'open', e.target.value)}
                                    disabled={data.operating_hours[day.key].closed}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <input
                                    type="time"
                                    value={data.operating_hours[day.key].close}
                                    onChange={(e) => onScheduleChange(day.key, 'close', e.target.value)}
                                    disabled={data.operating_hours[day.key].closed}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.operating_hours[day.key].closed}
                                        onChange={(e) => onScheduleChange(day.key, 'closed', e.target.checked)}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Cerrado</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Servicios */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios Disponibles</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableServices.map(service => (
                        <label key={service} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.services.includes(service)}
                                onChange={() => onServiceToggle(service)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700">{service}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Opciones adicionales */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Opciones Adicionales</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            name="delivery_available"
                            checked={data.delivery_available}
                            onChange={onChange}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Servicio a Domicilio</span>
                            <p className="text-sm text-gray-600">Ofrecemos entrega a domicilio</p>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            name="reservation_required"
                            checked={data.reservation_required}
                            onChange={onChange}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Reserva Requerida</span>
                            <p className="text-sm text-gray-600">Los clientes deben reservar mesa</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}

// Componente Paso 4: Menú Destacado - VERSION MEJORADA
function Step4MenuHighlights({ data, onMenuChange, onAddMenu, onRemoveMenu }) {
    const dishCategories = [
        'Entradas', 'Sopas', 'Platos Fuertes', 'Mariscos', 'Carnes', 
        'Vegetarianos', 'Postres', 'Bebidas', 'Especialidades', 'Antojitos'
    ];

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Menú Destacado</h2>
                <p className="text-gray-600">Muestra tus mejores platillos para atraer clientes</p>
            </div>

            <div className="space-y-6">
                {data.menu_highlights.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">
                                Platillo {index + 1} {index === 0 && <span className="text-red-600">*</span>}
                            </h3>
                            {data.menu_highlights.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveMenu(index)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    ✕ Eliminar
                                </button>
                            )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Platillo {index === 0 && <span className="text-red-600">*</span>}
                                </label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => onMenuChange(index, 'name', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Cochinita Pibil"
                                    required={index === 0}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría
                                </label>
                                <select
                                    value={item.category}
                                    onChange={(e) => onMenuChange(index, 'category', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {dishCategories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio (MXN)
                                </label>
                                <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => onMenuChange(index, 'price', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="250"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL de Imagen del Platillo
                                </label>
                                <input
                                    type="url"
                                    value={item.image_url}
                                    onChange={(e) => onMenuChange(index, 'image_url', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="https://ejemplo.com/platillo.jpg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción
                            </label>
                            <textarea
                                value={item.description}
                                onChange={(e) => onMenuChange(index, 'description', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="Carne de cerdo marinada en achiote, cocida lentamente en horno de tierra..."
                                rows="3"
                            />
                        </div>

                        {/* Vista previa de imagen */}
                        {item.image_url && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                                <img
                                    src={item.image_url}
                                    alt={item.name || 'Platillo'}
                                    className="w-32 h-24 object-cover rounded-lg border"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Botón para agregar más platillos */}
            <div className="text-center">
                <button
                    type="button"
                    onClick={onAddMenu}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                    ➕ Agregar Otro Platillo
                </button>
                <p className="text-sm text-gray-500 mt-2">
                    Puedes agregar tantos platillos como desees
                </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                    <div className="text-blue-600 text-xl">💡</div>
                    <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Consejos para destacar</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Incluye fotos atractivas de alta calidad de cada platillo</li>
                            <li>• Describe los ingredientes especiales o la preparación única</li>
                            <li>• Menciona si es un platillo tradicional de la región</li>
                            <li>• Organiza por categorías para facilitar la navegación</li>
                            <li>• Puedes actualizar tu menú completo después del registro</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}