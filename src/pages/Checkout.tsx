import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { supabase, CartItem, Product } from '../lib/supabase';
import { getSessionId, generateOrderNumber } from '../lib/cart';

export function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<(CartItem & { products?: Product })[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);

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
      if (data.length === 0) {
        navigate('/');
      }
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.products?.price || 0) * item.quantity;
  }, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData({
      ...formData,
      paymentMethod: method,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderNum = generateOrderNumber();

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNum,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentMethod === 'COD' ? 'pending' : 'pending',
        order_status: 'placed',
        total_amount: total,
      })
      .select()
      .single();

    if (!orderError && orderData) {
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.products?.name || '',
        quantity: item.quantity,
        price: item.products?.price || 0,
      }));

      await supabase.from('order_items').insert(orderItems);

      for (const item of cartItems) {
        if (item.products) {
          await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, item.products.stock_quantity - item.quantity) })
            .eq('id', item.product_id);
        }
      }

      const sessionId = getSessionId();
      await supabase.from('cart_items').delete().eq('session_id', sessionId);

      setOrderNumber(orderNum);
      setOrderPlaced(true);
    }

    setLoading(false);
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="success-message">
          <CheckCircle size={64} color="#059669" />
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your order. We will contact you soon.</p>
          <div className="order-number">Order Number: {orderNumber}</div>
          <p>For any queries, please contact: 9326266563</p>
          <button className="place-order-btn" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="order-summary">
        <h3>Order Summary</h3>
        {cartItems.map((item) => (
          <div key={item.id} className="summary-item">
            <span>{item.products?.name} x {item.quantity}</span>
            <span>₹{((item.products?.price || 0) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-total">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Delivery Address *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            placeholder="Enter your complete delivery address"
          />
        </div>

        <div className="form-group">
          <label>Payment Method *</label>
          <div className="payment-methods">
            <div
              className={`payment-method ${formData.paymentMethod === 'UPI' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodChange('UPI')}
            >
              UPI
            </div>
            <div
              className={`payment-method ${formData.paymentMethod === 'CARD' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodChange('CARD')}
            >
              Card
            </div>
            <div
              className={`payment-method ${formData.paymentMethod === 'COD' ? 'selected' : ''}`}
              onClick={() => handlePaymentMethodChange('COD')}
            >
              Cash on Delivery
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="place-order-btn"
          disabled={loading || !formData.paymentMethod}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
