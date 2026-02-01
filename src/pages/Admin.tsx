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

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    const res = await categoriesAPI.create({ id: "", name: categoryName });
    onCreatedCategory(res.data);
    setCategoryName("");
    setMessage("Category added");
  };

  const submitTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    const res = await tagsAPI.create({ id: "", name: tagName });
    onCreatedTag(res.data);
    setTagName("");
    setMessage("Tag added");
  };

  const submitImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePayload.categoryId) return;
    const res = await imagesAPI.create({
      id: "",
      title: imagePayload.title ?? "",
      description: imagePayload.description ?? "",
      price: Number(imagePayload.price ?? 0),
      watermarkedUrl: imagePayload.watermarkedUrl ?? "",
      originalUrl: imagePayload.originalUrl ?? "",
      categoryId: imagePayload.categoryId,
    });
    onCreatedImage(res.data);
    setMessage("Image added");
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
            <button type="submit" className="primary">
              Save
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
            <button type="submit" className="primary">
              Save
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
            <button type="submit" className="primary">
              Save image
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
