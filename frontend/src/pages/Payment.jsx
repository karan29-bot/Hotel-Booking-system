import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./styles/payment.css";

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData;

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

  // Piece 3: sends Razorpay's response to our backend to be verified,
  // and only creates the booking once verification succeeds.
  const verifyAndBook = async (razorpayResponse, token) => {
    try {
      const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          bookingData,
        }),
      });

      const data = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(data.error || "Payment verification failed.");
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
      setError("Server error during verification. Please try again.");
      setProcessing(false);
    }
  };

  // Piece 2: opens Razorpay's real checkout popup using the order we created.
  const openRazorpayCheckout = (order, token) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Grandeur Hotels",
      description: `Booking at ${bookingData.hotel?.name}`,
      order_id: order.id,
      handler: function (response) {
        verifyAndBook(response, token);
      },
      prefill: {
        name: `${bookingData.guestDetails?.firstName || ""} ${bookingData.guestDetails?.lastName || ""}`.trim(),
        email: bookingData.guestDetails?.email,
        contact: bookingData.guestDetails?.phone,
      },
      theme: {
        color: "#a5490f",
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
          setError("Payment cancelled.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Piece 1: kicks off the whole flow when the user clicks "Pay Now".
  const handlePayNow = async () => {
    setError("");
    setProcessing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in again before confirming your booking.");
        setProcessing(false);
        return;
      }

      const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: bookingData.totalPrice }),
      });

      const order = await orderRes.json();

      if (!orderRes.ok) {
        setError(order.error || "Failed to start payment. Please try again.");
        setProcessing(false);
        return;
      }

      openRazorpayCheckout(order, token);
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

          <div className="payment-form">
            <p className="payment-placeholder-note">
              You'll be securely redirected to Razorpay's checkout to complete payment
              via card, UPI, netbanking, or wallet.
            </p>

            {error && <p className="payment-error">{error}</p>}

            <button
              type="button"
              className="payment-btn"
              onClick={handlePayNow}
              disabled={processing}
            >
              {processing ? "Processing..." : `Pay ${formatCurrency(bookingData.totalPrice)}`}
            </button>
          </div>
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
