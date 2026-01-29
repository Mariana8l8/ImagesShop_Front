import { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Gallery } from "./pages/Gallery";
import { CartPage } from "./pages/CartPage";
import { imagesAPI, categoriesAPI, tagsAPI, usersAPI } from "./services/api";
import type { Image, CartItemWithCount, Category, Tag, User } from "./types";
import "./App.css";

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [cartItems, setCartItems] = useState<CartItemWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [imagesRes, categoriesRes, tagsRes, usersRes] = await Promise.all([
        imagesAPI.getAll(),
        categoriesAPI.getAll(),
        tagsAPI.getAll(),
        usersAPI.getAll(),
      ]);

      setImages(imagesRes.data);
      setCategories(categoriesRes.data);
      setTags(tagsRes.data);
      setUsers(usersRes.data);
      setError(null);
    } catch (err) {
      console.error("Error loading images:", err);
      setError("Не вдалося завантажити зображення. Перевірте API.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = useMemo(() => {
    if (!selectedCategoryId) return images;
    return images.filter((img) => img.categoryId === selectedCategoryId);
  }, [images, selectedCategoryId]);

  const currentUser = users.length > 0 ? users[0] : null;

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

  return (
    <Router>
      <div className="app">
        <Header cartCount={totalCartCount} />

        {error && <div className="error-message">{error}</div>}

        <Routes>
          <Route
            path="/"
            element={
              <Gallery
                images={filteredImages}
                categories={categories}
                tags={tags}
                currentUser={currentUser}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={setSelectedCategoryId}
                loading={loading}
                onAddToCart={handleAddToCart}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                items={cartItems}
                onRemove={handleRemoveFromCart}
                onQuantityChange={handleQuantityChange}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
