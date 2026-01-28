import { useState } from "react";
import type { Image } from "../types";

interface ImageCardProps {
  image: Image;
  onAddToCart: (image: Image) => void;
}

export function ImageCard({ image, onAddToCart }: ImageCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = () => {
    onAddToCart(image);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="image-card">
      <div className="image-preview">
        <img src={image.watermarkedUrl} alt={image.title} />
        <div className="overlay">
          <button className="quick-view">Quick View</button>
        </div>
        <div className="price-badge">${image.price}</div>
      </div>

      <div className="image-info">
        <h3>{image.title}</h3>
        <p className="description">{image.description}</p>

        <button
          className={`add-btn ${isAdded ? "added" : ""}`}
          onClick={handleClick}
        >
          {isAdded ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
