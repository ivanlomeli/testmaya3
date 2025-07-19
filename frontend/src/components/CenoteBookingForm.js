// src/components/CenoteBookingForm.js

import { useState, useEffect } from 'react';

const ticketTypes = [
    { name: 'Acceso General', price: 450 },
    { name: 'Acceso con Snorkel', price: 650 }
];

export default function CenoteBookingForm({ experience }) {
    const [personas, setPersonas] = useState(1);
    const [ticketType, setTicketType] = useState(ticketTypes[0]);
    const [total, setTotal] = useState(ticketTypes[0].price);

    useEffect(() => {
        setTotal(personas * ticketType.price);
    }, [personas, ticketType]);

    const handleTypeChange = (e) => {
        const selectedType = ticketTypes.find(t => t.price == e.target.value);
        setTicketType(selectedType);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Entradas para ${experience.name} (${ticketType.name}) para ${personas} persona(s) por $${total.toFixed(2)} MXN confirmadas (simulación).`);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">Entradas para {experience.name}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Personas</label>
                    <input type="number" value={personas} onChange={(e) => setPersonas(e.target.value)} min="1" className="w-full p-2 border rounded-lg mt-1" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Tipo de Entrada</label>
                    <select onChange={handleTypeChange} className="w-full p-2 border rounded-lg mt-1">
                        {ticketTypes.map(type => (
                            <option key={type.name} value={type.price}>{type.name} (${type.price})</option>
                        ))}
                    </select>
                </div>
                <div className="mt-6 bg-gray-100 p-4 rounded-lg text-right">
                    <div className="font-bold text-2xl">Total: ${total.toFixed(2)} MXN</div>
                </div>
                <button type="submit" className="btn-primary w-full font-bold py-3 px-4 rounded-full mt-4">Comprar Entradas</button>
            </form>
        </div>
    );
}