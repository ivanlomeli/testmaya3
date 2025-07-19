import { useState, useEffect } from 'react';

export default function RestaurantesPage({ onMenuClick }) {
    const [restaurantes, setRestaurantes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('http://127.0.0.1:8080/api/restaurantes')
            .then(res => res.json())
            .then(data => {
                setRestaurantes(data);
                setIsLoading(false);
            })
            .catch(error => console.error("Error al obtener restaurantes:", error));
    }, []);

    if (isLoading) {
        return <div className="container mx-auto px-6 py-16 text-center"><p>Cargando restaurantes...</p></div>;
    }

    return (
        <div className="container mx-auto px-6 py-16">
            <h2 className="text-4xl font-bold mb-2 text-center">Sabor Maya</h2>
            <p className="text-center text-lg text-gray-600 mb-10">Cocina que Enamora</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restaurantes.map(restaurant => (
                    <div key={restaurant.id} className="card bg-white rounded-xl shadow-lg overflow-hidden">
                        <img src={restaurant.image} alt={restaurant.name} className="w-full h-56 object-cover" />
                        <div className="p-6">
                            <h3 className="text-2xl font-bold mb-2">{restaurant.name}</h3>
                            <p className="text-gray-600 mb-4">{restaurant.specialty} - {restaurant.location}</p>
                            <div className="flex justify-end items-center">
                                <button onClick={() => onMenuClick(restaurant)} className="btn-secondary font-bold py-2 px-4 rounded-full">Ver Menú</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
