import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header>
      <div className="container">
        <div className="header-content">
          <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            <div className="logo">
              VT <span>Electrikon</span>
            </div>
          </Link>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/admin">Admin</Link>
            <button className="cart-btn" onClick={onCartClick}>
              <ShoppingCart size={20} />
              Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
