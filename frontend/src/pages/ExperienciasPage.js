import { useState, useEffect } from 'react';

export default function ExperienciasPage({ onExperienceClick }) {
    const [experiencias, setExperiencias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/experiencias')
            .then(res => res.json())
            .then(data => {
                setExperiencias(data);
                setIsLoading(false);
            })
            .catch(error => console.error("Error al obtener experiencias:", error));
    }, []);

    if (isLoading) {
        return <div className="container mx-auto px-6 py-16 text-center"><p>Cargando experiencias...</p></div>;
    }

    return (
        <div className="container mx-auto px-6 py-16">
            <h2 className="text-4xl font-bold mb-2 text-center">Aventura Maya</h2>
            <p className="text-center text-lg text-gray-600 mb-10">Vive la Historia y la Naturaleza</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {experiencias.map(exp => (
                    <div key={exp.id} className="card bg-white rounded-xl shadow-lg overflow-hidden">
                        <img src={exp.image} alt={exp.name} className="w-full h-56 object-cover" />
                        <div className="p-6">
                            <h3 className="text-2xl font-bold mb-2">{exp.name}</h3>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-xl font-bold" style={{ color: 'var(--theme-primary)' }}>${exp.price} MXN</span>
                                <button onClick={() => onExperienceClick(exp)} className="btn-primary font-bold py-2 px-4 rounded-full">Reservar</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
