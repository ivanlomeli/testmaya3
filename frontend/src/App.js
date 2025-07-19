// frontend/src/App.js - VERSIÓN CORREGIDA CON RUTA DE EDICIÓN

import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './index.css';

// Importar todos los componentes y páginas
import Modal from './components/Modal';
import IntroAnimation from './components/IntroAnimation';
import Header from './components/Header';
import HotelBookingForm from './components/HotelBookingForm';
import RestaurantMenu from './components/RestaurantMenu';
import CaballosBookingForm from './components/CaballosBookingForm';
import CenoteBookingForm from './components/CenoteBookingForm';
import TourBookingForm from './components/TourBookingForm';
import ProductDetailPage from './pages/ProductDetailPage';
import CartModal from './components/CartModal';
import TransporteModal from './components/TransporteModal';
import RegistrationModal from './components/RegistrationModal';
import HotelesPage from './pages/HotelesPage';
import RestaurantesPage from './pages/RestaurantesPage';
import ExperienciasPage from './pages/ExperienciasPage';
import ArtesanosPage from './pages/ArtesanosPage';
import TransportePage from './pages/TransportePage';
import MisReservasPage from './pages/MisReservasPage';
import PortalPage from './pages/PortalPage';
import AdminPage from './pages/AdminPage';
import CreateHotelPage from './pages/CreateHotelPage'; // <-- esto es para el formulario para agegar hoteles 
import EditHotelPage from './pages/EditHotelPage'; // <-- NUEVO IMPORT para la edicion de los hoteles que los dueños agregan 

function App() {
    const [introComplete, setIntroComplete] = useState(false);
    const [modalState, setModalState] = useState({ type: null, data: null });
    const [cart, setCart] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);

    // ✅ VERIFICAR AUTENTICACIÓN AL CARGAR LA APP - CORREGIDO
    useEffect(() => {
        try {
            const token = localStorage.getItem('auth_token');
            const userDataString = localStorage.getItem('user_data');
            
            if (token && userDataString) {
                const parsedUserData = JSON.parse(userDataString);
                setIsLoggedIn(true);
                setUserData(parsedUserData);
                console.log('Usuario cargado desde localStorage:', parsedUserData);
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            // Limpiar localStorage corrupto
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            setIsLoggedIn(false);
            setUserData(null);
        }
    }, []);

    const openModal = (type, data = null) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null, data: null });

    const handleAddToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const handleRemoveFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const handleConfirmAction = (actionType, actionData) => {
        if (!isLoggedIn) {
            setPendingAction({ type: actionType, data: actionData });
            openModal('register');
            return;
        }

        // Procesar la acción basada en el tipo
        switch (actionType) {
            case 'hotel':
                console.log('Reserva de hotel confirmada:', actionData);
                closeModal();
                break;
            case 'restaurant':
                console.log('Reserva de restaurante confirmada:', actionData);
                closeModal();
                break;
            case 'experience':
                console.log('Reserva de experiencia confirmada:', actionData);
                closeModal();
                break;
            default:
                console.log('Acción confirmada:', actionType, actionData);
                closeModal();
        }
    };

    const handleRegistration = (newUserInfo) => {
        try {
            setIsLoggedIn(true);
            setUserData(newUserInfo.user);
            
            // Guardar en localStorage de forma segura
            localStorage.setItem('auth_token', newUserInfo.token);
            localStorage.setItem('user_data', JSON.stringify(newUserInfo.user));
            
            console.log('Usuario registrado:', newUserInfo.user);
            closeModal();
            
            // Ejecutar acción pendiente si existe
            if (pendingAction) {
                handleConfirmAction(pendingAction.type, pendingAction.data);
                setPendingAction(null);
            }
        } catch (error) {
            console.error('Error al guardar datos del usuario:', error);
        }
    };

    const handleLogin = (loginData) => {
        try {
            setIsLoggedIn(true);
            setUserData(loginData.user);
            
            // Guardar en localStorage de forma segura
            localStorage.setItem('auth_token', loginData.token);
            localStorage.setItem('user_data', JSON.stringify(loginData.user));
            
            console.log('Usuario logueado:', loginData.user);
            closeModal();
            
            // Ejecutar acción pendiente si existe
            if (pendingAction) {
                handleConfirmAction(pendingAction.type, pendingAction.data);
                setPendingAction(null);
            }
        } catch (error) {
            console.error('Error al guardar datos del usuario:', error);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserData(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        console.log('Usuario desconectado');
    };

    if (!introComplete) {
        return <IntroAnimation onAnimationComplete={() => setIntroComplete(true)} />;
    }

    return (
        <div className="antialiased">
            <Header 
                cartItemCount={cart.length}
                onCartClick={() => openModal('cart')}
                onLoginClick={() => openModal('register')}
                isLoggedIn={isLoggedIn}
                userData={userData}
                onLogout={handleLogout}
            />

            <main>
                <Routes>
                    <Route path="/" element={<HotelesPage onReserveClick={(data) => openModal('hotel', data)} />} />
                    <Route path="/restaurantes" element={<RestaurantesPage onMenuClick={(data) => openModal('restaurant', data)} />} />
                    <Route path="/experiencias" element={<ExperienciasPage onExperienceClick={(data) => openModal('experience', data)} />} />
                    <Route path="/artesanos" element={<ArtesanosPage />} />
                    <Route path="/artesanos/:productId" element={<ProductDetailPage onAddToCart={handleAddToCart}/>} />
                    <Route path="/transporte" element={<TransportePage onSolicitarClick={() => openModal('transporte')} />} />
                    <Route path="/mis-reservas" element={<MisReservasPage />} />
                    <Route path="/portal" element={<PortalPage userData={userData} isLoggedIn={isLoggedIn} />} />
                    <Route path="/portal/nuevo-hotel" element={<CreateHotelPage />} />
                    <Route path="/portal/editar-hotel/:hotelId" element={<EditHotelPage />} /> {/* <-- NUEVA RUTA PARA EDITAR HOTELES */}
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </main>

            <footer className="bg-gray-800 text-white py-10">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Maya Digital</h3>
                            <p className="text-gray-300">Tu puerta al mundo maya. Descubre, explora y vive experiencias únicas.</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Servicios</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li><Link to="/" className="hover:text-white">Hoteles</Link></li>
                                <li><Link to="/restaurantes" className="hover:text-white">Restaurantes</Link></li>
                                <li><Link to="/experiencias" className="hover:text-white">Experiencias</Link></li>
                                <li><Link to="/artesanos" className="hover:text-white">Artesanos</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Contacto</h4>
                            <p className="text-gray-300">Email: info@mayadigital.com</p>
                            <p className="text-gray-300">Teléfono: +52 999 123 4567</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Síguenos</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
                                <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
                                <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 Maya Digital. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>

            <Modal isOpen={!!modalState.type} onClose={closeModal}>
                {modalState.type === 'hotel' && (
                    <HotelBookingForm 
                        hotel={modalState.data} 
                        onConfirm={handleConfirmAction} 
                    />
                )}
                {modalState.type === 'restaurant' && (
                    <RestaurantMenu 
                        restaurant={modalState.data} 
                        onConfirm={handleConfirmAction} 
                    />
                )}
                {modalState.type === 'cart' && (
                    <CartModal 
                        cartItems={cart} 
                        onRemoveItem={handleRemoveFromCart} 
                    />
                )}
                {modalState.type === 'transporte' && <TransporteModal />}
                {modalState.type === 'register' && (
                    <RegistrationModal 
                        onRegister={handleRegistration}
                        onLogin={handleLogin}
                    />
                )}
                {modalState.type === 'experience' && (
                    <>
                        {modalState.data?.type === 'caballos' && (
                            <CaballosBookingForm 
                                experience={modalState.data} 
                                onConfirm={handleConfirmAction} 
                            />
                        )}
                        {modalState.data?.type === 'cenote' && (
                            <CenoteBookingForm 
                                experience={modalState.data} 
                                onConfirm={handleConfirmAction} 
                            />
                        )}
                        {modalState.data?.type === 'tour' && (
                            <TourBookingForm 
                                experience={modalState.data} 
                                onConfirm={handleConfirmAction} 
                            />
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
}

export default App;