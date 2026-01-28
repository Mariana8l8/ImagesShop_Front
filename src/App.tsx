import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Gallery } from "./pages/Gallery";
import { CartPage } from "./pages/CartPage";
import { imagesAPI } from "./services/api";
import type { Image, CartItemWithCount } from "./types";
import "./App.css";

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const [cartItems, setCartItems] = useState<CartItemWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await imagesAPI.getAll();
      setImages(response.data);
      setError(null);
    } catch (err) {
      console.error("Error loading images:", err);
      setError("Failed to load images");
      setImages([
        {
          id: "1",
          title: "Sunset by the Sea",
          description: "Beautiful seascape with sunset",
          price: 29.99,
          watermarkedUrl:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
          originalUrl:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
          categoryId: "1",
        },
        {
          id: "2",
          title: "Mountain Peaks",
          description: "Mountain range panorama in winter",
          price: 39.99,
          watermarkedUrl:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
          originalUrl:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
          categoryId: "1",
        },
        {
          id: "3",
          title: "Forest Nature",
          description: "Green trees and leaves on sunny day",
          price: 24.99,
          watermarkedUrl:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
          originalUrl:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
          categoryId: "2",
        },
        {
          id: "4",
          title: "City Landscape",
          description: "Skyscrapers in the city center at night",
          price: 34.99,
          watermarkedUrl:
            "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
          originalUrl:
            "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
          categoryId: "3",
        },
        {
          id: "5",
          title: "Beach Sand",
          description: "Beautiful beach with white sand",
          price: 19.99,
          watermarkedUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
          originalUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
          categoryId: "1",
        },
        {
          id: "6",
          title: "Cosmos and Stars",
          description: "Night sky with stars and milky way",
          price: 44.99,
          watermarkedUrl:
            "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a",
          originalUrl:
            "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a",
          categoryId: "2",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
                images={images}
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
