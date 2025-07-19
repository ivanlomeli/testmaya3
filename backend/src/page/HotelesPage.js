// src/pages/HotelesPage.js

import { useState, useEffect } from 'react';

export default function HotelesPage({ onReserveClick }) {
    const [hoteles, setHoteles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Hacemos la llamada a nuestro backend de Rust
        fetch('http://127.0.0.1:8080/api/hoteles')
            .then(response => response.json())
            .then(data => {
                setHoteles(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener los hoteles:", error);
                setIsLoading(false);
            });
    }, []); // El array vacío asegura que esto se ejecute solo una vez

    return (
        <section>
            <div className="hero-section text-white min-h-[65vh] flex items-center justify-center">
                <div className="text-center px-4"><h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">Descubre el Alma del Mundo Maya</h1><p className="text-xl md:text-2xl mb-8 drop-shadow-md">Tu viaje comienza aquí. Reserva, explora y vive experiencias únicas.</p><div className="bg-white/90 rounded-full p-2 max-w-2xl mx-auto shadow-2xl"><form className="flex items-center"><input type="text" placeholder="Busca en todas las categorías..." className="w-full bg-transparent border-none focus:ring-0 text-gray-800 px-4 py-2 text-lg" /><button type="submit" className="btn-primary rounded-full px-8 py-3 font-bold text-base flex-shrink-0">Buscar</button></form></div></div>
            </div>
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