// src/components/PredictiveSearch.js

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js'; // <-- 1. Importamos la librería

// --- Datos y configuración de Fuse ---
const data = {
    hoteles: [ { id: 'h1', name: 'Hotel Balam Kú', type: 'Hotel' }, { id: 'h2', name: 'Hacienda Uxmal', type: 'Hotel' }, { id: 'h3', name: 'Resort Kin Ha', type: 'Hotel' } ],
    experiencias: [ { id: 'e1', name: 'Tour a Chichén Itzá', type: 'Experiencia' }, { id: 'e2', name: 'Paseo a Caballo', type: 'Experiencia' }, { id: 'e3', name: 'Nado en Cenote Sagrado', type: 'Experiencia' } ],
    productos: [ { id: 'p1', name: 'Huipil Ceremonial', type: 'Artesanía' }, { id: 'p2', name: 'Vasija de Sac-bé', type: 'Artesanía' }, { id: 'p3', name: 'Aretes de Filigrana', type: 'Artesanía' } ],
    restaurantes: [ { id: 'r1', name: 'Corazón de Jade', type: 'Restaurante' }, { id: 'r2', name: 'La Ceiba', type: 'Restaurante' } ],
};
const allItems = [ ...data.hoteles, ...data.experiencias, ...data.productos, ...data.restaurantes ];

// 2. Configuramos el motor de búsqueda de Fuse
const fuseOptions = {
  keys: ['name', 'type'], // ¿En qué campos del objeto debe buscar?
  includeScore: true,    // Incluir una puntuación de relevancia
  threshold: 0.4,        // Qué tan "estricta" es la búsqueda (0 es perfecto, 1 es muy permisivo)
};
const fuse = new Fuse(allItems, fuseOptions);


export default function PredictiveSearch() {
    const [searchTerm, setSearchTerm] = useState('');

    // 3. La búsqueda ahora usa Fuse.js
    const suggestions = useMemo(() => {
        if (searchTerm.length < 2) {
            return [];
        }
        // fuse.search() devuelve una lista de resultados con su puntuación
        return fuse.search(searchTerm).map(result => result.item).slice(0, 5);
    }, [searchTerm]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        console.log("Búsqueda enviada:", searchTerm);
    };

    return (
        <div className="relative bg-white/90 rounded-full p-2 max-w-2xl w-full shadow-2xl transition-all duration-200 focus-within:ring-2 focus-within:ring-theme-primary">
            <form className="flex items-center" onSubmit={handleFormSubmit}>
                <input 
                    type="text" 
                    placeholder="Busca hoteles, experiencias, productos..." 
                    className="w-full bg-transparent border-none text-gray-800 px-4 py-2 text-lg focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off" // Desactivamos el autocompletado del navegador
                />
                <button type="submit" className="btn-primary rounded-full px-8 py-3 font-bold text-base flex-shrink-0">Buscar</button>
            </form>

            {suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border text-left z-50 animate-fade-in">
                    <ul className="py-2">
                        <li className="px-4 pt-1 pb-2 text-xs text-gray-400 font-semibold uppercase">Sugerencias</li>
                        {suggestions.map(item => (
                            <li key={item.id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                <p className="font-bold">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.type}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}