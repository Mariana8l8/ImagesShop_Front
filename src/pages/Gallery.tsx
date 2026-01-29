import { ImageList } from "../components/ImageList";
import type { Image, Category, Tag, User } from "../types";

interface GalleryProps {
  images: Image[];
  categories: Category[];
  tags: Tag[];
  currentUser: User | null;
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  loading: boolean;
  onAddToCart: (image: Image) => void;
}

export function Gallery({
  images,
  categories,
  tags,
  currentUser,
  selectedCategoryId,
  onCategoryChange,
  loading,
  onAddToCart,
}: GalleryProps) {
  return (
    <main className="gallery-page">
      <div className="gallery-header">
        <div>
          <h1>📸 Image Gallery</h1>
          <p>Browse our collection of stunning images</p>
        </div>

        {currentUser && (
          <div className="user-card">
            <div className="user-row">
              <span className="label">User</span>
              <span className="value">{currentUser.name}</span>
            </div>
            <div className="user-row">
              <span className="label">Email</span>
              <span className="value">{currentUser.email}</span>
            </div>
            <div className="user-row">
              <span className="label">Balance</span>
              <span className="value">${currentUser.balance.toFixed(2)}</span>
            </div>
            <div className="user-row">
              <span className="label">Wishlist</span>
              <span className="value">
                {(currentUser.wishlistIds ?? []).length} items
              </span>
            </div>
          </div>
        )}
      </div>

      <section className="filters">
        <div className="filter-group">
          <h3>Categories</h3>
          <div className="chips">
            <button
              className={`chip ${selectedCategoryId === null ? "active" : ""}`}
              onClick={() => onCategoryChange(null)}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`chip ${selectedCategoryId === cat.id ? "active" : ""}`}
                onClick={() => onCategoryChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>Tags</h3>
          <div className="chips tags">
            {tags.map((tag) => (
              <span key={tag.id} className="chip ghost">
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ImageList images={images} loading={loading} onAddToCart={onAddToCart} />
    </main>
  );
}
