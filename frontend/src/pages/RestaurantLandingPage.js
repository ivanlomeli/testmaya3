// frontend/src/pages/RestaurantLandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';

export default function RestaurantLandingPage() {
    const benefits = [
        {
            icon: '🍽️',
            title: 'Más Comensales',
            description: 'Atrae turistas y locales interesados en la auténtica gastronomía mexicana'
        },
        {
            icon: '📱',
            title: 'Pedidos Online',
            description: 'Sistema integrado de reservas y pedidos para llevar con notificaciones en tiempo real'
        },
        {
            icon: '📈',
            title: 'Aumenta Ventas',
            description: 'Nuestros partners incrementan sus ventas hasta en un 50% durante temporada alta'
        },
        {
            icon: '🎯',
            title: 'Marketing Gastronómico',
            description: 'Promocionamos tu restaurante a foodlovers y turistas gastronómicos'
        },
        {
            icon: '💰',
            title: 'Sin Costo Inicial',
            description: 'Únete gratis y solo paga una pequeña comisión cuando recibas pedidos'
        },
        {
            icon: '🏆',
            title: 'Soporte Culinario',
            description: 'Equipo especializado en gastronomía para ayudarte a destacar tu cocina'
        }
    ];

    const steps = [
        {
            number: '1',
            title: 'Regístrate',
            description: 'Completa el formulario con la información de tu restaurante y menú',
            icon: '📝'
        },
        {
            number: '2',
            title: 'Verificación',
            description: 'Revisamos tu restaurante y menú (24-48 horas)',
            icon: '✅'
        },
        {
            number: '3',
            title: 'Empieza a Vender',
            description: 'Tu restaurante aparece en nuestra plataforma y empiezas a recibir pedidos',
            icon: '🚀'
        }
    ];

    const testimonials = [
        {
            name: 'Elena Martínez',
            restaurant: 'La Cocina de Abuela, Mérida',
            quote: 'Maya Digital nos trajo clientes que realmente aprecian la cocina yucateca tradicional. Las ventas aumentaron 45%.',
            rating: 5
        },
        {
            name: 'Chef Roberto Sánchez',
            restaurant: 'Corazón de Jade, Campeche',
            quote: 'La plataforma es perfecta para restaurantes de alta cocina. Los clientes vienen buscando experiencias gastronómicas únicas.',
            rating: 5
        },
        {
            name: 'María José Pech',
            restaurant: 'El Fogón del Mayab, Valladolid',
            quote: 'El sistema de pedidos es muy fácil de usar y el soporte técnico es excelente. Lo recomiendo mucho.',
            rating: 5
        }
    ];

    const restaurantTypes = [
        { name: 'Cocina Tradicional', icon: '🌮' },
        { name: 'Alta Cocina', icon: '🍷' },
        { name: 'Mariscos', icon: '🦐' },
        { name: 'Cocina de Autor', icon: '👨‍🍳' },
        { name: 'Antojitos', icon: '🌯' },
        { name: 'Café & Postres', icon: '☕' }
    ];

    return (
        <div className="min-h-screen bg-white">
            
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 text-white">
                <div className="container mx-auto px-6 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                                Lleva tu Restaurante al 
                                <span className="text-yellow-300"> Siguiente Nivel</span>
                            </h1>
                            <p className="text-xl lg:text-2xl mb-8 text-orange-100">
                                Únete a Maya Digital y conecta con amantes de la gastronomía mexicana 
                                que buscan experiencias culinarias auténticas.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link 
                                    to="/registro-restaurante"
                                    className="bg-yellow-400 text-red-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition text-center"
                                >
                                    🍴 Registrar Mi Restaurante
                                </Link>
                                <a 
                                    href="#como-funciona"
                                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-red-900 transition text-center"
                                >
                                    📖 Cómo Funciona
                                </a>
                            </div>

                            <div className="flex items-center space-x-6 text-orange-100">
                                <div className="flex items-center space-x-2">
                                    <span className="text-yellow-300">✓</span>
                                    <span>Sin costo inicial</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-yellow-300">✓</span>
                                    <span>Configuración en 24h</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-yellow-300">✓</span>
                                    <span>Pedidos online</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop" 
                                    alt="Restaurante mexicano elegante"
                                    className="rounded-2xl shadow-2xl"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 p-6 rounded-xl shadow-xl">
                                    <div className="text-3xl font-bold text-red-600">+50%</div>
                                    <div className="text-sm text-gray-600">Aumento promedio en ventas</div>
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
                            <div className="text-4xl font-bold text-red-600 mb-2">300+</div>
                            <div className="text-gray-600">Restaurantes Partners</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-red-600 mb-2">75K+</div>
                            <div className="text-gray-600">Pedidos Procesados</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-red-600 mb-2">98%</div>
                            <div className="text-gray-600">Satisfacción del Cliente</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-red-600 mb-2">24/7</div>
                            <div className="text-gray-600">Soporte Técnico</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Restaurant Types Section */}
            <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Todo tipo de restaurantes son bienvenidos
                        </h2>
                        <p className="text-xl text-gray-600">
                            Desde antojitos hasta alta cocina, todos tienen lugar en Maya Digital
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {restaurantTypes.map((type, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition">
                                <div className="text-4xl mb-3">{type.icon}</div>
                                <h3 className="font-bold text-gray-900">{type.name}</h3>
                            </div>
                        ))}
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
                            Somos la plataforma gastronómica líder en turismo cultural. 
                            Te ayudamos a conectar con comensales que valoran la auténtica cocina mexicana.
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
            <section id="como-funciona" className="py-20 bg-gradient-to-r from-red-50 to-orange-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            ¿Cómo funciona?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Tres pasos simples para empezar a recibir más comensales
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
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
                            to="/registro-restaurante"
                            className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition inline-block"
                        >
                            Empezar Ahora →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Herramientas diseñadas para restaurantes
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <img 
                                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop" 
                                alt="Chef trabajando en cocina"
                                className="rounded-2xl shadow-xl"
                            />
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                                    📋
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Gestión de Menú</h3>
                                    <p className="text-gray-600">Actualiza tu menú, precios y disponibilidad en tiempo real desde cualquier dispositivo.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                                    🔔
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Notificaciones Instantáneas</h3>
                                    <p className="text-gray-600">Recibe alertas inmediatas de nuevas reservas y pedidos directamente en tu teléfono.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
                                    📊
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Analíticas de Ventas</h3>
                                    <p className="text-gray-600">Conoce tus platillos más populares, horarios pico y tendencias de tus clientes.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                                    💳
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Pagos Seguros</h3>
                                    <p className="text-gray-600">Sistema de pagos integrado con transferencias automáticas cada 15 días.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Lo que dicen nuestros chefs
                        </h2>
                        <p className="text-xl text-gray-600">
                            Historias reales de restaurantes que han crecido con Maya Digital
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
                                    <div className="text-sm text-gray-500">{testimonial.restaurant}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Preguntas Frecuentes
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-6">
                        <FAQItem 
                            question="¿Cuánto cuesta unirse a Maya Digital?"
                            answer="Es completamente gratis unirse. Solo pagas una comisión del 12% cuando recibes un pedido confirmado. No hay costos iniciales ni cuotas mensuales."
                        />
                        <FAQItem 
                            question="¿Qué tipos de restaurantes aceptan?"
                            answer="Aceptamos todo tipo de restaurantes: desde antojitos y fondas hasta alta cocina y restaurantes de autor. Lo importante es que ofrezcan auténtica gastronomía mexicana."
                        />
                        <FAQItem 
                            question="¿Cómo funcionan los pedidos para llevar?"
                            answer="Los clientes pueden hacer pedidos directamente desde la app. Recibes notificaciones inmediatas y puedes confirmar el tiempo de preparación."
                        />
                        <FAQItem 
                            question="¿Puedo actualizar mi menú en cualquier momento?"
                            answer="Sí, puedes actualizar tu menú, precios y disponibilidad en tiempo real desde tu panel de control las 24 horas del día."
                        />
                        <FAQItem 
                            question="¿Cómo recibo los pagos?"
                            answer="Los pagos se procesan automáticamente y se transfieren a tu cuenta bancaria cada 15 días. Deducimos nuestra comisión y te enviamos el resto."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 bg-gradient-to-r from-red-600 to-orange-700 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">
                        ¿Listo para hacer crecer tu restaurante?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Únete a cientos de restaurantes que ya están aumentando sus ventas 
                        con Maya Digital. El registro toma menos de 15 minutos.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link 
                            to="/registro-restaurante"
                            className="bg-yellow-400 text-red-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition"
                        >
                            🍴 Registrar Mi Restaurante Gratis
                        </Link>
                        <div className="text-orange-100">
                            o <a href="mailto:restaurantes@mayadigital.com" className="underline hover:text-white">contáctanos directamente</a>
                        </div>
                    </div>

                    <div className="mt-8 text-orange-200 text-sm">
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
                                La plataforma gastronómica líder en turismo cultural mexicano.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Para Restaurantes</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/registro-restaurante" className="hover:text-white">Registrar Restaurante</Link></li>
                                <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                                <li><a href="#" className="hover:text-white">Recursos Gastronómicos</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Soporte</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="tel:+529991234567" className="hover:text-white">+52 999 123 4567</a></li>
                                <li><a href="mailto:restaurantes@mayadigital.com" className="hover:text-white">restaurantes@mayadigital.com</a></li>
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