import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from DB if logged in, otherwise from localStorage
  const loadCart = async () => {
    setLoading(true);
    if (user) {
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const data = await response.json();
          const dbItems = data.data.cart?.items || [];
          // Map DB structure to flat local structure
          setCartItems(
            dbItems.map((item) => ({
              product: item.product._id || item.product,
              name: item.product.name,
              price: item.product.price,
              slug: item.product.slug,
              image: item.product.images?.find((img) => img.isPrimary)?.url || item.product.images?.[0]?.url || '',
              quantity: item.quantity,
              countInStock: item.product.inventory?.countInStock || 0
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load DB cart:', err);
      }
    } else {
      const localCart = localStorage.getItem('nexus_cargo');
      if (localCart) {
        try {
          setCartItems(JSON.parse(localCart));
        } catch (e) {
          localStorage.removeItem('nexus_cargo');
        }
      } else {
        setCartItems([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  // Synchronize cart changes back to DB or localStorage
  const saveCartState = async (updatedItems) => {
    setCartItems(updatedItems);
    if (!user) {
      localStorage.setItem('nexus_cargo', JSON.stringify(updatedItems));
    } else {
      try {
        // Sync with backend API
        await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: updatedItems.map((item) => ({
              product: item.product,
              quantity: item.quantity
            }))
          })
        });
      } catch (err) {
        console.error('Failed to sync cart to backend:', err);
      }
    }
  };

  // Sync offline guest cart to DB upon login
  const syncGuestCartOnLogin = async () => {
    const localCart = localStorage.getItem('nexus_cargo');
    if (localCart) {
      try {
        const items = JSON.parse(localCart);
        if (items.length > 0) {
          const response = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: items.map((item) => ({
                product: item.product,
                quantity: item.quantity
              }))
            })
          });
          if (response.ok) {
            localStorage.removeItem('nexus_cargo');
            loadCart();
          }
        }
      } catch (e) {
        console.error('Failed to sync guest cart:', e);
      }
    }
  };

  useEffect(() => {
    if (user) {
      syncGuestCartOnLogin();
    }
  }, [user]);

  const addToCart = (productInfo) => {
    // Dispatch custom confetti event for whimsical visual burst
    window.dispatchEvent(new CustomEvent('confetti-trigger'));

    const existingIndex = cartItems.findIndex((item) => item.product === productInfo.id);
    let updated = [...cartItems];

    if (existingIndex > -1) {
      const newQty = updated[existingIndex].quantity + 1;
      // Cap at stock count if stock is available
      const maxStock = productInfo.countInStock || 99;
      updated[existingIndex].quantity = Math.min(newQty, maxStock);
    } else {
      updated.push({
        product: productInfo.id,
        name: productInfo.name,
        price: productInfo.price,
        slug: productInfo.slug,
        image: productInfo.image,
        quantity: 1,
        countInStock: productInfo.countInStock || 0
      });
    }

    saveCartState(updated);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const updated = cartItems.map((item) => {
      if (item.product === productId) {
        const maxStock = item.countInStock || 99;
        return { ...item, quantity: Math.min(newQuantity, maxStock) };
      }
      return item;
    });
    saveCartState(updated);
  };

  const removeFromCart = (productId) => {
    const updated = cartItems.filter((item) => item.product !== productId);
    saveCartState(updated);
  };

  const clearCart = () => {
    setCartItems([]);
    if (!user) {
      localStorage.removeItem('nexus_cargo');
    } else {
      saveCartState([]);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
        refreshCart: loadCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
