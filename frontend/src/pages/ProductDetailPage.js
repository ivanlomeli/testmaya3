// src/pages/ProductDetailPage.js

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function ProductDetailPage() {
    const location = useLocation();
    const { product } = location.state; // Obtenemos el producto enviado desde la página anterior

    const [activeImage, setActiveImage] = useState('');

    useEffect(() => {
        if (product && product.images && product.images.length > 0) {
            setActiveImage(product.images[0]);
        }
    }, [product]);

    if (!product) {
        return <div className="text-center py-20">Producto no encontrado.</div>;
    }

    return (
        <div className="container mx-auto px-6 py-16">
            <div className="mb-8">
                <Link to="/artesanos" className="text-theme-primary hover:underline">
                    &larr; Volver a Artesanos
                </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                {/* Columna de la Galería de Imágenes */}
                <div>
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4">
                        <img src={activeImage} alt={product.name} className="w-full h-full object-cover rounded-lg shadow-lg" />
                    </div>
                    <div className="flex gap-2 justify-center">
                        {product.images.map((imgUrl, index) => (
                            <div key={index} className={`w-20 h-20 rounded-md cursor-pointer border-2 transition-all ${activeImage === imgUrl ? 'border-theme-primary' : 'border-transparent hover:border-gray-300'}`} onClick={() => setActiveImage(imgUrl)}>
                                <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columna de Información del Producto */}
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold">{product.name}</h1>
                    <p className="text-lg text-gray-500 mb-4">Por {product.artisan}</p>
                    <p className="text-3xl font-bold my-6 text-theme-primary">${product.price} MXN</p>
                    <p className="text-gray-700 mb-6 leading-relaxed">{product.desc}</p>
                    <button onClick={() => alert('Añadido al carrito (simulación)')} className="btn-secondary w-full max-w-sm font-bold py-3 rounded-full">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    );
}