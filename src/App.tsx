import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { Gallery } from "./pages/Gallery";
import { CartPage } from "./pages/CartPage";
import { AdminPage } from "./pages/Admin";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { imagesAPI, categoriesAPI, tagsAPI, ordersAPI } from "./services/api";
import { useAuth } from "./context/AuthContext";
import type { Image, CartItemWithCount, Category, Tag } from "./types";
import "./App.css";

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<CartItemWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  const { user, isAuthenticated, topUpBalance, logout, refreshUser } =
    useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [imagesRes, categoriesRes, tagsRes] = await Promise.all([
        imagesAPI.getAll(),
        categoriesAPI.getAll(),
        tagsAPI.getAll(),
      ]);

      setImages(imagesRes.data);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      setError(null);
    } catch (err) {
      console.error("Error loading images:", err);
      setError("Не вдалося завантажити зображення. Перевірте API.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const priceBounds = useMemo(() => {
    if (images.length === 0) return [0, 0] as [number, number];
    const prices = images.map((img) => img.price);
    return [Math.min(...prices), Math.max(...prices)] as [number, number];
  }, [images]);

  useEffect(() => {
    if (priceRange[1] === 0 && priceBounds[1] > 0) {
      setPriceRange([priceBounds[0], priceBounds[1]]);
    }
  }, [priceBounds, priceRange]);

  const filteredImages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const selectedTagNames = selectedTags
      .map((id) => tags.find((tag) => tag.id === id)?.name?.toLowerCase())
      .filter(Boolean) as string[];

    return images
      .filter((img) =>
        selectedCategories.length > 0
          ? selectedCategories.includes(img.categoryId)
          : true,
      )
      .filter((img) => img.price >= priceRange[0] && img.price <= priceRange[1])
      .filter((img) => (showFavorites ? favorites.includes(img.id) : true))
      .filter((img) => {
        if (selectedTagNames.length === 0) return true;
        const title = img.title?.toLowerCase() ?? "";
        const desc = img.description?.toLowerCase() ?? "";
        return selectedTagNames.some(
          (tag) => title.includes(tag) || desc.includes(tag),
        );
      })
      .filter((img) => {
        if (!term) return true;
        const title = img.title?.toLowerCase() ?? "";
        const desc = img.description?.toLowerCase() ?? "";
        return title.includes(term) || desc.includes(term);
      });
  }, [
    images,
    selectedCategories,
    selectedTags,
    priceRange,
    favorites,
    showFavorites,
    searchTerm,
    tags,
  ]);
  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId),
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleToggleFavorite = (imageId: string) => {
    if (favorites.includes(imageId)) {
      setFavorites(favorites.filter((id) => id !== imageId));
    } else {
      setFavorites([...favorites, imageId]);
    }
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleAddToCart = (image: Image) => {
    const existingItem = cartItems.find((item) => item.imageId === image.id);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.imageId === image.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCartItems([...cartItems, { imageId: image.id, image, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (imageId: string) => {
    setCartItems(cartItems.filter((item) => item.imageId !== imageId));
  };

  const handleQuantityChange = (imageId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(imageId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.imageId === imageId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const totalCartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const handleBuyNow = async (image: Image) => {
    if (!isAuthenticated) {
      alert("Потрібен логін для покупки");
      return;
    }
    if ((user?.balance ?? 0) < image.price) {
      alert("Недостатньо коштів. Поповніть баланс.");
      return;
    }

    try {
      await ordersAPI.buyImage(image.id);
      await refreshUser();
      setPurchasedIds((prev) =>
        prev.includes(image.id) ? prev : [...prev, image.id],
      );
      alert("Покупка успішна! Тепер доступне HQ-завантаження.");
    } catch (err) {
      console.error("Buy failed", err);
      alert("Не вдалося купити. Спробуйте пізніше.");
    }
  };

  return (
    <div className="app" data-theme={theme}>
      <Header
        cartCount={totalCartCount}
        favoritesCount={favorites.length}
        showFavorites={showFavorites}
        onToggleFavorites={() => setShowFavorites((v) => !v)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={handleCategoryToggle}
        currentUser={user}
        theme={theme}
        onToggleTheme={handleThemeToggle}
        onLogout={logout}
        onTopUp={() => topUpBalance(100)}
        isAuthenticated={isAuthenticated}
      />

      {error && <div className="error-message">{error}</div>}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Gallery
              images={filteredImages}
              categories={categories}
              tags={tags}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onClearCategories={() => setSelectedCategories([])}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              onClearTags={() => setSelectedTags([])}
              priceRange={priceRange}
              priceBounds={priceBounds}
              onPriceRangeChange={setPriceRange}
              favorites={favorites}
              showFavorites={showFavorites}
              onShowFavoritesChange={setShowFavorites}
              loading={loading}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              onBuyNow={handleBuyNow}
              purchasedIds={purchasedIds}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage
                items={cartItems}
                onRemove={handleRemoveFromCart}
                onQuantityChange={handleQuantityChange}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminPage
                categories={categories}
                tags={tags}
                onCreatedCategory={(cat) => setCategories([...categories, cat])}
                onCreatedTag={(tag) => setTags([...tags, tag])}
                onCreatedImage={(img) => setImages([...images, img])}
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
