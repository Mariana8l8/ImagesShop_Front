import { useState } from "react";
import { Link } from "react-router-dom";
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
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

          <div className="header-search">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search images, styles, moods..."
            />
          </div>
        </div>

        <div className="header-actions">
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

          <button className="icon-pill" onClick={onToggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <div className="avatar">{currentUser?.name?.charAt(0) ?? "U"}</div>
        </div>
      </div>
    </header>
  );
}
