import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ShoppingBag, Terminal, User, Shield } from 'lucide-react';

export default function Navbar({ onToggleCart }) {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-acid/30 bg-void/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Brand Logo with glitch/shadow */}
        <Link to="/" className="flex items-center gap-2 group">
          <Terminal className="h-6 w-6 text-acid animate-pulse group-hover:text-hazard transition-colors" />
          <span className="font-display font-black text-xl tracking-widest text-acid hover-glitch" style={{ textShadow: '0 0 8px #39ff14' }}>
            PROJECT_NEXUS
          </span>
        </Link>

        {/* Navigation Uplink */}
        <nav className="flex items-center gap-3 sm:gap-6 md:gap-8 font-mono text-[10px] sm:text-xs md:text-sm tracking-wider">
          <Link to="/" className="text-soft-ash hover:text-acid hover:underline underline-offset-4 transition-colors">
            //_HOME
          </Link>
          <Link to="/catalog" className="text-soft-ash hover:text-acid hover:underline underline-offset-4 transition-colors">
            //_CATALOG
          </Link>
          {/* Playground/System Control Room Link */}
          {user && (user.role === 'superadmin' || user.role === 'editor') && (
            <Link to="/playground" className="text-soft-ash hover:text-acid hover:underline underline-offset-4 transition-colors">
              //_PLAYGROUND
            </Link>
          )}
          
          {/* Admin Command Link */}
          {user && (user.role === 'superadmin' || user.role === 'editor') && (
            <Link to="/admin" className="flex items-center gap-1 text-hazard hover:text-acid hover:underline underline-offset-4 transition-colors">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">//_ADMIN_NEXUS</span>
              <span className="sm:hidden">//_ADMIN</span>
            </Link>
          )}
        </nav>

        {/* User Actions Panel */}
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4 font-mono text-xs">
              <Link to="/profile" className="flex items-center gap-2 text-soft-ash hover:text-acid transition-colors">
                <User className="h-4 w-4 text-acid" />
                <span className="hidden sm:inline border-b border-dotted border-acid">{user.firstName.toUpperCase()}</span>
              </Link>
              <button 
                onClick={logout} 
                className="px-2.5 py-1 text-blaze border border-blaze/40 rounded hover:bg-blaze/10 transition-all font-mono"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="flex items-center gap-1.5 font-mono text-xs text-soft-ash hover:text-acid transition-all"
            >
              <User className="h-4 w-4" />
              //_UPLINK_LOGIN
            </Link>
          )}

          {/* Cart Icon trigger */}
          <button 
            onClick={onToggleCart} 
            className="relative flex items-center justify-center p-2 rounded-full border border-acid/20 hover:border-acid/80 hover:bg-acid/10 transition-all group"
          >
            <ShoppingBag className="h-5 w-5 text-acid group-hover:scale-105 transition-transform" />
            {getCartItemCount() > 0 && (
              <span 
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blaze text-[10px] font-arcade text-void font-bold shadow-blaze"
                style={{ textShadow: 'none' }}
              >
                {getCartItemCount()}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
