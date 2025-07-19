// src/components/Modal.js

export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) {
      return null; // Si no está abierto, no renderiza nada
    }
  
    return (
      <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose} // Cierra el modal si se hace clic en el fondo
      >
        <div 
          className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl relative"
          onClick={(e) => e.stopPropagation()} // Evita que el clic en el contenido cierre el modal
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
          {children} {/* Aquí se mostrará el contenido que le pasemos al modal */}
        </div>
      </div>
    );
  }