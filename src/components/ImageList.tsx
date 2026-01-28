import { ImageCard } from "./ImageCard";
import type { Image } from "../types";

interface ImageListProps {
  images: Image[];
  loading: boolean;
  onAddToCart: (image: Image) => void;
}

export function ImageList({ images, loading, onAddToCart }: ImageListProps) {
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
        <ImageCard key={image.id} image={image} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
