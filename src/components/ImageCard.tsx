import { useState } from "react";
import type { Image } from "../types";

interface ImageCardProps {
  image: Image;
  onAddToCart: (image: Image) => void;
  onRemoveFromCart: (imageId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (imageId: string) => void;
  onBuyNow: (image: Image) => void;
  onView: (image: Image) => void;
  onDownload: (image: Image) => void;
  isPurchased: boolean;
  isInCart: boolean;
}

export function ImageCard({
  image,
  onAddToCart,
  onRemoveFromCart,
  isFavorite,
  onToggleFavorite,
  onBuyNow,
  onView,
  onDownload,
  isPurchased,
  isInCart,
}: ImageCardProps) {
  const title = image.title ?? "Untitled";
  const description = image.description ?? "";
  const previewSrc = image.watermarkedUrl ?? image.originalUrl ?? "";
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(image);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleCartClick = () => {
    if (isInCart) {
      onRemoveFromCart(image.id);
      return;
    }
    handleAddToCart();
  };

  return (
    <div className="image-card">
      <div className="image-preview">
        <img src={previewSrc} alt={title} />
        <div className="card-top">
          <span className="pill soft">4K</span>
          <button
            className={`icon-btn ${isFavorite ? "active" : ""}`}
            onClick={() => onToggleFavorite(image.id)}
            aria-label="Toggle favorite"
          >
            {isFavorite ? "❤" : "♡"}
          </button>
        </div>
        <div className="card-overlay">
          <div className="price-chip">${image.price.toFixed(2)}</div>
          <div className="card-actions">
            <button className="ghost-btn" onClick={() => onView(image)}>
              View
            </button>
            <button
              className={`primary ${isPurchased ? "added" : ""}`}
              onClick={() => onBuyNow(image)}
              disabled={isPurchased}
            >
              {isPurchased ? "Purchased" : "Buy now"}
            </button>
            {isPurchased ? (
              <button
                className="download-icon-btn"
                onClick={() => onDownload(image)}
                aria-label="Download"
              >
                ⬇️
              </button>
            ) : (
              <button
                className={`cart-icon-btn ${isInCart ? "active" : ""} ${
                  isAdded ? "pulse" : ""
                }`}
                onClick={handleCartClick}
                aria-label={isInCart ? "In cart" : "Add to cart"}
              >
                🛒
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="image-info">
        <h3>{title}</h3>
        <p className="description">{description}</p>
      </div>
    </div>
  );
}
