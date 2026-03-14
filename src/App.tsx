import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { CartModal } from './components/CartModal';
import { Home } from './pages/Home';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';
import { supabase, CartItem } from './lib/supabase';
import { getSessionId } from './lib/cart';
import './App.css';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<(CartItem & { products?: any })[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const sessionId = getSessionId();
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('session_id', sessionId);

    if (!error && data) {
      setCartItems(data);
      setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (!error) {
      loadCart();
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      loadCart();
    }
  };

  return (
    <Router>
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />
      <Routes>
        <Route
          path="/"
          element={<Home cartCount={cartCount} onCartCountChange={setCartCount} />}
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </Router>
  );
}

export default App;
