import { useState, useEffect, useMemo, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { Gallery } from "./pages/Gallery";
import { CartPage } from "./pages/CartPage";
import { AdminPage } from "./pages/Admin";
import { AdminEditPicturesPage } from "./pages/AdminEditPictures";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { TopUpPage } from "./pages/TopUp";
import { ProfilePage } from "./pages/Profile";
import { ProtectedRoute } from "./components/ProtectedRoute";
import {
  imagesAPI,
  categoriesAPI,
  tagsAPI,
  ordersAPI,
  cartAPI,
  purchasesAPI,
} from "./services/api";
import { useAuth } from "./context/AuthContext";
import { useNotifications } from "./context/NotificationContext";
import type {
  Image,
  CartItemWithCount,
  Category,
  Tag,
  CartItemResponse,
  CartResponse,
} from "./types";
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
  const [viewImage, setViewImage] = useState<Image | null>(null);
  const [buyImage, setBuyImage] = useState<Image | null>(null);
  const [downloadImage, setDownloadImage] = useState<Image | null>(null);
  const [downloadPngLoading, setDownloadPngLoading] = useState(false);
  const [downloadPngError, setDownloadPngError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const { user, isAuthenticated, topUpBalance, logout, refreshUser } =
    useAuth();
  const { notify } = useNotifications();

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
      setError("Failed to load images. Check the API.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeCartItems = useCallback(
    (data: CartResponse): CartItemWithCount[] => {
      const rawItems = Array.isArray(data)
        ? data
        : data && "items" in data && Array.isArray(data.items)
          ? data.items
          : [];

      return rawItems
        .map((item) => {
          if (typeof item === "string") {
            const image = images.find((img) => img.id === item);
            if (!image) return null;
            return { imageId: item, image, quantity: 1 } as CartItemWithCount;
          }
          const typed = item as CartItemResponse;
          const imageId = typed.imageId ?? typed.image?.id;
          if (!imageId) return null;
          const image = typed.image ?? images.find((img) => img.id === imageId);
          if (!image) return null;
          const quantity =
            typeof typed.quantity === "number" && typed.quantity > 0
              ? typed.quantity
              : 1;
          return { imageId, image, quantity } as CartItemWithCount;
        })
        .filter(Boolean) as CartItemWithCount[];
    },
    [images],
  );

  const loadCart = useCallback(async () => {
    try {
      const res = await cartAPI.get();
      setCartItems(normalizeCartItems(res.data));
    } catch (err) {
      console.error("Failed to load cart", err);
    }
  }, [normalizeCartItems]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    if (images.length === 0) return;
    loadCart();
  }, [isAuthenticated, images, loadCart]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPurchasedIds([]);
      return;
    }

    if (user.role === 1) {
      try {
        const key = `ImagesShop_admin_purchases_${user.id}`;
        const stored = sessionStorage.getItem(key);
        const parsed = stored ? (JSON.parse(stored) as string[]) : [];
        setPurchasedIds(Array.isArray(parsed) ? parsed : []);
      } catch {
        setPurchasedIds([]);
      }
      return;
    }

    if (!user.email) return;

    purchasesAPI
      .getAll()
      .then((res) => {
        const ids = res.data
          .filter(
            (p) => p.userEmail?.toLowerCase() === user.email?.toLowerCase(),
          )
          .map((p) => p.imageId);
        setPurchasedIds(ids);
      })
      .catch((err) => {
        console.error("Failed to load purchases", err);
      });
  }, [isAuthenticated, user]);

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
    if (!isAuthenticated) {
      notify("Please sign in to add to favorites", {
        type: "warning",
      });
      return;
    }
    if (favorites.includes(imageId)) {
      setFavorites(favorites.filter((id) => id !== imageId));
    } else {
      setFavorites([...favorites, imageId]);
    }
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleAddToCart = async (image: Image) => {
    if (!isAuthenticated) {
      notify("Please sign in to add to cart", {
        type: "warning",
      });
      return;
    }
    if (purchasedIds.includes(image.id)) {
      notify("This image is already purchased. Download is available.", {
        type: "info",
      });
      return;
    }

    const existingItem = cartItems.find((item) => item.imageId === image.id);
    try {
      await cartAPI.addItem(image.id);
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
    } catch (err) {
      console.error("Failed to add to cart", err);
      notify("Failed to add to cart. Please try again.", {
        type: "error",
      });
    }
  };

  const handleRemoveFromCart = async (imageId: string) => {
    try {
      await cartAPI.removeItem(imageId);
    } catch (err) {
      console.error("Failed to remove from cart", err);
    } finally {
      setCartItems(cartItems.filter((item) => item.imageId !== imageId));
    }
  };

  const handleQuantityChange = async (imageId: string, quantity: number) => {
    const current = cartItems.find((item) => item.imageId === imageId);
    if (!current) return;

    if (quantity <= 0) {
      await handleRemoveFromCart(imageId);
      return;
    }

    if (quantity > current.quantity) {
      try {
        await cartAPI.addItem(imageId);
        setCartItems(
          cartItems.map((item) =>
            item.imageId === imageId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } catch (err) {
        console.error("Failed to increase cart quantity", err);
      }
      return;
    }

    try {
      await cartAPI.removeItem(imageId);
      setCartItems(
        cartItems.map((item) =>
          item.imageId === imageId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item,
        ),
      );
    } catch (err) {
      console.error("Failed to decrease cart quantity", err);
    }
  };

  const totalCartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const handleBuyNow = async (image: Image) => {
    if (!isAuthenticated) {
      notify("Please sign in to buy an image", {
        type: "warning",
      });
      return;
    }
    setBuyImage(image);
    setPurchaseError(null);
  };

  const handleConfirmPurchase = async () => {
    if (!buyImage) return;
    if (!isAuthenticated) {
      setPurchaseError("You need to sign in to complete the purchase");
      return;
    }

    if ((user?.balance ?? 0) < buyImage.price) {
      setPurchaseError("Insufficient funds. Top up your balance.");
      return;
    }

    try {
      setPurchaseLoading(true);
      setPurchaseError(null);
      if (user?.role === 1) {
        const nextIds = purchasedIds.includes(buyImage.id)
          ? purchasedIds
          : [...purchasedIds, buyImage.id];
        setPurchasedIds(nextIds);
        try {
          const key = `ImagesShop_admin_purchases_${user.id}`;
          sessionStorage.setItem(key, JSON.stringify(nextIds));
        } catch {
          /* ignore */
        }
        try {
          const balanceKey = `ImagesShop_fake_balance_${user.id}`;
          const nextBalance = Math.max(0, (user.balance ?? 0) - buyImage.price);
          sessionStorage.setItem(balanceKey, String(nextBalance));
        } catch {
          /* ignore */
        }
        await refreshUser();
      } else {
        await ordersAPI.buyImage(buyImage.id);
        await refreshUser();
        setPurchasedIds((prev) =>
          prev.includes(buyImage.id) ? prev : [...prev, buyImage.id],
        );
      }
      setBuyImage(null);
      setDownloadImage(buyImage);
    } catch (err) {
      console.error("Buy failed", err);
      setPurchaseError("Purchase failed. Please try again later.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleOpenView = (image: Image) => {
    setViewImage(image);
  };

  const handleOpenDownload = (image: Image) => {
    setDownloadImage(image);
  };

  const sanitizeFilename = (value: string) =>
    value
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .slice(0, 80);

  const handleDownloadAsPng = async () => {
    if (!downloadImage?.originalUrl) return;

    setDownloadPngError(null);
    setDownloadPngLoading(true);

    try {
      const res = await fetch(downloadImage.originalUrl, {
        mode: "cors",
        credentials: "omit",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch image");
      }

      const sourceBlob = await res.blob();
      const sourceUrl = URL.createObjectURL(sourceBlob);
      const img = new Image();

      const decoded = await new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to decode image"));
        img.src = sourceUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = decoded.naturalWidth || decoded.width;
      canvas.height = decoded.naturalHeight || decoded.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported");
      ctx.drawImage(decoded, 0, 0);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (!b) reject(new Error("Failed to export PNG"));
            else resolve(b);
          },
          "image/png",
          1,
        );
      });

      const filenameBase = sanitizeFilename(downloadImage.title ?? "image");
      const filename = `${filenameBase || "image"}.png`;
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(pngUrl);
      URL.revokeObjectURL(sourceUrl);
    } catch (err) {
      console.error("Download PNG failed", err);
      setDownloadPngError("Failed to download PNG. Please try again.");
    } finally {
      setDownloadPngLoading(false);
    }
  };

  const handlePurchasedFromCart = (imageIds: string[]) => {
    if (!user || imageIds.length === 0) return;
    const unique = Array.from(new Set(imageIds));

    if (user.role === 1) {
      try {
        const key = `ImagesShop_admin_purchases_${user.id}`;
        const stored = sessionStorage.getItem(key);
        const parsed = stored ? (JSON.parse(stored) as string[]) : [];
        const merged = Array.from(
          new Set([...(Array.isArray(parsed) ? parsed : []), ...unique]),
        );
        sessionStorage.setItem(key, JSON.stringify(merged));
      } catch {
        /* ignore */
      }
    }

    setPurchasedIds((prev) => Array.from(new Set([...prev, ...unique])));
  };

  return (
    <>
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
          isAuthenticated={isAuthenticated}
        />

        {error && <div className="error-message">{error}</div>}

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              isAuthenticated && user?.role === 1 ? (
                <Navigate to="/admin" replace />
              ) : (
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
                  onRemoveFromCart={handleRemoveFromCart}
                  onToggleFavorite={handleToggleFavorite}
                  onBuyNow={handleBuyNow}
                  onView={handleOpenView}
                  onDownload={handleOpenDownload}
                  purchasedIds={purchasedIds}
                  cartIds={cartItems.map((item) => item.imageId)}
                />
              )
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
                  onClear={() => setCartItems([])}
                  onPurchased={handlePurchasedFromCart}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topup"
            element={
              <ProtectedRoute>
                <TopUpPage onTopUp={topUpBalance} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
                  onCreatedCategory={(category) =>
                    setCategories((prev) => [...prev, category])
                  }
                  onCreatedTag={(tag) => setTags((prev) => [...prev, tag])}
                  onCreatedImage={(img) => setImages((prev) => [...prev, img])}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-pictures"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminEditPicturesPage
                  images={images}
                  onUpdatedImage={(img) =>
                    setImages((prev) =>
                      prev.map((p) => (p.id === img.id ? img : p)),
                    )
                  }
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {viewImage && (
        <div className="modal-overlay" onClick={() => setViewImage(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewImage(null)}>
              ✕
            </button>
            <div className="modal-body">
              <div className="modal-media">
                <img
                  src={
                    purchasedIds.includes(viewImage.id)
                      ? (viewImage.originalUrl ??
                        viewImage.watermarkedUrl ??
                        "")
                      : (viewImage.watermarkedUrl ?? "")
                  }
                  alt={viewImage.title ?? "Image"}
                />
              </div>
              <div className="modal-info">
                <h2>{viewImage.title ?? "Untitled"}</h2>
                <p className="muted">{viewImage.description ?? ""}</p>
                <div className="modal-price">${viewImage.price.toFixed(2)}</div>
                {purchasedIds.includes(viewImage.id) &&
                  viewImage.originalUrl && (
                    <a
                      className="primary"
                      href={viewImage.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download original
                    </a>
                  )}
                {purchasedIds.includes(viewImage.id) && (
                  <button
                    className="ghost-btn"
                    onClick={() => handleOpenDownload(viewImage)}
                  >
                    Open download window
                  </button>
                )}
                {!purchasedIds.includes(viewImage.id) && (
                  <p className="notice">
                    Original is available after purchase.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {downloadImage && (
        <div className="modal-overlay" onClick={() => setDownloadImage(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setDownloadImage(null)}
            >
              ✕
            </button>
            <div className="modal-body">
              <div className="modal-media">
                <img
                  src={downloadImage.watermarkedUrl ?? ""}
                  alt={downloadImage.title ?? "Image"}
                />
              </div>
              <div className="modal-info">
                <h2>{downloadImage.title ?? "Untitled"}</h2>
                <p className="muted">{downloadImage.description ?? ""}</p>
                <div className="modal-price">
                  ${downloadImage.price.toFixed(2)}
                </div>
                {downloadPngError && (
                  <div className="field-error">{downloadPngError}</div>
                )}
                {downloadImage.originalUrl ? (
                  <button
                    className="primary"
                    onClick={handleDownloadAsPng}
                    disabled={downloadPngLoading}
                  >
                    {downloadPngLoading ? "Downloading..." : "Download PNG"}
                  </button>
                ) : (
                  <p className="notice">
                    Original is not available for download yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {buyImage && (
        <div className="modal-overlay" onClick={() => setBuyImage(null)}>
          <div className="modal drawer" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setBuyImage(null)}>
              ✕
            </button>
            <div className="modal-body">
              <div className="modal-media">
                <img
                  src={buyImage.watermarkedUrl ?? ""}
                  alt={buyImage.title ?? "Image"}
                />
              </div>
              <div className="modal-info">
                <h2>Payment</h2>
                <p className="muted">{buyImage.title ?? "Untitled"}</p>
                <div className="modal-price">
                  Amount due: ${buyImage.price.toFixed(2)}
                </div>
                {purchaseError && (
                  <div className="field-error">{purchaseError}</div>
                )}
                <button
                  className="primary"
                  onClick={handleConfirmPurchase}
                  disabled={purchaseLoading}
                >
                  {purchaseLoading ? "Processing..." : "Confirm payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
