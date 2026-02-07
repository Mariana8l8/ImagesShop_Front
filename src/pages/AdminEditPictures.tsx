import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Image } from "../types";
import { imagesAPI } from "../services/api";

interface AdminEditPicturesPageProps {
  images: Image[];
  onUpdatedImage: (img: Image) => void;
}

export function AdminEditPicturesPage({
  images,
  onUpdatedImage,
}: AdminEditPicturesPageProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editQuery, setEditQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Partial<Image>>>({});
  const [savingEdits, setSavingEdits] = useState<Record<string, boolean>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const filteredImages = useMemo(() => {
    const q = editQuery.trim().toLowerCase();
    if (!q) return images;
    return images.filter((img) => {
      const title = img.title?.toLowerCase() ?? "";
      const desc = img.description?.toLowerCase() ?? "";
      return (
        title.includes(q) ||
        desc.includes(q) ||
        img.id.toLowerCase().includes(q)
      );
    });
  }, [editQuery, images]);

  const setDraftField = (
    imageId: string,
    patch: Partial<Pick<Image, "title" | "description" | "price">>,
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [imageId]: { ...(prev[imageId] ?? {}), ...patch },
    }));
  };

  const cancelDraft = (imageId: string) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[imageId];
      return next;
    });
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[imageId];
      return next;
    });
  };

  const saveDraft = async (image: Image) => {
    const draft = drafts[image.id];
    if (!draft) return;
    if (savingEdits[image.id]) return;

    const nextTitle = (draft.title ?? image.title ?? "").trim();
    const nextDescription = (
      draft.description ??
      image.description ??
      ""
    ).trim();
    const nextPrice = Number(draft.price ?? image.price);

    if (!nextTitle) {
      setRowErrors((prev) => ({ ...prev, [image.id]: "Title is required" }));
      return;
    }
    if (nextTitle.length < 3) {
      setRowErrors((prev) => ({
        ...prev,
        [image.id]: "Title must be at least 3 characters",
      }));
      return;
    }
    if (nextDescription && nextDescription.length < 10) {
      setRowErrors((prev) => ({
        ...prev,
        [image.id]: "Description must be at least 10 characters",
      }));
      return;
    }
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      setRowErrors((prev) => ({
        ...prev,
        [image.id]: "Price must be greater than 0",
      }));
      return;
    }

    setSavingEdits((prev) => ({ ...prev, [image.id]: true }));
    setRowErrors((prev) => ({ ...prev, [image.id]: "" }));
    setError(null);
    setMessage(null);

    try {
      const payload: Image = {
        ...image,
        title: nextTitle,
        description: nextDescription,
        price: nextPrice,
      };
      const res = await imagesAPI.update(image.id, payload);
      const updated = (res?.data ?? payload) as Image;
      onUpdatedImage(updated);
      cancelDraft(image.id);
      setMessage("Image updated");
    } catch (err) {
      console.error("Failed to update image", err);
      setRowErrors((prev) => ({
        ...prev,
        [image.id]: "Failed to save changes.",
      }));
      setError("Failed to save some changes.");
    } finally {
      setSavingEdits((prev) => ({ ...prev, [image.id]: false }));
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Edit existing pictures</h1>
          <p className="muted">Change title, description and price.</p>
        </div>
        <div className="admin-header-actions">
          <Link
            to="/admin"
            className="secondary"
            style={{ textDecoration: "none" }}
          >
            ← Back to Admin
          </Link>
        </div>
      </header>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <section className="admin-grid">
        <div className="admin-card admin-card--wide">
          <h3>Pictures</h3>
          <div className="stack">
            <input
              type="text"
              placeholder="Search by title / description / id"
              value={editQuery}
              onChange={(e) => setEditQuery(e.target.value)}
            />
          </div>

          <div className="admin-edit-list">
            {filteredImages.length === 0 ? (
              <p className="muted">No images found.</p>
            ) : (
              filteredImages.map((img) => {
                const draft = drafts[img.id] ?? {};
                const isDirty = Boolean(drafts[img.id]);
                const saving = Boolean(savingEdits[img.id]);
                const rowError = rowErrors[img.id];
                const titleValue = String(draft.title ?? img.title ?? "");
                const descValue = String(
                  draft.description ?? img.description ?? "",
                );
                const priceValue = Number(draft.price ?? img.price);

                return (
                  <div key={img.id} className="admin-edit-row">
                    <img
                      className="admin-thumb"
                      src={img.watermarkedUrl ?? img.originalUrl ?? ""}
                      alt={img.title ?? "Image"}
                      loading="lazy"
                    />

                    <div className="admin-edit-fields">
                      <div className="admin-edit-meta">
                        <div className="admin-edit-id">{img.id}</div>
                      </div>
                      <input
                        type="text"
                        value={titleValue}
                        onChange={(e) =>
                          setDraftField(img.id, { title: e.target.value })
                        }
                        placeholder="Title"
                      />
                      <textarea
                        value={descValue}
                        onChange={(e) =>
                          setDraftField(img.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                      />
                      <div className="admin-edit-actions">
                        <input
                          type="number"
                          value={Number.isFinite(priceValue) ? priceValue : 0}
                          onChange={(e) =>
                            setDraftField(img.id, {
                              price: Number(e.target.value),
                            })
                          }
                          step="0.01"
                          min={0}
                          placeholder="Price"
                        />
                        <button
                          className="primary"
                          disabled={!isDirty || saving}
                          onClick={() => saveDraft(img)}
                          type="button"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="secondary"
                          disabled={!isDirty || saving}
                          onClick={() => cancelDraft(img.id)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                      {rowError ? (
                        <div className="field-error">{rowError}</div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
