import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const addToCart = useCallback((name, price) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (existing) return prev.map((i) => (i.name === name ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { name, price, qty: 1 }];
    });
    setToast({ id: Date.now(), message: `ADDED: ${name}` });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const updateQty = useCallback((name, delta) => {
    setItems((prev) =>
      prev.map((i) => (i.name === name ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0),
    );
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const total = items.reduce((n, i) => n + i.qty * i.price, 0);
    return { items, count, total, addToCart, updateQty, toast };
  }, [items, addToCart, updateQty, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
