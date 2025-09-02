// frontend/src/pages/HotelLandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';

export default function HotelLandingPage() {
    const benefits = [
        {
            icon: '🌍',
            title: 'Alcance Global',
            description: 'Llega a miles de viajeros de todo el mundo buscando experiencias auténticas en México'
        },
        {
            icon: '💰',
            title: 'Sin Costo Inicial',
            description: 'Únete gratis y solo paga una comisión cuando recibas reservas confirmadas'
        },
        {
            icon: '📱',
            title: 'Gestión Fácil',
            description: 'Panel intuitivo para administrar reservas, precios y disponibilidad'
        },
        {
            icon: '📈',
            title: 'Aumenta tus Ingresos',
            description: 'Nuestros partners incrementan sus reservas hasta en un 40%'
        },
        {
            icon: '🎯',
            title: 'Marketing Dirigido',
            description: 'Promocionamos tu hotel a viajeros interesados en turismo cultural y sostenible'
        },
        {
            icon: '🏆',
            title: 'Soporte Especializado',
            description: 'Equipo dedicado para ayudarte a optimizar tu perfil y maximizar reservas'
        }
    ];

    const steps = [
        {
            number: '1',
            title: 'Regístrate',
            description: 'Completa el formulario con la información de tu hotel',
            icon: '📝'
        },
        {
            number: '2',
            title: 'Verificación',
            description: 'Nuestro equipo revisa y aprueba tu hotel (24-48 horas)',
            icon: '✅'
        },
        {
            number: '3',
            title: 'Empieza a Vender',
            description: 'Tu hotel aparece en nuestra plataforma y empiezas a recibir reservas',
            icon: '🚀'
        }
    ];

    const testimonials = [
        {
            name: 'Carlos Hernández',
            hotel: 'Hotel Balam Kú, Tulum',
            quote: 'Desde que nos unimos a Maya Digital, nuestras reservas aumentaron 35%. La plataforma es muy fácil de usar.',
            rating: 5
        },
        {
            name: 'Ana Martínez',
            hotel: 'Hacienda Uxmal, Yucatán',
            quote: 'El soporte es excelente y realmente entienden las necesidades de los hoteles boutique.',
            rating: 5
        },
        {
            name: 'Roberto Pech',
            hotel: 'Casa Zazil-Ha, Isla Mujeres',
            quote: 'Maya Digital nos conectó con viajeros que buscan experiencias auténticas. Perfecto para nuestro hotel.',
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                <div className="container mx-auto px-6 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                                Haz Crecer tu Hotel con 
                                <span className="text-yellow-400"> Maya Digital</span>
                            </h1>
                            <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                                Únete a la plataforma líder de turismo sustentable en México 
                                y conecta con viajeros que buscan experiencias auténticas.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link 
                                    to="/registro-hotel"
                                    className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition text-center"
                                >
                                    🚀 Registrar Mi Hotel
                                </Link>
                                <a 
                                    href="#como-funciona"
                                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-900 transition text-center"
                                >
                                    📖 Cómo Funciona
                                </a>
                            </div>

                            <div className="flex items-center space-x-6 text-blue-100">
                                <div className="flex items-center space-x-2">
                                    <span className="text-yellow-400">✓</span>
                                    <span>Sin costo inicial</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-yellow-400">✓</span>
                                    <span>Configuración en 24h</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-yellow-400">✓</span>
                                    <span>Soporte 24/7</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop" 
                                    alt="Hotel de lujo en la playa"
                                    className="rounded-2xl shadow-2xl"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 p-6 rounded-xl shadow-xl">
                                    <div className="text-3xl font-bold text-green-600">+40%</div>
                                    <div className="text-sm text-gray-600">Aumento promedio en reservas</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                            <div className="text-gray-600">Hoteles Partners</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
                            <div className="text-gray-600">Reservas Procesadas</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
                            <div className="text-gray-600">Satisfacción del Cliente</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                            <div className="text-gray-600">Soporte Técnico</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            ¿Por qué elegir Maya Digital?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Somos más que una plataforma de reservas. Somos tu socio estratégico 
                            para hacer crecer tu negocio hotelero de manera sostenible.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
                                <div className="text-4xl mb-4">{benefit.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="como-funciona" className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            ¿Cómo funciona?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Tres pasos simples para empezar a recibir más reservas
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                                    {step.number}
                                </div>
                                <div className="text-4xl mb-4">{step.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link 
                            to="/registro-hotel"
                            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition inline-block"
                        >
                            Empezar Ahora →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Lo que dicen nuestros partners
                        </h2>
                        <p className="text-xl text-gray-600">
                            Historias reales de hoteles que han crecido con Maya Digital
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="text-yellow-400 text-xl">★</span>
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                                <div>
                                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                                    <div className="text-sm text-gray-500">{testimonial.hotel}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Preguntas Frecuentes
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-6">
                        <FAQItem 
                            question="¿Cuánto cuesta unirse a Maya Digital?"
                            answer="Es completamente gratis unirse. Solo pagas una comisión del 15% cuando recibes una reserva confirmada. No hay costos iniciales ni cuotas mensuales."
                        />
                        <FAQItem 
                            question="¿Cuánto tiempo toma la aprobación?"
                            answer="Nuestro equipo revisa cada solicitud en un plazo de 24-48 horas. Una vez aprobado, tu hotel estará visible inmediatamente en la plataforma."
                        />
                        <FAQItem 
                            question="¿Qué tipo de hoteles aceptan?"
                            answer="Aceptamos hoteles boutique, haciendas, casas de huéspedes, eco-lodges y propiedades únicas que ofrezcan experiencias auténticas mexicanas."
                        />
                        <FAQItem 
                            question="¿Cómo recibo los pagos?"
                            answer="Los pagos se procesan automáticamente y se transfieren a tu cuenta bancaria cada 15 días. Deducimos nuestra comisión y te enviamos el resto."
                        />
                        <FAQItem 
                            question="¿Puedo cancelar en cualquier momento?"
                            answer="Sí, puedes pausar o cancelar tu cuenta en cualquier momento desde tu panel de control. No hay penalizaciones ni costos de cancelación."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">
                        ¿Listo para hacer crecer tu hotel?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Únete a cientos de hoteles que ya están aumentando sus reservas 
                        con Maya Digital. El registro toma menos de 10 minutos.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link 
                            to="/registro-hotel"
                            className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition"
                        >
                            🚀 Registrar Mi Hotel Gratis
                        </Link>
                        <div className="text-blue-100">
                            o <a href="mailto:partners@mayadigital.com" className="underline hover:text-white">contáctanos directamente</a>
                        </div>
                    </div>

                    <div className="mt-8 text-blue-200 text-sm">
                        ✓ Sin costo inicial • ✓ Configuración gratuita • ✓ Soporte incluido
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Maya Digital</h3>
                            <p className="text-gray-400">
                                La plataforma líder de turismo sustentable en México.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Para Hoteles</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/registro-hotel" className="hover:text-white">Registrar Hotel</Link></li>
                                <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                                <li><a href="#" className="hover:text-white">Recursos</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Soporte</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="tel:+529991234567" className="hover:text-white">+52 999 123 4567</a></li>
                                <li><a href="mailto:partners@mayadigital.com" className="hover:text-white">partners@mayadigital.com</a></li>
                                <li><a href="#" className="hover:text-white">Chat en vivo</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Síguenos</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
                                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 Maya Digital. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Componente FAQ Item
function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md">
            <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold text-gray-900">{question}</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ↓
                </span>
            </button>
            {isOpen && (
                <div className="px-6 pb-6">
                    <p className="text-gray-600">{answer}</p>
                </div>
            )}
        </div>
    );
}