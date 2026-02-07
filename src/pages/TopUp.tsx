import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import type { User } from "../types";

interface TopUpPageProps {
  onTopUp: (amount: number) => Promise<User | null>;
}

const PRESET_AMOUNTS = [25, 50, 100, 200];

export function TopUpPage({ onTopUp }: TopUpPageProps) {
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const [amount, setAmount] = useState<number>(PRESET_AMOUNTS[2]);
  const [customAmount, setCustomAmount] = useState("100");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<{
    amount?: string;
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
  }>({});

  const formattedTotal = useMemo(() => `$${amount.toFixed(2)}`, [amount]);

  const normalizeCard = (value: string) => value.replace(/\D+/g, "");

  const isValidCardNumber = (value: string) => {
    const digits = normalizeCard(value);
    return digits.length >= 13 && digits.length <= 19;
  };

  const isValidExpiry = (value: string) => {
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = Number(match[1]);
    const year = Number(match[2]);
    if (Number.isNaN(month) || Number.isNaN(year)) return false;
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const currentYear = Number(String(now.getFullYear()).slice(-2));
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  };

  const isValidCvv = (value: string) => /^\d{3,4}$/.test(value.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};

    if (!amount || amount <= 0) {
      nextErrors.amount = "Enter a valid top-up amount";
    }

    if (!cardNumber.trim()) {
      nextErrors.cardNumber = "Enter card number";
    } else if (!isValidCardNumber(cardNumber)) {
      nextErrors.cardNumber = "Invalid card number";
    }

    if (!expiry.trim()) {
      nextErrors.expiry = "Enter expiry date";
    } else if (!isValidExpiry(expiry)) {
      nextErrors.expiry = "Invalid expiry date";
    }

    if (!cvv.trim()) {
      nextErrors.cvv = "Enter CVC / CVV";
    } else if (!isValidCvv(cvv)) {
      nextErrors.cvv = "Invalid CVC / CVV";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      notify("Please check your details", { type: "warning" });
      return;
    }

    const result = await onTopUp(amount);
    if (result) {
      notify(`Balance topped up by $${amount.toFixed(2)}`, {
        type: "success",
        title: "Payment successful",
      });
      navigate("/");
    } else {
      notify("Failed to top up balance. Please try again.", {
        type: "error",
      });
    }
  };

  return (
    <div className="topup-page">
      <div className="topup-card">
        <div className="topup-card__header">
          <div className="topup-card__brands">
            <span className="brand-chip">VISA</span>
            <span className="brand-chip">Mastercard</span>
          </div>
          <div className="topup-card__summary">
            <div className="topup-card__total">{formattedTotal}</div>
            <div className="topup-card__note">Balance top-up</div>
          </div>
        </div>

        <div className="topup-progress" aria-hidden>
          <div className="topup-progress__bar" />
        </div>

        <p className="topup-lead">
          Please enter your card details below to complete the payment.
        </p>

        <form className="topup-form" onSubmit={handleSubmit}>
          <div className="topup-amounts">
            <p className="field-label">Top-up amount</p>
            <div className="amount-grid">
              {PRESET_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`amount-pill ${value === amount ? "active" : ""}`}
                  onClick={() => {
                    setAmount(value);
                    setCustomAmount(String(value));
                  }}
                >
                  ${value}
                </button>
              ))}
              <label className="amount-custom">
                <span>Custom amount</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D+/g, "");
                    setCustomAmount(digitsOnly);
                    setAmount(Number(digitsOnly) || 0);
                  }}
                />
              </label>
            </div>
            {errors.amount && (
              <div className="field-error">{errors.amount}</div>
            )}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="cardNumber">
              Card number
            </label>
            <div className="input-with-addon">
              <input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
              <span className="input-addon">💳</span>
            </div>
            {errors.cardNumber && (
              <div className="field-error">{errors.cardNumber}</div>
            )}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="expiry">
                Expiry date
              </label>
              <input
                id="expiry"
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
              />
              {errors.expiry && (
                <div className="field-error">{errors.expiry}</div>
              )}
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="cvv">
                CVC / CVV
              </label>
              <input
                id="cvv"
                type="password"
                inputMode="numeric"
                placeholder="3 digits"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
              />
              {errors.cvv && <div className="field-error">{errors.cvv}</div>}
            </div>
          </div>

          <button type="submit" className="primary-pay">
            Pay {formattedTotal}
          </button>
        </form>
      </div>
    </div>
  );
}
