import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Category, User } from "../types";

interface HeaderProps {
  cartCount: number;
  favoritesCount: number;
  showFavorites: boolean;
  onToggleFavorites: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  currentUser: User | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
}

export function Header({
  cartCount,
  favoritesCount,
  showFavorites,
  onToggleFavorites,
  searchTerm,
  onSearchChange,
  categories,
  selectedCategories,
  onToggleCategory,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  isAuthenticated,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isTopUpPage = location.pathname === "/topup";
  const isAdminPage = location.pathname === "/admin";
  const { fakeTopUp } = useAuth();

  const handleFakeTopUp = (amt = 100) => {
    fakeTopUp?.(amt);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo-link">
            <div className="logo">
              <span className="logo-icon">▢</span>
              <h1>ImageShop</h1>
            </div>
          </Link>

          {!isLoginPage && !isTopUpPage && !isAdminPage && (
            <div className="header-search">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search images, styles, moods..."
              />
            </div>
          )}
        </div>

        <div className="header-actions">
          {!isLoginPage && !isTopUpPage && !isAdminPage && (
            <>
              <div className="dropdown">
                <button
                  className="dropdown-toggle"
                  onClick={() => setIsMenuOpen((v) => !v)}
                  aria-expanded={isMenuOpen}
                >
                  Categories
                </button>
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    {categories.map((cat) => (
                      <label key={cat.id} className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => onToggleCategory(cat.id)}
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                className={`icon-pill ${showFavorites ? "active" : ""}`}
                onClick={onToggleFavorites}
                aria-label="Toggle favorites"
              >
                ❤
                {favoritesCount > 0 && (
                  <span className="badge">{favoritesCount}</span>
                )}
              </button>

              <Link to="/cart" className="icon-pill" aria-label="Cart">
                🛒
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
            </>
          )}

          <button className="icon-pill" onClick={onToggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {isAuthenticated ? (
            <div className="user-block">
              <div className="balance">
                <span className="balance-label">Balance</span>
                <span className="balance-amount">
                  ${currentUser?.balance?.toFixed(0) ?? 0}
                </span>
              </div>
              {!isTopUpPage && currentUser?.role === 1 ? (
                <button
                  type="button"
                  className="pill-button"
                  onClick={() => handleFakeTopUp(100)}
                >
                  Add $100
                </button>
              ) : (
                !isTopUpPage && (
                  <Link to="/topup" className="pill-button">
                    Top up
                  </Link>
                )
              )}
              {currentUser?.role === 1 && !isAdminPage && (
                <Link to="/admin" className="text-link">
                  Admin
                </Link>
              )}
              {!isTopUpPage && (
                <button className="text-link" onClick={onLogout}>
                  Logout
                </button>
              )}
              <div className="avatar">
                {currentUser?.name?.charAt(0) ?? currentUser?.email?.[0] ?? "U"}
              </div>
            </div>
          ) : (
            !isLoginPage && (
              <Link to="/login" className="text-link">
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
