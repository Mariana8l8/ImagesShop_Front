import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{
    title?: string;
    description?: string;
    price?: string;
    watermarkedUrl?: string;
    originalUrl?: string;
    categoryId?: string;
  }>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingTag, setSavingTag] = useState(false);
  const [savingImage, setSavingImage] = useState(false);

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value);
      return Boolean(url.protocol === "http:" || url.protocol === "https:");
    } catch {
      return false;
    }
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = categoryName.trim();
    setCategoryError(null);
    if (savingCategory) return;
    if (!name) {
      setCategoryError("Category name is required");
      return;
    }
    if (name.length < 2) {
      setCategoryError("Category name must be at least 2 characters");
      return;
    }
    const exists = categories.some(
      (cat) => cat.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      setCategoryError("Category already exists");
      return;
    }
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
      setError("Failed to create category.");
    } finally {
      setSavingCategory(false);
    }
  };

  const submitTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = tagName.trim();
    setTagError(null);
    if (savingTag) return;
    if (!name) {
      setTagError("Tag name is required");
      return;
    }
    if (name.length < 2) {
      setTagError("Tag name must be at least 2 characters");
      return;
    }
    const exists = tags.some(
      (tag) => tag.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      setTagError("Tag already exists");
      return;
    }
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
      setError("Failed to create tag.");
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

    if (savingImage) return;

    const nextErrors: typeof imageErrors = {};
    if (!title) nextErrors.title = "Title is required";
    if (title && title.length < 3) {
      nextErrors.title = "Title must be at least 3 characters";
    }
    if (description && description.length < 10) {
      nextErrors.description = "Description must be at least 10 characters";
    }
    if (!watermarkedUrl) {
      nextErrors.watermarkedUrl = "Watermarked URL is required";
    } else if (!isValidUrl(watermarkedUrl)) {
      nextErrors.watermarkedUrl = "Enter a valid URL";
    }
    if (!originalUrl) {
      nextErrors.originalUrl = "Original URL is required";
    } else if (!isValidUrl(originalUrl)) {
      nextErrors.originalUrl = "Enter a valid URL";
    }
    if (!categoryId) nextErrors.categoryId = "Choose a category";
    if (Number.isNaN(price)) {
      nextErrors.price = "Enter a valid price";
    } else if (price <= 0) {
      nextErrors.price = "Price must be greater than 0";
    }

    setImageErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Fill in the required image fields.");
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
      setImageErrors({});
      setMessage("Image added");
    } catch (err) {
      console.error("Failed to create image", err);
      setError("Failed to create image.");
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
        <div className="admin-header-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => navigate("/admin/edit-pictures")}
          >
            Edit existing pictures
          </button>
          <button onClick={exportPurchases} className="secondary">
            Export purchases to XLSX
          </button>
        </div>
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
            {categoryError && (
              <div className="field-error">{categoryError}</div>
            )}
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
            {tagError && <div className="field-error">{tagError}</div>}
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
            {imageErrors.title && (
              <div className="field-error">{imageErrors.title}</div>
            )}
            <textarea
              placeholder="Description"
              value={imagePayload.description ?? ""}
              onChange={(e) =>
                setImagePayload((p) => ({ ...p, description: e.target.value }))
              }
            />
            {imageErrors.description && (
              <div className="field-error">{imageErrors.description}</div>
            )}
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
            {imageErrors.price && (
              <div className="field-error">{imageErrors.price}</div>
            )}
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
            {imageErrors.watermarkedUrl && (
              <div className="field-error">{imageErrors.watermarkedUrl}</div>
            )}
            <input
              type="url"
              placeholder="Original URL"
              value={imagePayload.originalUrl ?? ""}
              onChange={(e) =>
                setImagePayload((p) => ({ ...p, originalUrl: e.target.value }))
              }
            />
            {imageErrors.originalUrl && (
              <div className="field-error">{imageErrors.originalUrl}</div>
            )}
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
            {imageErrors.categoryId && (
              <div className="field-error">{imageErrors.categoryId}</div>
            )}
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
