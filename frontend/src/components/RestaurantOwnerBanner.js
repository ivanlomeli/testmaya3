// frontend/src/components/RestaurantOwnerBanner.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RestaurantOwnerBanner() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-gradient-to-r from-red-500 via-orange-600 to-yellow-500 text-white py-6 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
                <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white rounded-full -translate-y-10"></div>
            </div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    
                    {/* Contenido principal */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start mb-2">
                            <span className="text-3xl mr-3">🍽️</span>
                            <h2 className="text-2xl lg:text-3xl font-bold">
                                ¿Tienes un restaurante?
                            </h2>
                        </div>
                        <p className="text-lg lg:text-xl text-orange-100 mb-4 lg:mb-0">
                            Conecta con foodlovers y turistas gastronómicos • 
                            <span className="font-semibold text-yellow-300"> Pedidos online incluidos</span> • 
                            Solo pagas cuando vendes
                        </p>
                        
                        {/* Beneficios rápidos */}
                        <div className="hidden lg:flex items-center space-x-6 mt-3 text-sm">
                            <div className="flex items-center">
                                <span className="text-green-300 mr-1">✓</span>
                                <span>+50% más ventas</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-green-300 mr-1">✓</span>
                                <span>Sistema de pedidos</span>
                            </div>
                            <div className="flex items-center">
                                <span className="text-green-300 mr-1">✓</span>
                                <span>Marketing gastronómico</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                        <Link 
                            to="/registro-restaurante"
                            className="bg-yellow-400 text-red-900 px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition transform hover:scale-105 shadow-lg text-center"
                        >
                            🍴 Registrar Gratis
                        </Link>
                        <Link 
                            to="/restaurantes-unete"
                            className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-red-900 transition text-center"
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