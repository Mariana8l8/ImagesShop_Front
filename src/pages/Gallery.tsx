import { ImageList } from "../components/ImageList";
import type { Image } from "../types";

interface GalleryProps {
  images: Image[];
  loading: boolean;
  onAddToCart: (image: Image) => void;
}

export function Gallery({ images, loading, onAddToCart }: GalleryProps) {
  return (
    <main className="gallery-page">
      <div className="gallery-header">
        <h1>📸 Image Gallery</h1>
        <p>Browse our collection of stunning images</p>
      </div>

      <ImageList images={images} loading={loading} onAddToCart={onAddToCart} />
    </main>
  );
}
