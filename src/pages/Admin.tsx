import { useState } from "react";
import type { Category, Image, Tag } from "../types";
import {
  categoriesAPI,
  imagesAPI,
  tagsAPI,
  purchasesAPI,
} from "../services/api";

interface AdminPageProps {
  categories: Category[];
  tags: Tag[];
  onCreatedCategory: (cat: Category) => void;
  onCreatedTag: (tag: Tag) => void;
  onCreatedImage: (img: Image) => void;
}

export function AdminPage({
  categories,
  tags,
  onCreatedCategory,
  onCreatedTag,
  onCreatedImage,
}: AdminPageProps) {
  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");
  const [imagePayload, setImagePayload] = useState<Partial<Image>>({
    title: "",
    description: "",
    price: 0,
    watermarkedUrl: "",
    originalUrl: "",
    categoryId: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingTag, setSavingTag] = useState(false);
  const [savingImage, setSavingImage] = useState(false);

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name || savingCategory) return;
    setSavingCategory(true);
    setError(null);
    setMessage(null);
    try {
      const res = await categoriesAPI.create({ name });
      onCreatedCategory(res.data);
      setCategoryName("");
      setMessage("Category added");
    } catch (err) {
      console.error("Failed to create category", err);
      setError("Не вдалося створити категорію.");
    } finally {
      setSavingCategory(false);
    }
  };

  const submitTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = tagName.trim();
    if (!name || savingTag) return;
    setSavingTag(true);
    setError(null);
    setMessage(null);
    try {
      const res = await tagsAPI.create({ name });
      onCreatedTag(res.data);
      setTagName("");
      setMessage("Tag added");
    } catch (err) {
      console.error("Failed to create tag", err);
      setError("Не вдалося створити тег.");
    } finally {
      setSavingTag(false);
    }
  };

  const submitImage = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = (imagePayload.title ?? "").trim();
    const description = (imagePayload.description ?? "").trim();
    const watermarkedUrl = (imagePayload.watermarkedUrl ?? "").trim();
    const originalUrl = (imagePayload.originalUrl ?? "").trim();
    const categoryId = imagePayload.categoryId ?? "";
    const price = Number(imagePayload.price ?? 0);

    if (
      savingImage ||
      !categoryId ||
      !title ||
      !watermarkedUrl ||
      !originalUrl ||
      Number.isNaN(price)
    ) {
      setError("Заповніть обов’язкові поля для зображення.");
      return;
    }

    setSavingImage(true);
    setError(null);
    setMessage(null);
    try {
      const res = await imagesAPI.create({
        title,
        description,
        price,
        watermarkedUrl,
        originalUrl,
        categoryId,
      });
      onCreatedImage(res.data);
      setImagePayload({
        title: "",
        description: "",
        price: 0,
        watermarkedUrl: "",
        originalUrl: "",
        categoryId: "",
      });
      setMessage("Image added");
    } catch (err) {
      console.error("Failed to create image", err);
      setError("Не вдалося створити зображення.");
    } finally {
      setSavingImage(false);
    }
  };

  const exportPurchases = async () => {
    const res = await purchasesAPI.exportXlsx();
    const blob = new Blob([res.data], { type: "application/vnd.ms-excel" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "purchases.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p className="muted">Manage images, categories and tags.</p>
        </div>
        <button onClick={exportPurchases} className="secondary">
          Export purchases to XLSX
        </button>
      </header>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <section className="admin-grid">
        <div className="admin-card">
          <h3>Add category</h3>
          <form onSubmit={submitCategory} className="stack">
            <input
              type="text"
              placeholder="Category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <button
              type="submit"
              className="primary"
              disabled={savingCategory || !categoryName.trim()}
            >
              {savingCategory ? "Saving..." : "Save"}
            </button>
          </form>
          <ul className="mini-list">
            {categories.map((cat) => (
              <li key={cat.id}>{cat.name}</li>
            ))}
          </ul>
        </div>

        <div className="admin-card">
          <h3>Add tag</h3>
          <form onSubmit={submitTag} className="stack">
            <input
              type="text"
              placeholder="Tag name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
            <button
              type="submit"
              className="primary"
              disabled={savingTag || !tagName.trim()}
            >
              {savingTag ? "Saving..." : "Save"}
            </button>
          </form>
          <ul className="mini-list">
            {tags.map((tag) => (
              <li key={tag.id}>#{tag.name}</li>
            ))}
          </ul>
        </div>

        <div className="admin-card">
          <h3>Add image</h3>
          <form onSubmit={submitImage} className="stack">
            <input
              type="text"
              placeholder="Title"
              value={imagePayload.title ?? ""}
              onChange={(e) =>
                setImagePayload((p) => ({ ...p, title: e.target.value }))
              }
            />
            <textarea
              placeholder="Description"
              value={imagePayload.description ?? ""}
              onChange={(e) =>
                setImagePayload((p) => ({ ...p, description: e.target.value }))
              }
            />
            <input
              type="number"
              placeholder="Price"
              value={imagePayload.price ?? 0}
              onChange={(e) =>
                setImagePayload((p) => ({
                  ...p,
                  price: Number(e.target.value),
                }))
              }
            />
            <input
              type="url"
              placeholder="Watermarked URL"
              value={imagePayload.watermarkedUrl ?? ""}
              onChange={(e) =>
                setImagePayload((p) => ({
                  ...p,
                  watermarkedUrl: e.target.value,
                }))
              }
            />
            <input
              type="url"
              placeholder="Original URL"
              value={imagePayload.originalUrl ?? ""}
              onChange={(e) =>
                setImagePayload((p) => ({ ...p, originalUrl: e.target.value }))
              }
            />
            <select
              value={imagePayload.categoryId ?? ""}
              onChange={(e) =>
                setImagePayload((p) => ({ ...p, categoryId: e.target.value }))
              }
            >
              <option value="">Choose category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="primary"
              disabled={
                savingImage ||
                !(imagePayload.title ?? "").trim() ||
                !(imagePayload.watermarkedUrl ?? "").trim() ||
                !(imagePayload.originalUrl ?? "").trim() ||
                !(imagePayload.categoryId ?? "").trim() ||
                Number.isNaN(Number(imagePayload.price ?? 0))
              }
            >
              {savingImage ? "Saving..." : "Save image"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
