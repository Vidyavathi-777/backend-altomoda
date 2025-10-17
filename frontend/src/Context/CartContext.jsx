import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.item_id.$oid === product.item_id.$oid
      );
      if (existing) {
        return prev.map((item) =>
          item.item_id.$oid === product.item_id.$oid
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev.filter((item) => item.item_id.$oid !== id)
    );
  };

  const updateQty = (id, qty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.item_id.$oid === id ? { ...item, qty } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart,totalQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
