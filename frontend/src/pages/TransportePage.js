// src/components/TransportePage.js

export default function TransportePage({ onSolicitarClick }) {
    return (
        <div className="container mx-auto px-6 py-16">
            <h2 className="text-4xl font-bold mb-2 text-center">Camino Maya</h2>
            <p className="text-center text-lg text-gray-600 mb-10">Tu Viaje, Seguro</p>
            <div className="card bg-gray-800 text-white rounded-xl shadow-lg overflow-hidden p-8 md:p-12 text-center max-w-2xl mx-auto">
                <svg className="w-24 h-24 mx-auto mb-4 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <h3 className="text-3xl font-bold mb-4">Transporte Certificado</h3>
                <p className="mb-6">Conéctate con conductores locales verificados. Viaja con la tranquilidad que mereces.</p>
                <button 
                    onClick={onSolicitarClick} 
                    className="btn-secondary w-full max-w-xs mx-auto font-bold py-3 rounded-full"
                >
                    Solicitar un Viaje
                </button>
            </div>
        </div>
    );
}