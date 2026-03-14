# VT Electrikon - E-commerce Website

A full-featured e-commerce website for selling electrical products from Multispan and Sibass Electric Private Limited.

## Features

- Product catalog with real images from Pexels
- Shopping cart functionality
- Stock tracking (shows out of stock items)
- Checkout with multiple payment options (UPI, Card, Cash on Delivery)
- Order management system
- Admin panel for product and order management
- Payment settings configuration
- SEO optimized for Google search visibility
- Responsive design

## Technology Stack

- React + TypeScript
- Vite
- Supabase (Database & Authentication)
- React Router
- Lucide React (Icons)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. The Supabase database is already configured in `.env`

3. Run the development server (handled automatically by the system)

4. Build for production:
```bash
npm run build
```

## Admin Panel

Access the admin panel at `/admin`

1. Create an admin account by clicking "Create Account" on the login page
2. Use your email and password to login
3. Manage products, view orders, and configure payment settings

### Admin Features

- Add/Edit/Delete products
- Upload product images (use Pexels URLs)
- Manage stock quantities
- View all orders
- Configure UPI ID and bank account for payments

## Payment Methods

The checkout supports:
- UPI payments
- Card payments
- Cash on Delivery (COD)

Configure your payment details in Admin Panel > Settings

## SEO & Google Search Visibility

The website is optimized for search engines with:
- Meta tags for title, description, keywords
- Open Graph tags for social sharing
- Twitter Card tags
- Semantic HTML structure
- Descriptive content

To improve Google search visibility:
1. Submit your sitemap to Google Search Console
2. Create quality content and product descriptions
3. Get backlinks from relevant websites
4. Use Google My Business
5. Maintain active social media presence

## Getting a Free Domain

You can get a free domain from these providers:

1. **Freenom** (freenom.com)
   - Offers free domains: .tk, .ml, .ga, .cf, .gq
   - Free for 12 months, renewable

2. **InfinityFree** (infinityfree.net)
   - Free subdomain with hosting
   - No ads

3. **GitHub Pages**
   - Free subdomain: yourusername.github.io
   - Can connect custom domain

4. **Netlify**
   - Free subdomain: yoursite.netlify.app
   - Can connect custom domain

5. **Vercel**
   - Free subdomain: yoursite.vercel.app
   - Can connect custom domain

### Recommended Approach:

For a professional site, consider:
- Purchase a domain from Namecheap, GoDaddy, or Google Domains (₹500-1000/year)
- Use free hosting from Netlify or Vercel
- Connect your custom domain to the hosting

## Contact Information

For more information: 9326266563

## Database Schema

The application uses Supabase with the following tables:
- `products` - Product catalog
- `cart_items` - Shopping cart
- `orders` - Order records
- `order_items` - Order line items
- `admin_settings` - Payment configuration

## License

All rights reserved - VT Electrikon 2026