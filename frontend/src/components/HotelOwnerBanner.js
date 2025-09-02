// frontend/src/components/HotelOwnerBanner.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HotelOwnerBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 text-white py-6 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
            </div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start mb-2">
                            <span className="text-3xl mr-3">🏨</span>
                            <h2 className="text-2xl lg:text-3xl font-bold">
                                ¿Tienes un hotel o propiedad?
                            </h2>
                        </div>
                        <p className="text-lg lg:text-xl text-blue-100 mb-4 lg:mb-0">
                            Únete a Maya Digital y llega a miles de viajeros • 
                            <span className="font-semibold text-yellow-300"> Sin costo inicial</span> • 
                            Solo pagas cuando recibes reservas
                        </p>
                        
                        {/* Beneficios rápidos */}
                        <div className="hidden lg:flex items-center space-x-6 mt-3 text-sm">
                            <div className="flex items-center">
                                <span className="text-green-300 mr-1">✓</span>
                                <span>+40% más reservas</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-green-300 mr-1">✓</span>
                                <span>Gestión fácil</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-green-300 mr-1">✓</span>
                                <span>Soporte 24/7</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                        <Link 
                            to="/registro-hotel"
                            className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition transform hover:scale-105 shadow-lg text-center"
                        >
                            🚀 Registrar Gratis
                        </Link>
                        <Link 
                            to="/hoteles-unete"
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-900 transition text-center"
                        >
                            📖 Más Info
                        </Link>
                    </div>

                    {/* Botón para cerrar */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 lg:relative lg:top-auto lg:right-auto text-white hover:text-gray-300 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"
                        aria-label="Cerrar banner"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
}