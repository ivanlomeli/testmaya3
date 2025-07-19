// frontend/src/components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Imagotipo-Maya-Digital-2022.png';

function Header({ cartItemCount, onCartClick, onLoginClick, isLoggedIn, userData, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const goToAdmin = () => {
        navigate('/admin');
        setIsUserMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <img src={logo} alt="Maya Digital" className="h-10 w-auto" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link 
                            to="/" 
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                            Hoteles
                        </Link>
                        <Link 
                            to="/restaurantes" 
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                            Restaurantes
                        </Link>
                        <Link 
                            to="/experiencias" 
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                            Experiencias
                        </Link>
                        <Link 
                            to="/artesanos" 
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                            Artesanos
                        </Link>
                        <Link 
                            to="/transporte" 
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                            Transporte
                        </Link>
                    </nav>

                    {/* Right side - Cart and User */}
                    <div className="flex items-center space-x-4">
                        {/* Cart Button */}
                        <button
                            onClick={onCartClick}
                            className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 8.2M7 13l2.2-2.2M19 13v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" />
                            </svg>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>

                        {/* User Menu */}
                        {isLoggedIn && userData ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">
                                        {userData.first_name ? userData.first_name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="hidden sm:block font-medium">
                                        {userData.first_name || 'Usuario'}
                                    </span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <p className="text-sm font-medium text-gray-900">
                                                {userData.first_name} {userData.last_name}
                                            </p>
                                            <p className="text-sm text-gray-500">{userData.email}</p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                {userData.role === 'Admin' ? 'Administrador' : 
                                                 userData.role === 'HotelOwner' ? 'Dueño de Hotel' : 'Cliente'}
                                            </p>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <Link
                                                to="/mis-reservas"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                Mis Reservas
                                            </Link>

                                            {/* Portal para Hotel Owners */}
                                            {userData.role === 'HotelOwner' && (
                                                <Link
                                                    to="/portal"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    Portal de Hoteles
                                                </Link>
                                            )}

                                            {/* Panel Admin - SOLO para administradores */}
                                            {userData.role === 'Admin' && (
                                                <button
                                                    onClick={goToAdmin}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Panel de Administración
                                                </button>
                                            )}

                                            <div className="border-t border-gray-200 mt-2 pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Cerrar Sesión
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Login Button
                            <button
                                onClick={onLoginClick}
                                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium"
                            >
                                Iniciar Sesión
                            </button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <nav className="flex flex-col space-y-3">
                            <Link 
                                to="/" 
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Hoteles
                            </Link>
                            <Link 
                                to="/restaurantes" 
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Restaurantes
                            </Link>
                            <Link 
                                to="/experiencias" 
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Experiencias
                            </Link>
                            <Link 
                                to="/artesanos" 
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Artesanos
                            </Link>
                            <Link 
                                to="/transporte" 
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Transporte
                            </Link>
                            
                            {/* Admin option for mobile */}
                            {isLoggedIn && userData && userData.role === 'Admin' && (
                                <button
                                    onClick={() => {
                                        goToAdmin();
                                        setIsMenuOpen(false);
                                    }}
                                    className="text-left text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    🔧 Panel de Administración
                                </button>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;