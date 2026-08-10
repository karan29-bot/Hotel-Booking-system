import { Link, useLocation } from "react-router-dom";
import "./styles/payment.css";

function BookingConfirmation() {
  const location = useLocation();
  const { booking, hotel } = location.state || {};

  if (!booking) {
    return (
      <main className="payment-page">
        <div className="payment-card">
          <h1>No confirmation found</h1>
          <Link to="/" className="payment-btn">Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="payment-page">
      <div className="confirmation-card">
        <div className="confirmation-check">✓</div>
        <h1>Booking Confirmed!</h1>
        <p className="confirmation-subtitle">
          Your stay at <strong>{hotel?.name || booking.hotel_name}</strong> is booked.
        </p>

        <div className="confirmation-details">
          <div className="confirmation-row">
            <span>Confirmation ID</span>
            <strong>#{booking.id}</strong>
          </div>
          <div className="confirmation-row">
            <span>Check-in</span>
            <strong>{new Date(booking.check_in).toLocaleDateString()}</strong>
          </div>
          <div className="confirmation-row">
            <span>Check-out</span>
            <strong>{new Date(booking.check_out).toLocaleDateString()}</strong>
          </div>
          <div className="confirmation-row">
            <span>Total Paid</span>
            <strong>₹{Number(booking.total_price).toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <div className="confirmation-actions">
          <Link to="/profile?tab=bookings" className="payment-btn">View My Bookings</Link>
          <Link to="/" className="confirmation-home-link">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}

export default BookingConfirmation;