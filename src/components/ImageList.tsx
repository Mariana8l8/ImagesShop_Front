import { ImageCard } from "./ImageCard";
import type { Image } from "../types";

interface ImageListProps {
  images: Image[];
  loading: boolean;
  onAddToCart: (image: Image) => void;
  onRemoveFromCart: (imageId: string) => void;
  favorites: string[];
  onToggleFavorite: (imageId: string) => void;
  onBuyNow: (image: Image) => void;
  onView: (image: Image) => void;
  onDownload: (image: Image) => void;
  purchasedIds: string[];
  cartIds: string[];
}

export function ImageList({
  images,
  loading,
  onAddToCart,
  onRemoveFromCart,
  favorites,
  onToggleFavorite,
  onBuyNow,
  onView,
  onDownload,
  purchasedIds,
  cartIds,
}: ImageListProps) {
  if (loading) {
    return (
      <div className="loading">
        <p>Loading images...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="empty-state">
        <p>No images to display</p>
      </div>
    );
  }

  return (
    <div className="image-list">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          isFavorite={favorites.includes(image.id)}
          onToggleFavorite={onToggleFavorite}
          onBuyNow={onBuyNow}
          onView={onView}
          onDownload={onDownload}
          isPurchased={purchasedIds.includes(image.id)}
          isInCart={cartIds.includes(image.id)}
        />
      ))}
    </div>
  );
}
