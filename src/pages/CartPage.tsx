import { Link } from "react-router-dom";
import { ordersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { CartItemWithCount, Order, OrderStatus } from "../types";

interface CartPageProps {
  items: CartItemWithCount[];
  onRemove: (imageId: string) => void;
  onQuantityChange: (imageId: string, quantity: number) => void;
}

export function CartPage({ items, onRemove, onQuantityChange }: CartPageProps) {
  const { user } = useAuth();
  const total = items.reduce(
    (sum, item) => sum + item.image.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("Cart is empty!");
      return;
    }

    try {
      const userId = user?.id;
      if (!userId) {
        alert("Потрібно увійти, щоб оформити замовлення");
        return;
      }

      const order: Order = {
        id: crypto.randomUUID(),
        userId,
        createdAt: new Date().toISOString(),
        status: 0 as OrderStatus,
        totalAmount: total,
        currency: "USD",
        notes: "Order from website",
        items: items.map((item) => ({
          id: crypto.randomUUID(),
          orderId: "",
          imageId: item.imageId,
        })),
      };

      await ordersAPI.create(order);

      alert(
        `✓ Order placed!\nAmount: $${total.toFixed(2)}\n\nThank you for your purchase!`,
      );
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again later.");
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
              <button className="checkout-btn" onClick={handleCheckout}>
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
