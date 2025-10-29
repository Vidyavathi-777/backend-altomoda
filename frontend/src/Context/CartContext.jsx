import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from  "./UserContext.jsx";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, getToken } = useUser();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch cart when user logs in
  const fetchCart = useCallback(async () => {
    if (!user?.id) {
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/cart/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCart(data.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
      // Set empty cart on error
      setCart({ items: [], totalItems: 0, subtotal: 0 });
    } finally {
      setLoading(false);
    }
  }, [user, API_URL, getToken]);

  // Fetch cart on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user, fetchCart]);

  // Add item to cart
  const addToCart = async (sku, qty, priceSnapshot) => {
    if (!user?.id) {
      throw new Error('Please login to add items to cart');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          userId: user.id,
          sku: sku,
          qty: qty,
          priceSnapshot: priceSnapshot
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add item to cart: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCart(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (sku, qty) => {
    if (!user?.id) {
      throw new Error('Please login to update cart');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/cart/items/${sku}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          userId: user.id,
          qty
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update cart item: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCart(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update cart item');
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (sku) => {
    if (!user?.id) {
      throw new Error('Please login to remove items from cart');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/cart/items/${sku}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to remove item from cart: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCart(data.data || { items: [], totalItems: 0, subtotal: 0 });
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to remove item from cart');
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user?.id) {
      throw new Error('Please login to clear cart');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/cart/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to clear cart: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCart({ items: [], totalItems: 0, subtotal: 0 });
        return true;
      } else {
        throw new Error(data.message || 'Failed to clear cart');
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart?.totalItems || 0;
  };

  // Get cart subtotal
  const getCartSubtotal = () => {
    return cart?.subtotal || 0;
  };

  // Check if item is in cart
  const isInCart = (sku) => {
    return cart?.items?.some(item => item.sku === sku) || false;
  };

  // Get item quantity in cart
  const getItemQuantity = (sku) => {
    const item = cart?.items?.find(item => item.sku === sku);
    return item?.qty || 0;
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartItemCount,
    getCartSubtotal,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};