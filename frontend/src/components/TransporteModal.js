// src/components/TransporteModal.js

export default function TransporteModal() {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Buscando conductor... (simulación)');
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Solicitar Viaje Certificado</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Mi ubicación</label>
                    <input type="text" className="w-full p-2 border rounded-lg mt-1 bg-gray-100" value="Aeropuerto Internacional de Cancún" readOnly />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold">Destino</label>
                    <input type="text" className="w-full p-2 border rounded-lg mt-1" placeholder="Escribe la dirección o nombre del hotel" required />
                </div>
                <button type="submit" className="btn-secondary w-full font-bold py-3 px-4 rounded-full mt-2">Buscar Conductor</button>
            </form>
        </div>
    );
}