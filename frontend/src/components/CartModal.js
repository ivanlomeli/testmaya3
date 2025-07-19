// src/components/CartModal.js

export default function CartModal({ cartItems, onRemoveItem }) {
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    const handleCheckout = () => {
        alert('Procediendo al pago (simulación)...');
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4">Mi Carrito de Compras</h3>
            <div className="space-y-4">
                {cartItems.length === 0 ? (
                    <p className="text-gray-500">Tu carrito está vacío.</p>
                ) : (
                    cartItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center border-b pb-2">
                            <div>
                                <h4 className="font-bold">{item.name}</h4>
                                <p className="text-sm text-gray-500">${item.price}</p>
                            </div>
                            <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700 font-bold">
                                Quitar
                            </button>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-dashed text-right">
                <span className="text-2xl font-bold">Total: </span>
                <span className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                    ${total.toFixed(2)} MXN
                </span>
            </div>
            <button 
                onClick={handleCheckout} 
                disabled={cartItems.length === 0}
                className="btn-secondary w-full font-bold py-3 px-4 rounded-full mt-6 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
                Proceder al Pago
            </button>
        </div>
    );
}