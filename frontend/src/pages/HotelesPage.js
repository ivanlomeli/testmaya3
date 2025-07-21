// src/pages/HotelesPage.js

import { useState, useEffect } from 'react';
import heroImage from '../assets/hero-background.jpg'; // Importa la imagen local
import PredictiveSearch from '../components/PredictiveSearch'; // Importa el componente de búsqueda

export default function HotelesPage({ onReserveClick }) {
    const [hoteles, setHoteles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/hoteles')
            .then(response => response.json())
            .then(data => {
                setHoteles(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener los hoteles:", error);
                setIsLoading(false);
            });
    }, []);

    return (
        <section>
            {/* Hero con la imagen de fondo correcta Y la búsqueda predictiva */}
            <div className="relative text-white min-h-[65vh]">
                <img 
                    src={heroImage} 
                    alt="Vista de un resort tropical"
                    className="absolute inset-0 w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10 h-full min-h-[65vh] flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">Descubre el Alma del Mundo Maya</h1>
                    <p className="text-xl md:text-2xl mb-8 drop-shadow-md">Tu viaje comienza aquí. Reserva, explora y vive experiencias únicas.</p>
                    
                    {/* --- AQUÍ ESTÁ LA CORRECCIÓN FINAL --- */}
                    {/* Se renderiza el componente de búsqueda en lugar del formulario estático */}
                    <PredictiveSearch />

                </div>
            </div>
            
            {/* Contenido de Hoteles */}
            <div className="container mx-auto px-6 py-16">
                <h2 className="text-4xl font-bold mb-2 text-center">Casa Maya</h2>
                <p className="text-center text-lg text-gray-600 mb-10">Hoteles con Encanto</p>
                {isLoading ? (
                    <p className="text-center">Cargando hoteles...</p>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {hoteles.map(hotel => (
                            <div key={hotel.id} className="card bg-white rounded-xl shadow-lg overflow-hidden">
                                <img src={hotel.image} alt={hotel.name} className="w-full h-56 object-cover" />
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold mb-2">{hotel.name}</h3>
                                    <p className="text-gray-600 mb-4">{hotel.location}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold" style={{ color: 'var(--theme-primary)' }}>${hotel.price} MXN</span>
                                        <button onClick={() => onReserveClick(hotel)} className="btn-primary font-bold py-2 px-4 rounded-full">Reservar</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}