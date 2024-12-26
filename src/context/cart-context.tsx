// src/context/cart-context.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of a cart item
export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

// Define the shape of the cart context
interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  subtotal: 0,
});

// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Add item to cart
  const addToCart = (item: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        return [...prevItems, item];
      }
    });
  };

  // Remove item from cart
  const removeItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: quantity > 0 ? quantity : 1 } : item
      )
    );
  };

  // Clear the cart
  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeItem, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);
