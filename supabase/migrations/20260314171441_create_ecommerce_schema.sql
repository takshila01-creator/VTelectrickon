/*
  # VT Electrikon E-commerce Database Schema

  ## Overview
  Complete database schema for VT Electrikon e-commerce website with product management,
  shopping cart, orders, and admin panel functionality.

  ## New Tables

  ### 1. `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `brand` (text) - Brand name (Multispan or Sibass Electric)
  - `category` (text) - Product category
  - `price` (decimal) - Product price
  - `stock_quantity` (integer) - Available stock count
  - `image_url` (text) - Product image URL
  - `is_active` (boolean) - Whether product is visible on site
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `cart_items`
  - `id` (uuid, primary key) - Cart item identifier
  - `session_id` (text) - Anonymous session ID for non-logged users
  - `product_id` (uuid) - Reference to products table
  - `quantity` (integer) - Quantity in cart
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `orders`
  - `id` (uuid, primary key) - Order identifier
  - `order_number` (text, unique) - Human-readable order number
  - `customer_name` (text) - Customer full name
  - `customer_email` (text) - Customer email
  - `customer_phone` (text) - Customer phone number
  - `delivery_address` (text) - Full delivery address
  - `payment_method` (text) - UPI, COD, or CARD
  - `payment_status` (text) - pending, completed, failed
  - `order_status` (text) - placed, processing, shipped, delivered, cancelled
  - `total_amount` (decimal) - Total order amount
  - `created_at` (timestamptz) - Order placement timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `order_items`
  - `id` (uuid, primary key) - Order item identifier
  - `order_id` (uuid) - Reference to orders table
  - `product_id` (uuid) - Reference to products table
  - `product_name` (text) - Product name at time of order
  - `quantity` (integer) - Quantity ordered
  - `price` (decimal) - Price at time of order
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. `admin_settings`
  - `id` (uuid, primary key) - Settings identifier
  - `upi_id` (text) - UPI ID for payments
  - `account_number` (text) - Bank account number for card payments
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Public read access for products (active only)
  - Public insert/update access for cart and orders
  - Admin-only access for admin_settings and product management
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  brand text NOT NULL,
  category text DEFAULT '',
  price decimal(10, 2) NOT NULL,
  stock_quantity integer DEFAULT 0,
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'placed',
  total_amount decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL,
  price decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id text DEFAULT '',
  account_number text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Products policies (public read for active products)
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Cart items policies (public access for shopping)
CREATE POLICY "Anyone can view their cart"
  ON cart_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can add to cart"
  ON cart_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update cart"
  ON cart_items FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete from cart"
  ON cart_items FOR DELETE
  TO public
  USING (true);

-- Orders policies (public can create, admins can view all)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Order items policies
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

-- Admin settings policies (authenticated only)
CREATE POLICY "Admins can view settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert settings"
  ON admin_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial admin settings
INSERT INTO admin_settings (upi_id, account_number)
VALUES ('', '')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, brand, category, price, stock_quantity, image_url, is_active)
VALUES 
  ('Modular Switch 1-Way', 'High quality 1-way modular switch with elegant design and long-lasting durability', 'Multispan', 'Switches', 45.00, 150, 'https://images.pexels.com/photos/5835359/pexels-photo-5835359.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('LED Bulb 9W', 'Energy efficient 9W LED bulb with warm white light, 900 lumens output', 'Sibass Electric', 'Lighting', 120.00, 200, 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('3-Pin Socket 16A', 'Heavy duty 3-pin socket rated for 16A with child safety shutters', 'Multispan', 'Sockets', 85.00, 100, 'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('Ceiling Fan 1200mm', 'High speed ceiling fan with decorative design and energy-efficient motor', 'Sibass Electric', 'Fans', 1850.00, 45, 'https://images.pexels.com/photos/280193/pexels-photo-280193.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('MCB 32A Single Pole', 'Miniature circuit breaker 32A single pole with quick trip mechanism', 'Multispan', 'Circuit Protection', 180.00, 80, 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('Extension Board 4-Way', '4-way extension board with individual switches and surge protection', 'Sibass Electric', 'Extension Boards', 320.00, 60, 'https://images.pexels.com/photos/4792285/pexels-photo-4792285.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('Copper Wire 1.5 sqmm', 'Premium quality copper wire 1.5 sqmm for domestic wiring', 'Multispan', 'Wires & Cables', 450.00, 120, 'https://images.pexels.com/photos/5835361/pexels-photo-5835361.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('Door Bell Transformer', 'Electronic door bell transformer with melodious chime options', 'Sibass Electric', 'Door Bells', 280.00, 75, 'https://images.pexels.com/photos/277593/pexels-photo-277593.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('LED Panel Light 18W', 'Slim LED panel light 18W square for modern ceiling installation', 'Multispan', 'Lighting', 680.00, 90, 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800', true),
  ('Regulator Dimmer', 'Electronic fan regulator with dimmer control and indicator light', 'Sibass Electric', 'Regulators', 165.00, 110, 'https://images.pexels.com/photos/5691603/pexels-photo-5691603.jpeg?auto=compress&cs=tinysrgb&w=800', true)
ON CONFLICT DO NOTHING;
