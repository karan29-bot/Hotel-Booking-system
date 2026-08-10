import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./styles/payment.css";

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData;

  const [method, setMethod] = useState(null); // "card" | "upi" | "netbanking"
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!bookingData) {
    return (
      <main className="payment-page">
        <div className="payment-card">
          <h1>No booking found</h1>
          <p>Please start your booking again from the hotel page.</p>
          <Link to="/" className="payment-btn">Back to Home</Link>
        </div>
      </main>
    );
  }

 const handleCardChange = (e) => {
  const { name, value } = e.target;

  if (name === "number") {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
    const formatted = digitsOnly.replace(/(.{4})/g, "$1 ").trim();
    setCard((prev) => ({ ...prev, number: formatted }));
    return;
  }

  if (name === "expiry") {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
    const formatted = digitsOnly.length > 2
      ? `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
      : digitsOnly;
    setCard((prev) => ({ ...prev, expiry: formatted }));
    return;
  }

  if (name === "cvv") {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 3);
    setCard((prev) => ({ ...prev, cvv: digitsOnly }));
    return;
  }

  setCard((prev) => ({ ...prev, [name]: value }));
};
  const handlePayNow = async (e) => {
    e.preventDefault();
    setError("");
    setProcessing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in again before confirming your booking.");
        setProcessing(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Booking failed. Please try again.");
        setProcessing(false);
        return;
      }

      navigate("/booking-confirmation", {
        state: {
          booking: data.booking,
          hotel: bookingData.hotel,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <main className="payment-page">
      <div className="payment-layout">
        <section className="payment-panel">
          <p className="payment-overline">Payment</p>
          <h1 className="payment-title">Complete your booking</h1>

          {!method ? (
            <div className="payment-methods">
              <p className="payment-methods-label">Select a payment method</p>
              <button className="payment-method-option" onClick={() => setMethod("card")}>
                <span>💳 Credit / Debit Card</span>
                <span className="payment-method-arrow">›</span>
              </button>
              <button className="payment-method-option" onClick={() => setMethod("upi")}>
                <span>📱 UPI</span>
                <span className="payment-method-arrow">›</span>
              </button>
              <button className="payment-method-option" onClick={() => setMethod("netbanking")}>
                <span>🏦 Net Banking</span>
                <span className="payment-method-arrow">›</span>
              </button>
            </div>
          ) : method === "card" ? (
            <form onSubmit={handlePayNow} className="payment-form">
              <button type="button" className="payment-change-method" onClick={() => setMethod(null)}>
                ← Change payment method
              </button>

              <label className="payment-field">
                <span>Card Number</span>
                <input
                  type="text"
                  name="number"
                  value={card.number}
                  onChange={handleCardChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
              </label>

              <label className="payment-field">
                <span>Cardholder Name</span>
                <input
                  type="text"
                  name="name"
                  value={card.name}
                  onChange={handleCardChange}
                  placeholder="Name on card"
                  required
                />
              </label>

              <div className="payment-form-row">
                <label className="payment-field">
                  <span>Expiry</span>
                  <input
                    type="text"
                    name="expiry"
                    value={card.expiry}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </label>
                <label className="payment-field">
                  <span>CVV</span>
                  <input
                    type="password"
                    name="cvv"
                    value={card.cvv}
                    onChange={handleCardChange}
                    placeholder="•••"
                    maxLength={3}
                    required
                  />
                </label>
              </div>

              {error && <p className="payment-error">{error}</p>}

              <button type="submit" className="payment-btn" disabled={processing}>
                {processing ? "Processing..." : `Pay ${formatCurrency(bookingData.totalPrice)}`}
              </button>
            </form>
          ) : (
            <div className="payment-form">
              <button type="button" className="payment-change-method" onClick={() => setMethod(null)}>
                ← Change payment method
              </button>
              <p className="payment-placeholder-note">
                {method === "upi" ? "UPI" : "Net Banking"} payment isn't available in this demo yet — try Card instead.
              </p>
              {error && <p className="payment-error">{error}</p>}
              <button className="payment-btn" onClick={handlePayNow} disabled={processing}>
                {processing ? "Processing..." : `Pay ${formatCurrency(bookingData.totalPrice)}`}
              </button>
            </div>
          )}
        </section>

        <aside className="payment-summary-card">
          <h2>Order Summary</h2>
          <div className="payment-summary-hotel">
            <div
              className="payment-summary-image"
              style={{ backgroundImage: `url(${bookingData.hotel?.image || ""})` }}
            />
            <div>
              <p className="payment-summary-location">{bookingData.hotel?.city}</p>
              <h3 className="payment-summary-name">{bookingData.hotel?.name}</h3>
            </div>
          </div>

          <div className="payment-summary-rows">
            <div className="payment-summary-row">
              <span>Check-in</span>
              <strong>{bookingData.checkIn}</strong>
            </div>
            <div className="payment-summary-row">
              <span>Check-out</span>
              <strong>{bookingData.checkOut}</strong>
            </div>
            <div className="payment-summary-row">
              <span>Rooms</span>
              <strong>{bookingData.totalRooms}</strong>
            </div>
            <div className="payment-summary-row">
              <span>Guests</span>
              <strong>{bookingData.totalGuests}</strong>
            </div>
          </div>

          <div className="payment-summary-total">
            <span>Total Amount</span>
            <strong>{formatCurrency(bookingData.totalPrice)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Payment;