import { useState, useEffect } from 'react';
import { supabase, Product, Order, AdminSettings } from '../lib/supabase';
import { LogOut, Plus, Edit, Trash2 } from 'lucide-react';

export function Admin() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    brand: 'Multispan',
    category: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    is_active: true,
  });
  const [settingsForm, setSettingsForm] = useState({
    upi_id: '',
    account_number: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadProducts();
      loadOrders();
      loadSettings();
    }
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      alert('Signup failed: ' + error.message);
    } else {
      alert('Signup successful! You can now login.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setSettings(data);
      setSettingsForm({
        upi_id: data.upi_id || '',
        account_number: data.account_number || '',
      });
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      brand: 'Multispan',
      category: '',
      price: '',
      stock_quantity: '',
      image_url: '',
      is_active: true,
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url,
      is_active: product.is_active,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    const productData = {
      name: productForm.name,
      description: productForm.description,
      brand: productForm.brand,
      category: productForm.category,
      price: parseFloat(productForm.price),
      stock_quantity: parseInt(productForm.stock_quantity),
      image_url: productForm.image_url,
      is_active: productForm.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (!error) {
        loadProducts();
        setShowProductModal(false);
      }
    } else {
      const { error } = await supabase.from('products').insert(productData);

      if (!error) {
        loadProducts();
        setShowProductModal(false);
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (!error) {
        loadProducts();
      }
    }
  };

  const handleSaveSettings = async () => {
    if (settings) {
      const { error } = await supabase
        .from('admin_settings')
        .update({
          upi_id: settingsForm.upi_id,
          account_number: settingsForm.account_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (!error) {
        alert('Settings saved successfully!');
        loadSettings();
      }
    }
  };

  if (!session) {
    return (
      <div className="admin-login">
        <h1>Admin Login</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Login
          </button>
          <button
            type="button"
            onClick={handleSignup}
            className="login-btn"
            style={{ marginTop: '8px', background: '#6b7280' }}
          >
            Create Account
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            <button className="add-product-btn" onClick={handleAddProduct}>
              <Plus size={20} /> Add Product
            </button>
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img src={product.image_url} alt={product.name} />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.brand}</td>
                      <td>₹{product.price.toFixed(2)}</td>
                      <td>{product.stock_quantity}</td>
                      <td>{product.is_active ? 'Active' : 'Inactive'}</td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.customer_phone}</td>
                    <td>{order.payment_method}</td>
                    <td>₹{order.total_amount.toFixed(2)}</td>
                    <td>{order.order_status}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ maxWidth: '600px', background: 'white', padding: '32px', borderRadius: '12px' }}>
            <h2>Payment Settings</h2>
            <div className="form-group">
              <label>UPI ID</label>
              <input
                type="text"
                value={settingsForm.upi_id}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, upi_id: e.target.value })
                }
                placeholder="your-upi@bank"
              />
            </div>
            <div className="form-group">
              <label>Bank Account Number (for Card Payments)</label>
              <input
                type="text"
                value={settingsForm.account_number}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, account_number: e.target.value })
                }
                placeholder="Enter account number"
              />
            </div>
            <button className="save-btn" onClick={handleSaveSettings}>
              Save Settings
            </button>
          </div>
        )}
      </div>

      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Brand</label>
              <select
                value={productForm.brand}
                onChange={(e) =>
                  setProductForm({ ...productForm, brand: e.target.value })
                }
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
              >
                <option value="Multispan">Multispan</option>
                <option value="Sibass Electric">Sibass Electric</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                value={productForm.stock_quantity}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock_quantity: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Image URL (from Pexels)</label>
              <input
                type="text"
                value={productForm.image_url}
                onChange={(e) =>
                  setProductForm({ ...productForm, image_url: e.target.value })
                }
                placeholder="https://images.pexels.com/..."
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={productForm.is_active}
                  onChange={(e) =>
                    setProductForm({ ...productForm, is_active: e.target.checked })
                  }
                />
                Active (visible on website)
              </label>
            </div>
            <div className="modal-actions">
              <button className="save-btn" onClick={handleSaveProduct}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowProductModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
