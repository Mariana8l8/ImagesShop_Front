import { useState } from "react";
import type { Image } from "../types";

interface ImageCardProps {
  image: Image;
  onAddToCart: (image: Image) => void;
  isFavorite: boolean;
  onToggleFavorite: (imageId: string) => void;
}

export function ImageCard({
  image,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}: ImageCardProps) {
  const title = image.title ?? "Untitled";
  const description = image.description ?? "";
  const previewSrc = image.watermarkedUrl ?? image.originalUrl ?? "";
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = () => {
    onAddToCart(image);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleView = () => {
    if (image.originalUrl) {
      window.open(image.originalUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="image-card">
      <div className="image-preview">
        <img src={previewSrc} alt={title} />
        <div className="card-top">
          <span className="pill soft">HD</span>
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
            <button className="ghost-btn" onClick={handleView}>
              View
            </button>
            <button
              className={`primary ${isAdded ? "added" : ""}`}
              onClick={handleClick}
            >
              {isAdded ? "Added" : "Buy now"}
            </button>
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
