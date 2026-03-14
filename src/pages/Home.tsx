import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { CartModal } from '../components/CartModal';
import { supabase, Product, CartItem } from '../lib/supabase';
import { getSessionId } from '../lib/cart';

interface HomeProps {
  cartCount: number;
  onCartCountChange: (count: number) => void;
}

export function Home({ onCartCountChange }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<(CartItem & { products?: Product })[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const loadCart = async () => {
    const sessionId = getSessionId();
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('session_id', sessionId);

    if (!error && data) {
      setCartItems(data);
      onCartCountChange(data.reduce((sum, item) => sum + item.quantity, 0));
    }
  };

  const handleAddToCart = async (product: Product) => {
    const sessionId = getSessionId();

    const existingItem = cartItems.find(item => item.product_id === product.id);

    if (existingItem) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);

      if (!error) {
        loadCart();
      }
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          session_id: sessionId,
          product_id: product.id,
          quantity: 1,
        });

      if (!error) {
        loadCart();
      }
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
    <>
      <div className="hero">
        <div className="container">
          <h1>Welcome to VT Electrikon</h1>
          <p>
            Your trusted source for premium electrical products from Multispan and Sibass Electric Private Limited
          </p>
          <div className="contact-info">
            <Phone size={20} />
            <span>9326266563</span>
          </div>
        </div>
      </div>

      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Products</h2>
            <p>Browse our extensive collection of electrical products</p>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>Loading products...</div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <footer>
        <div className="container">
          <div className="footer-content">
            <p>VT Electrikon - Premium Electrical Products</p>
            <p>Authorized dealer for Multispan and Sibass Electric Private Limited</p>
            <p>Contact: 9326266563 for more information</p>
            <p>&copy; 2026 VT Electrikon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
