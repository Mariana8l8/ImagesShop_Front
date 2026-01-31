import { ImageList } from "../components/ImageList";
import type { Image, Category, Tag } from "../types";

interface GalleryProps {
  images: Image[];
  categories: Category[];
  tags: Tag[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  onClearCategories: () => void;
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  onClearTags: () => void;
  priceRange: [number, number];
  priceBounds: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  favorites: string[];
  showFavorites: boolean;
  onShowFavoritesChange: (show: boolean) => void;
  loading: boolean;
  onAddToCart: (image: Image) => void;
  onToggleFavorite: (imageId: string) => void;
}

export function Gallery({
  images,
  categories,
  tags,
  selectedCategories,
  onCategoryToggle,
  onClearCategories,
  selectedTags,
  onTagToggle,
  onClearTags,
  priceRange,
  priceBounds,
  onPriceRangeChange,
  favorites,
  showFavorites,
  onShowFavoritesChange,
  loading,
  onAddToCart,
  onToggleFavorite,
}: GalleryProps) {
  const [minPrice, maxPrice] = priceRange;
  const [minBound, maxBound] = priceBounds;

  const handleMinPriceChange = (value: number) => {
    const nextMin = Math.min(value, maxPrice);
    onPriceRangeChange([nextMin, maxPrice]);
  };

  const handleMaxPriceChange = (value: number) => {
    const nextMax = Math.max(value, minPrice);
    onPriceRangeChange([minPrice, nextMax]);
  };

  return (
    <main className="gallery-page">
      <section className="gallery-header">
        <div>
          <h1>Image Marketplace</h1>
          <p>Curated visuals for modern products and brands.</p>
        </div>
        <div className="result-meta">
          <span>{images.length} results</span>
          <span>{categories.length} categories</span>
          <span>{tags.length} tags</span>
        </div>
      </section>

      <section className="gallery-layout">
        <aside className="filters-panel">
          <div className="panel-section">
            <div className="section-header">
              <h3>Price range</h3>
            </div>
            <div className="price-slider">
              <div className="range-inputs">
                <input
                  type="range"
                  min={minBound}
                  max={maxBound}
                  value={minPrice}
                  onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                />
                <input
                  type="range"
                  min={minBound}
                  max={maxBound}
                  value={maxPrice}
                  onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                />
              </div>
              <div className="price-values">
                <span>${minPrice.toFixed(0)}</span>
                <span>${maxPrice.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <div className="section-header">
              <h3>Categories</h3>
              <div className="section-actions">
                <button className="text-link" onClick={onClearCategories}>
                  Clear
                </button>
                <button
                  className="text-link"
                  onClick={() => onClearCategories()}
                >
                  All
                </button>
              </div>
            </div>
            <div className="checkbox-group">
              {categories.map((cat) => (
                <label key={cat.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => onCategoryToggle(cat.id)}
                  />
                  <span className="checkmark" />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <div className="section-header">
              <h3>Tags</h3>
              <button className="text-link" onClick={onClearTags}>
                Clear
              </button>
            </div>
            <div className="tag-cloud">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  className={`tag-chip ${
                    selectedTags.includes(tag.id) ? "active" : ""
                  }`}
                  onClick={() => onTagToggle(tag.id)}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={showFavorites}
                onChange={(e) => onShowFavoritesChange(e.target.checked)}
              />
              <span className="checkmark" />
              Show favorites only ({favorites.length})
            </label>
          </div>
        </aside>

        <div className="grid-area">
          <ImageList
            images={images}
            loading={loading}
            onAddToCart={onAddToCart}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      </section>
    </main>
  );
}
