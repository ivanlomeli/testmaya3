// src/pages/HotelesPage.js - VERSIÓN OPTIMIZADA SIN DUPLICADOS

import { useState, useEffect, useRef } from 'react';
import heroImage from '../assets/hero-background.jpg';
import PredictiveSearch from '../components/PredictiveSearch';
import HotelOwnerBanner from '../components/HotelOwnerBanner';

export default function HotelesPage({ onReserveClick }) {
    const [hoteles, setHoteles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Referencia para evitar múltiples llamadas
    const hasFetched = useRef(false);

    useEffect(() => {
        // Prevenir ejecuciones múltiples con un flag global
        if (hasFetched.current) {
            console.log('🛑 Fetch ya ejecutado, saltando...');
            return;
        }
        
        const fetchHoteles = async () => {
            
            // Crear AbortController para cancelar peticiones
            const controller = new AbortController();
            
            try {
                hasFetched.current = true;
                setIsLoading(true);
                setError(null);
                
                console.log('🚀 Intentando cargar hoteles desde /api/hoteles...');
                
                const response = await fetch('/api/hoteles', {
                    signal: controller.signal
                });
                
                console.log('📡 Respuesta recibida:', {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok,
                    url: response.url
                });
                
                if (!response.ok) {
                    throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                console.log('📋 Content-Type:', contentType);
                
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('❌ Respuesta no es JSON. Primeros 500 caracteres:', text.substring(0, 500));
                    throw new Error('El servidor no devolvió JSON válido. Verifica que el backend esté corriendo en el puerto 8080.');
                }
                
                const data = await response.json();
                console.log('✅ Hoteles cargados exitosamente:', data);
                
                if (Array.isArray(data)) {
                    setHoteles(data);
                } else {
                    console.warn('⚠️ Los datos recibidos no son un array:', data);
                    setHoteles([]);
                }
                
            } catch (error) {
                // No mostrar error si fue cancelado
                if (error.name === 'AbortError') {
                    console.log('🚫 Petición cancelada');
                    return;
                }
                
                console.error("❌ Error completo:", error);
                setError(error.message);
                hasFetched.current = false; // Permitir reintentar en caso de error
            } finally {
                setIsLoading(false);
            }
            
            // Cleanup function para cancelar la petición si el componente se desmonta
            return () => {
                controller.abort();
            };
        };

        fetchHoteles();
        
        // Cleanup del useEffect
        return () => {
            // Reset solo si el componente se desmonta completamente
        };
    }, []); // Array vacío - solo ejecutar una vez

    const handleRetry = () => {
        hasFetched.current = false; // Reset para permitir nuevo fetch
        setError(null);
        setIsLoading(true);
        // Forzar re-render del useEffect
        window.location.reload();
    };

    return (
        <section>
            {/* ✨ NUEVO BANNER PARA DUEÑOS DE HOTELES */}
            <HotelOwnerBanner />
            
            {/* Hero Section */}
            <div className="relative text-white min-h-[65vh]">
                <img 
                    src={heroImage} 
                    alt="Vista de un resort tropical"
                    className="absolute inset-0 w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 h-full min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">
                        Descubre el Alma del Mundo Maya
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
                        Tu viaje comienza aquí. Reserva, explora y vive experiencias únicas.
                    </p>
                    <PredictiveSearch />
                </div>
            </div>
            
            {/* Contenido de Hoteles */}
            <div className="container mx-auto px-6 py-16">
                <h2 className="text-4xl font-bold mb-2 text-center">Casa Maya</h2>
                <p className="text-center text-lg text-gray-600 mb-10">Hoteles con Encanto</p>
                
                {/* Estado de Carga */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Cargando hoteles...</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Conectando con el servidor backend...
                        </p>
                    </div>
                )}

                {/* Estado de Error */}
                {error && (
                    <div className="text-center py-12">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4 max-w-2xl mx-auto">
                            <h3 className="font-bold mb-2 text-lg">❌ Error de Conexión</h3>
                            <p className="mb-4">{error}</p>
                            
                            <div className="bg-red-50 p-4 rounded text-left text-sm">
                                <p className="font-semibold mb-2">🔧 Pasos para solucionar:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Verificar que el servidor backend esté ejecutándose:
                                        <code className="bg-gray-800 text-green-400 px-2 py-1 rounded ml-2 text-xs">
                                            cd backend && cargo run
                                        </code>
                                    </li>
                                    <li>El backend debe estar corriendo en <strong>http://127.0.0.1:8080</strong></li>
                                    <li>Verificar que veas el mensaje: "🚀 Servidor de Maya Digital iniciado"</li>
                                    <li>Asegúrate de que el proxy esté configurado en package.json</li>
                                </ol>
                            </div>
                            
                            <button 
                                onClick={handleRetry}
                                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                            >
                                🔄 Reintentar
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de Hoteles */}
                {!isLoading && !error && (
                    <>
                        {hoteles.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🏨</div>
                                <h3 className="text-2xl font-bold mb-2">No hay hoteles disponibles</h3>
                                <p className="text-gray-600 mb-4">
                                    Actualmente no hay hoteles aprobados en el sistema.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Los hoteles aparecerán aquí una vez que sean aprobados por un administrador.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <p className="text-green-600 font-medium">
                                        ✅ {hoteles.length} hotel{hoteles.length !== 1 ? 'es' : ''} encontrado{hoteles.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {hoteles.map(hotel => (
                                        <div key={hotel.id} className="card bg-white rounded-xl shadow-lg overflow-hidden">
                                            <img 
                                                src={hotel.image || 'https://via.placeholder.com/400x300?text=Sin+Imagen'} 
                                                alt={hotel.name} 
                                                className="w-full h-56 object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
                                                }}
                                            />
                                            <div className="p-6">
                                                <h3 className="text-2xl font-bold mb-2">{hotel.name}</h3>
                                                <p className="text-gray-600 mb-4">📍 {hotel.location}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                                                        ${hotel.price} MXN
                                                    </span>
                                                    <button 
                                                        onClick={() => onReserveClick(hotel)} 
                                                        className="btn-primary font-bold py-2 px-4 rounded-full hover:transform hover:scale-105 transition"
                                                    >
                                                        Reservar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}