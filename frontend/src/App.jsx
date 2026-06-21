import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

// Custom Visual Components
import CustomCursor from './components/CustomCursor.jsx';
import CustomConfetti from './components/CustomConfetti.jsx';
import Navbar from './components/Navbar.jsx';
import CargoDrawer from './components/CargoDrawer.jsx';

// Page Views
import Homepage from './pages/Homepage.jsx';
import Catalog from './pages/Catalog.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import AuthUplink from './pages/AuthUplink.jsx';
import ProfileMainframe from './pages/ProfileMainframe.jsx';
import CheckoutUplink from './pages/CheckoutUplink.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          
          {/* Aesthetic layers at the root level */}
          <CustomCursor />
          <CustomConfetti />

          <div className="flex flex-col min-h-screen bg-void text-soft-ash">
            {/* Global Navbar */}
            <Navbar onToggleCart={() => setIsCartOpen(!isCartOpen)} />

            {/* Shopping Cargo Inventory Drawer HUD */}
            <CargoDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Main routed workspace viewport */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/products/:slug" element={<ProductDetails />} />
                <Route path="/auth" element={<AuthUplink />} />
                <Route path="/profile" element={<ProfileMainframe />} />
                <Route path="/checkout" element={<CheckoutUplink />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>

            {/* Subtle cybernetic terminal footer */}
            <footer className="border-t border-acid/15 py-6 bg-void/50 text-center font-mono text-[9px] opacity-45">
              // PROJECT NEXUS V2.0 // ALL TRANSMISSIONS ENCRYPTED SECURELY // 2026 UPLINK.
            </footer>
          </div>

        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
