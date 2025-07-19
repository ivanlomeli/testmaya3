// src/components/TourBookingForm.js

import { useState, useEffect } from 'react';

export default function TourBookingForm({ experience, onConfirm }) {
    const [tourDate, setTourDate] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [total, setTotal] = useState(0);

    const pricePerAdult = experience.price || 1200;
    const pricePerChild = pricePerAdult * 0.6; // Los niños pagan el 60%

    // Efecto para recalcular el total
    useEffect(() => {
        const newTotal = (adults * pricePerAdult) + (children * pricePerChild);
        setTotal(newTotal);
    }, [adults, children, pricePerAdult, pricePerChild]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (adults < 1) {
            alert('Debe haber al menos un adulto en la reserva.');
            return;
        }
        const bookingData = {
            name: experience.name,
            total: total,
            personas: parseInt(adults, 10) + parseInt(children, 10),
            details: `${adults} adulto(s), ${children} niño(s) para el ${tourDate}`
        };
        onConfirm('experience', bookingData);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-4">Reservar {experience.name}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Fecha del Tour</label>
                    <input 
                        type="date" 
                        value={tourDate} 
                        onChange={(e) => setTourDate(e.target.value)} 
                        className="w-full p-2 border rounded-lg mt-1" 
                        required 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 font-semibold">Adultos</label>
                        <input 
                            type="number" 
                            value={adults} 
                            onChange={(e) => setAdults(e.target.value)} 
                            min="1" 
                            className="w-full p-2 border rounded-lg mt-1" 
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold">Niños</label>
                        <input 
                            type="number" 
                            value={children} 
                            onChange={(e) => setChildren(e.target.value)} 
                            min="0" 
                            className="w-full p-2 border rounded-lg mt-1" 
                        />
                    </div>
                </div>
                <div className="mt-6 bg-gray-100 p-4 rounded-lg text-right">
                    <div className="font-bold text-2xl">Total: ${total.toFixed(2)} MXN</div>
                </div>
                <button type="submit" className="btn-primary w-full font-bold py-3 px-4 rounded-full mt-4">Confirmar Reserva</button>
            </form>
        </div>
    );
}
