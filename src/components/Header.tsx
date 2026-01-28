import { Link } from "react-router-dom";

interface HeaderProps {
  cartCount: number;
}

export function Header({ cartCount }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <div className="logo">
            <h1>📸 ImageShop</h1>
          </div>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">
            Gallery
          </Link>
          <a href="#" className="nav-link">
            About
          </a>
          <a href="#" className="nav-link">
            Contact
          </a>
        </nav>

        <Link to="/cart" className="cart-link">
          <div className="cart-icon">
            <span>🛒</span>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </div>
        </Link>
      </div>
    </header>
  );
}
