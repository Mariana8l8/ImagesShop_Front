import { useState } from "react";
import { Link } from "react-router-dom";
import { ordersAPI, cartAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import type { CartItemWithCount } from "../types";

interface CartPageProps {
  items: CartItemWithCount[];
  onRemove: (imageId: string) => void | Promise<void>;
  onQuantityChange: (imageId: string, quantity: number) => void | Promise<void>;
  onClear: () => void;
  onPurchased?: (imageIds: string[]) => void;
}

export function CartPage({
  items,
  onRemove,
  onQuantityChange,
  onClear,
  onPurchased,
}: CartPageProps) {
  const { user, refreshUser } = useAuth();
  const { notify } = useNotifications();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const total = items.reduce(
    (sum, item) => sum + item.image.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    setCheckoutError(null);
    if (items.length === 0) return;

    const userId = user?.id;
    if (!userId) {
      setCheckoutError("Please sign in to complete the purchase");
      return;
    }

    const balance = user?.balance ?? 0;
    if (balance < total) {
      setCheckoutError(
        `Insufficient funds. Required $${total.toFixed(2)}, balance $${balance.toFixed(2)}.`,
      );
      return;
    }

    setCheckoutLoading(true);
    try {
      const purchasedImageIds: string[] = [];

      if (user.role === 1) {
        try {
          const key = `ImagesShop_admin_purchases_${user.id}`;
          const stored = sessionStorage.getItem(key);
          const parsed = stored ? (JSON.parse(stored) as string[]) : [];
          const next = Array.from(
            new Set([
              ...(Array.isArray(parsed) ? parsed : []),
              ...items.map((i) => i.imageId),
            ]),
          );
          sessionStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }

        try {
          const balanceKey = `ImagesShop_fake_balance_${user.id}`;
          const nextBalance = Math.max(0, balance - total);
          sessionStorage.setItem(balanceKey, String(nextBalance));
        } catch {
          /* ignore */
        }

        purchasedImageIds.push(...items.map((i) => i.imageId));
      } else {
        for (const item of items) {
          const qty = Math.max(1, item.quantity);
          for (let i = 0; i < qty; i += 1) {
            await ordersAPI.buyImage(item.imageId);
          }
          purchasedImageIds.push(item.imageId);
        }
      }

      try {
        await cartAPI.clear();
      } catch (err) {
        console.warn("Failed to clear cart", err);
      }
      onClear();

      await refreshUser();
      onPurchased?.(purchasedImageIds);
      notify(`Purchased! Amount: $${total.toFixed(2)}`, {
        type: "success",
        title: "Order completed",
      });
    } catch (err) {
      console.error("Checkout failed:", err);
      setCheckoutError("Failed to complete purchase. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await cartAPI.clear();
    } catch (err) {
      console.warn("Failed to clear cart", err);
    } finally {
      onClear();
    }
  };

  return (
    <main className="cart-page">
      <div className="cart-header-section">
        <h1>🛒 Shopping Cart</h1>
        <Link to="/" className="back-link">
          ← Back to Gallery
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-section">
            {items.map((item) => (
              <div key={item.imageId} className="cart-item-card">
                <img
                  src={
                    item.image.watermarkedUrl ?? item.image.originalUrl ?? ""
                  }
                  alt={item.image.title ?? "Image"}
                  className="cart-item-image"
                />

                <div className="cart-item-details">
                  <h3>{item.image.title ?? "Untitled"}</h3>
                  <p>{item.image.description ?? ""}</p>
                  <p className="cart-item-price">${item.image.price}</p>
                </div>

                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      onQuantityChange(item.imageId, item.quantity - 1)
                    }
                    className="qty-btn"
                  >
                    −
                  </button>
                  <span className="qty-display">{item.quantity}</span>
                  <button
                    onClick={() =>
                      onQuantityChange(item.imageId, item.quantity + 1)
                    }
                    className="qty-btn"
                  >
                    +
                  </button>
                  <p style={{ marginLeft: "12px", fontWeight: 600 }}>
                    ${(item.image.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    className="remove-btn"
                    onClick={() => onRemove(item.imageId)}
                    style={{ marginLeft: "12px" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>
              <button className="clear-cart-btn" onClick={handleClearAll}>
                Remove all
              </button>
              <div className="summary-row">
                <span className="summary-row-label">
                  Items ({items.length})
                </span>
                <span className="summary-row-value">${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row-label">Shipping</span>
                <span className="summary-row-value">FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {checkoutError && (
                <div className="field-error" style={{ marginTop: 10 }}>
                  {checkoutError}
                </div>
              )}
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                💳 Proceed to Checkout
              </button>
              <Link
                to="/"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: "12px",
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
