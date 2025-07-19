// src/components/CaballosBookingForm.js

import { useState, useEffect } from 'react';

export default function CaballosBookingForm({ experience }) {
    const [jinetes, setJinetes] = useState(1);
    const [total, setTotal] = useState(experience.price);

    useEffect(() => {
        setTotal(jinetes * experience.price);
    }, [jinetes, experience.price]);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Reserva para ${experience.name} para ${jinetes} persona(s) por $${total.toFixed(2)} MXN confirmada (simulación).`);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">Reserva tu {experience.name}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Elige tu Caballo</label>
                    <select className="w-full p-2 border rounded-lg mt-1">
                        <option>Relámpago (dócil)</option>
                        <option>Furia (experimentado)</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Jinetes</label>
                    <input type="number" value={jinetes} onChange={(e) => setJinetes(e.target.value)} min="1" className="w-full p-2 border rounded-lg mt-1" />
                </div>
                <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 mb-4">
                    <p className="font-bold">Requisitos:</p>
                    <ul className="list-disc list-inside text-sm">
                        <li>Edad mínima: 12 años</li>
                        <li>Peso máximo: 100 kg</li>
                    </ul>
                </div>
                <div className="mt-6 bg-gray-100 p-4 rounded-lg text-right">
                    <div className="font-bold text-2xl">Total: ${total.toFixed(2)} MXN</div>
                </div>
                <button type="submit" className="btn-primary w-full font-bold py-3 px-4 rounded-full mt-4">Reservar Paseo</button>
            </form>
        </div>
    );
}