// src/pages/ArtesanosPage.js

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Importamos las imágenes locales
import huipil1 from '../assets/huipil-1.jpg';
import huipil2 from '../assets/huipil-2.jpg';
import huipil3 from '../assets/huipil-3.jpg';
import vasija1 from '../assets/vasija-1.jpg';
import vasija2 from '../assets/vasija-2.jpg';
import aretes1 from '../assets/aretes-1.jpg';

// Usamos los datos con las imágenes locales
const allProducts = [
    { id: 1, name: 'Huipil Ceremonial', artisan: 'Elena Poot', price: 1800, category: 'textil', images: [huipil1, huipil2, huipil3], desc: 'Tejido a mano con técnicas ancestrales...' },
    { id: 2, name: 'Vasija de Sac-bé', artisan: 'Mateo Cruz', price: 950, category: 'ceramica', images: [vasija1, vasija2], desc: 'Cerámica de alta temperatura...' },
    { id: 3, name: 'Aretes de Filigrana', artisan: 'Isabel Chi', price: 1200, category: 'joyeria', images: [aretes1], desc: 'Elegantes aretes de plata...' },
];

export default function ArtesanosPage() {
    // El resto del componente no necesita los datos del backend por ahora, usamos los locales
    const [filteredProducts, setFilteredProducts] = useState(allProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        let products = allProducts.filter(p => 
            (selectedCategory === 'all' || p.category === selectedCategory) &&
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.artisan.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredProducts(products);
    }, [searchTerm, selectedCategory]);

    return (
        <div className="container mx-auto px-6 py-16">
            <h2 className="text-4xl font-bold mb-2 text-center">Corazón Maya</h2>
            {/* ... resto del JSX de la página de artesanos ... */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                    // --- AQUÍ ESTÁ EL CAMBIO ---
                    // El prop 'state' envía el objeto 'product' completo a la página de detalle
                    <Link to={`/artesanos/${product.id}`} state={{ product: product }} key={product.id} className="card bg-white rounded-xl shadow-lg overflow-hidden block">
                        <img src={product.images[0]} alt={product.name} className="w-full h-56 object-cover" />
                        <div className="p-4">
                            <h3 className="font-bold">{product.name}</h3>
                            <p className="text-sm text-gray-500">Por {product.artisan}</p>
                            <p className="font-bold mt-2" style={{ color: 'var(--theme-primary)' }}>${product.price} MXN</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}