'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export type CartItem = {
  id: string;  // Explicitly defined as string
  name: string;
  description: string;
  image: string;
  quantity: number;
  price: number;
};

export type PromoCode = {
  code: string;
  discount: number;
};

const VALID_PROMO_CODES: PromoCode[] = [
  { code: 'WELCOME10', discount: 10 },
  { code: 'SAVE20', discount: 20 },
];

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  applyPromoCode: (code: string) => void;
  removePromoCode: () => void;
  activePromoCode: PromoCode | null;
  total: number;
  isCartAnimating: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'elloria_cart';
const CART_EXPIRY_DAYS = 7;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const { items, expiryDate } = JSON.parse(savedCart);
        if (new Date().getTime() < expiryDate) {
          return items;
        }
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    }
    return [];
  });

  const [activePromoCode, setActivePromoCode] = useState<PromoCode | null>(null);
  const [isCartAnimating, setIsCartAnimating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CART_EXPIRY_DAYS);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items,
      expiryDate: expiryDate.getTime()
    }));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    console.log('Adding item to cart:', newItem);
    if (!newItem.price || isNaN(newItem.price)) {
      console.error('Invalid price for item:', newItem);
      return;
    }

    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: Math.min(99, item.quantity + newItem.quantity) }
            : item
        );
      }
      
      return [...currentItems, { ...newItem, quantity: Math.min(99, newItem.quantity) }];
    });

    setIsCartAnimating(true);
    setTimeout(() => setIsCartAnimating(false), 500);

    toast.success('Item added to cart', {
      description: `${newItem.quantity}x ${newItem.name} has been added to your cart`,
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    console.log('Updating quantity:', { id, quantity });
    if (quantity < 1 || quantity > 99) return;
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    console.log('Removing item:', id);
    setItems(currentItems => currentItems.filter(item => item.id !== id));
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    setItems([]);
    setActivePromoCode(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    toast.success('Cart cleared');
  };

  const applyPromoCode = (code: string) => {
    const promoCode = VALID_PROMO_CODES.find(
      promo => promo.code.toLowerCase() === code.toLowerCase()
    );

    if (promoCode) {
      setActivePromoCode(promoCode);
      toast.success('Promo code applied successfully!');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const removePromoCode = () => {
    setActivePromoCode(null);
    toast.success('Promo code removed');
  };

  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    return isNaN(itemTotal) ? sum : sum + itemTotal;
  }, 0);

  const total = activePromoCode
    ? subtotal * (1 - activePromoCode.discount / 100)
    : subtotal;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    total,
    applyPromoCode,
    removePromoCode,
    activePromoCode,
    isCartAnimating
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};