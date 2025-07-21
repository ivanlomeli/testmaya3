// frontend/src/pages/CreateHotelPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function CreateHotelPage() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        address: '',
        price: '',
        image_url: '',
        phone: '',
        email: '',
        website: '',
        rooms_available: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setError('No estás autenticado. Por favor, inicia sesión de nuevo.');
                setIsSubmitting(false);
                return;
            }
            
            // Asegurarse de que los campos numéricos se envíen como números
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                rooms_available: parseInt(formData.rooms_available, 10) || 0,
            };

            const response = await fetch('/api/hotels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert('¡Hotel enviado para aprobación! Serás redirigido a tu portal.');
                navigate('/portal'); // Redirigir al portal después del éxito
            } else {
                setError(result.error || 'Ocurrió un error al registrar el hotel.');
            }

        } catch (err) {
            setError('Error de conexión con el servidor. Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="container mx-auto px-6 py-12 max-w-3xl">
            <div className="mb-6">
                <Link to="/portal" className="text-theme-primary hover:underline">&larr; Volver a mi Portal</Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold mb-6">Registrar un Nuevo Hotel</h1>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField label="Nombre del Hotel" name="name" value={formData.name} onChange={handleInputChange} required />
                    <TextAreaField label="Descripción" name="description" value={formData.description} onChange={handleInputChange} />
                    <InputField label="Ubicación (Ej: Tulum, Quintana Roo)" name="location" value={formData.location} onChange={handleInputChange} required />
                    <InputField label="Dirección Completa" name="address" value={formData.address} onChange={handleInputChange} required />
                    <InputField label="Precio por Noche (MXN)" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
                    <InputField label="URL de la Imagen Principal" name="image_url" value={formData.image_url} onChange={handleInputChange} />
                    <InputField label="Email de Contacto" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    <InputField label="Teléfono de Contacto" name="phone" value={formData.phone} onChange={handleInputChange} />
                    <InputField label="Sitio Web" name="website" value={formData.website} onChange={handleInputChange} />
                    <InputField label="Habitaciones Disponibles" name="rooms_available" type="number" value={formData.rooms_available} onChange={handleInputChange} />

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full font-bold py-3 rounded-lg disabled:bg-gray-400">
                        {isSubmitting ? 'Enviando...' : 'Enviar para Aprobación'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Componentes auxiliares para simplificar el formulario
const InputField = ({ label, name, ...rest }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input name={name} {...rest} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-theme-primary" />
    </div>
);

const TextAreaField = ({ label, name, ...rest }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea name={name} {...rest} rows="4" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-theme-primary" />
    </div>
);