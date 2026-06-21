import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Plus, Minus, Inbox, ArrowRight } from 'lucide-react';

export default function CargoDrawer({ isOpen, onClose }) {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Shadow Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-void cursor-none"
          />

          {/* Slide-out Cargo Drawer HUD */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[450px] border-l border-acid/30 bg-void/95 p-6 shadow-acid flex flex-col font-mono text-soft-ash"
          >
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-acid/20 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-acid animate-ping" />
                <h2 className="font-display font-black tracking-widest text-acid text-lg">
                  CARGO_INVENTORY
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-1 rounded border border-acid/20 hover:border-acid text-acid hover:bg-acid/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cargo Scroll List */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-1">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
                  <Inbox className="h-10 w-10 text-acid/40" />
                  <p className="font-mono text-xs text-soft-ash/60">// NO CARGO DETECTED IN STORAGE</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div 
                    key={item.product} 
                    className="flex gap-4 p-3 bg-sludge border border-acid/20 rounded clip-chamfer-sm hover:border-acid/40 transition-colors"
                  >
                    {/* Item Thumbnail */}
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=150'} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded border border-acid/10 bg-void"
                    />

                    {/* Meta details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-f0f0f0 line-clamp-1">{item.name.toUpperCase()}</h4>
                        <span className="text-[10px] font-arcade text-hazard">${item.price.toFixed(2)}</span>
                      </div>
                      
                      {/* Quantity adjusting panel */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-acid/30 rounded bg-void">
                          <button 
                            onClick={() => updateQuantity(item.product, item.quantity - 1)}
                            className="p-1 hover:text-acid transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-mono font-bold text-f0f0f0">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product, item.quantity + 1)}
                            className="p-1 hover:text-acid transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.product)}
                          className="text-blaze hover:text-blaze/70 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculation / Trigger box */}
            {cartItems.length > 0 && (
              <div className="border-t border-acid/20 pt-6 mt-6 bg-void/50 space-y-4">
                <div className="flex items-center justify-between font-mono text-sm">
                  <span>TOTAL_VALUE:</span>
                  <span className="font-arcade text-acid text-base">${getCartTotal().toFixed(2)}</span>
                </div>

                <div className="p-2 border border-hazard/20 bg-hazard/5 text-[10px] rounded text-center text-hazard font-mono">
                  // PAYMENT SECURED ON INSTANT CYBERNETIC ENCLAVE
                </div>

                <button 
                  onClick={handleCheckoutClick}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blaze text-void font-display font-black text-sm tracking-widest rounded shadow-blaze hover:shadow-blaze-intense active:scale-[0.98] transition-all group"
                >
                  INITIALIZE_CHECKOUT
                  <ArrowRight className="h-4 w-4 text-void group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
