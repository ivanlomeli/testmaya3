// src/components/ProductDetailModal.js

import { useState, useEffect } from 'react';

export default function ProductDetailModal({ product, onAddToCart, onClose }) {
    // Estado para saber qué imagen está activa en la galería
    const [activeImage, setActiveImage] = useState('');

    // Cuando el producto cambia, establecemos la primera imagen como la activa
    useEffect(() => {
        if (product && product.images && product.images.length > 0) {
            setActiveImage(product.images[0]);
        }
    }, [product]);

    if (!product) return null;

    const handleAddToCartClick = () => {
        onAddToCart(product);
        onClose(); 
    };

    return (
        <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Columna de la Galería de Imágenes */}
            <div>
                <div className="aspect-square bg-gray-100 rounded-lg mb-4">
                    <img 
                        src={activeImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded-lg shadow-lg" 
                    />
                </div>
                <div className="flex gap-2 justify-center">
                    {product.images.map((imgUrl, index) => (
                        <div 
                            key={index}
                            className={`w-16 h-16 rounded-md cursor-pointer border-2 transition-all ${activeImage === imgUrl ? 'border-theme-primary' : 'border-transparent hover:border-gray-300'}`}
                            onClick={() => setActiveImage(imgUrl)}
                        >
                            <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Columna de Información del Producto */}
            <div>
                <h3 className="text-3xl font-bold">{product.name}</h3>
                <p className="text-gray-500 mb-4">Por {product.artisan}</p>
                <p className="text-gray-700 mb-4">{product.desc}</p>
                <p className="text-3xl font-bold mb-6" style={{ color: 'var(--theme-primary)' }}>${product.price} MXN</p>
                <button onClick={handleAddToCartClick} className="btn-secondary w-full font-bold py-3 rounded-full">
                    Añadir al Carrito
                </button>
            </div>
        </div>
    );
}