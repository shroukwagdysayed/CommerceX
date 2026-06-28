import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MainLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemsCount = cart
    ? cart.items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-brand-dark/85 backdrop-blur-md border-b border-white/8">
        <div className="container mx-auto px-6 flex justify-between items-center h-[70px]">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg w-9 h-9 flex items-center justify-center text-white text-lg font-black shadow-md">
              G
            </span>
            <span className="gradient-text">GALAXY</span>
          </Link>
 
          <nav className="flex items-center gap-8">
            <Link to="/" className="font-medium hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <Link to="/products" className="font-medium hover:text-indigo-400 transition-colors">
              Products
            </Link>
            <Link to="/cart" className="flex items-center gap-1.5 font-medium hover:text-indigo-400 transition-colors">
              Cart
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-5 h-5 inline-flex items-center justify-center text-[10px] text-white font-bold animate-fade-in">
                {cartItemsCount}
              </span>
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="font-medium hover:text-indigo-400 transition-colors">
                Orders
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="font-medium hover:text-indigo-400 transition-colors">
                Admin
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-5">
                <Link to="/profile" className="font-medium hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-black uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm text-slate-300 font-semibold">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="btn-secondary px-4 py-1.5 text-xs cursor-pointer">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-secondary px-5 py-2 text-sm">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-8">
        <div className="container mx-auto px-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-t-white/8 bg-brand-secondary py-12 mt-16 text-center text-slate-400">
        <div className="container mx-auto px-6">
          <div className="mb-4 font-bold text-xl gradient-text">
            GALAXY E-COMMERCE
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Galaxy. All rights reserved. Created with MERN Stack + TypeScript + Tailwind v4.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
