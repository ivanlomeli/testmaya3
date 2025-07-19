// src/components/RestaurantMenu.js

import { useState, useEffect } from 'react';

// Datos de ejemplo para el menú
const menuItems = [
    { name: 'Cochinita Pibil', price: 250 },
    { name: 'Sopa de Lima', price: 150 },
    { name: 'Poc Chuc', price: 220 },
    { name: 'Relleno Negro', price: 230 },
];

export default function RestaurantMenu({ restaurant }) {
    const [order, setOrder] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const newTotal = order.reduce((sum, item) => sum + item.price, 0);
        setTotal(newTotal);
    }, [order]);

    const handleAddItem = (item) => {
        setOrder(prevOrder => [...prevOrder, item]);
    };

    const handleRemoveItem = (indexToRemove) => {
        setOrder(prevOrder => prevOrder.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Pedido para ${restaurant.name} por $${total.toFixed(2)} MXN listo para proceder al pago (simulación).`);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">Menú - {restaurant.name}</h2>
            
            {/* Lista del Menú */}
            <div className="space-y-3 mb-6">
                {menuItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                        <div>
                            <h4 className="font-bold">{item.name}</h4>
                            <p className="text-sm text-gray-600">${item.price.toFixed(2)} MXN</p>
                        </div>
                        <button onClick={() => handleAddItem(item)} className="btn-primary text-xs font-bold py-1 px-3 rounded-full">Añadir</button>
                    </div>
                ))}
            </div>

            {/* Resumen de la Orden */}
            <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Tu Orden</h3>
                <div className="space-y-2">
                    {order.length === 0 ? (
                        <p className="text-gray-500">La orden está vacía.</p>
                    ) : (
                        order.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <span>{item.name}</span>
                                <div className="flex items-center gap-4">
                                  <span>${item.price.toFixed(2)}</span>
                                  <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 font-bold">Quitar</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-4 pt-4 border-t-2 border-dashed font-bold text-xl text-right">
                    Total: ${total.toFixed(2)} MXN
                </div>
            </div>

             <button onClick={handleSubmit} className="btn-secondary w-full font-bold py-3 px-4 rounded-full mt-6">Proceder al Pago</button>
        </div>
    );
}