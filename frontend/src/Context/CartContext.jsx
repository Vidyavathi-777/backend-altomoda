import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import { useUser } from "./UserContext.jsx";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, getToken } = useUser();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch user cart
  const fetchCart = useCallback(async () => {
    if (!user?.id) return setCart(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart/${user.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
        
      }
    } catch (err) {
      console.error("Fetch cart failed:", err);
      setError(err.message);
      

    } finally {
      setLoading(false);
    }
  }, [user, API_URL, getToken]);

  useEffect(() => {
    if (user?.id) fetchCart();
    else setCart(null);
  }, [user, fetchCart]);

  // Add item
  const addToCart = async (sku, qty, priceSnapshot) => {
    if (!user?.id) throw new Error("Login required");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ userId: user.id, sku, qty, priceSnapshot })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setCart(data.data);
      return data.data;
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateCartItem = async (sku, qty) => {
    if (!user?.id) throw new Error("Login required");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart/items/${sku}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ userId: user.id, qty })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setCart(data.data);
      return data.data;
    } finally {
      setLoading(false);
    }
  };

  // Remove item
  const removeFromCart = async (sku) => {
    if (!user?.id) throw new Error("Login required");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart/items/${sku}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setCart(data.data || { items: [], totalItems: 0, subtotal: 0 });
      return data.data;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user?.id) throw new Error("Login required");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        }
      });
      const data = await res.json();
      if (data.success) setCart({ items: [], totalItems: 0, subtotal: 0 });
    } finally {
      setLoading(false);
    }
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
    getCartItemCount: () => cart?.totalItems || 0,
    getCartSubtotal: () => cart?.subtotal || 0,
    isInCart: sku => cart?.items?.some(i => i.sku === sku) || false,
    getItemQuantity: sku => cart?.items?.find(i => i.sku === sku)?.qty || 0
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
