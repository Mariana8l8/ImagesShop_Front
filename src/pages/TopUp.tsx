import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";

interface TopUpPageProps {
  onTopUp: (amount: number) => Promise<User | null>;
}

const PRESET_AMOUNTS = [25, 50, 100, 200];

export function TopUpPage({ onTopUp }: TopUpPageProps) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(PRESET_AMOUNTS[2]);
  const [customAmount, setCustomAmount] = useState("100");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const formattedTotal = useMemo(() => `$${amount.toFixed(2)}`, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert("Вкажіть суму поповнення");
      return;
    }

    const result = await onTopUp(amount);
    if (result) {
      alert(`Баланс поповнено на $${amount.toFixed(2)}`);
      navigate("/");
    } else {
      alert("Не вдалося поповнити баланс. Спробуйте ще раз.");
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
            <div className="topup-card__note">Поповнення балансу</div>
          </div>
        </div>

        <div className="topup-progress" aria-hidden>
          <div className="topup-progress__bar" />
        </div>

        <p className="topup-lead">
          Будь ласка, введіть дані Вашої картки нижче, щоб здійснити оплату.
        </p>

        <form className="topup-form" onSubmit={handleSubmit}>
          <div className="topup-amounts">
            <p className="field-label">Сума поповнення</p>
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
                <span>Своя сума</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Введіть суму"
                  value={customAmount}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D+/g, "");
                    setCustomAmount(digitsOnly);
                    setAmount(Number(digitsOnly) || 0);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="cardNumber">
              Номер картки
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
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="expiry">
                Термін дії
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
            </div>
          </div>

          <button type="submit" className="primary-pay">
            Оплатити {formattedTotal}
          </button>
        </form>
      </div>
    </div>
  );
}
