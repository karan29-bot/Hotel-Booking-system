import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const { hotel, selectedRooms, totalPrice, totalRooms, totalGuests } = location.state || {};

  const today = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    firstName: storedUser.name ? storedUser.name.split(" ")[0] : "",
    lastName: storedUser.name ? storedUser.name.split(" ").slice(1).join(" ") : "",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
    country: storedUser.country || "",
    specialRequests: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const bookingData = {
      hotel,
      selectedRooms,
      totalRooms,
      totalGuests,
      totalPrice,
      guestDetails: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        specialRequests: form.specialRequests,
      },
      checkIn,
      checkOut,
    };

    console.log("Booking submitted:", bookingData);
    setMessage("Booking confirmed! This is a demo summary.");
  };

  if (!location.state || !hotel) {
    return (
      <main className="booking-page">
        <div className="booking-heading">
          <Link to="/" className="booking-back-link">
            ← Back to Home
          </Link>
          <div>
            <h1 className="booking-title">Hotel not found</h1>
            <p className="booking-subtitle">Choose another hotel from the home page.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <div className="booking-heading">
        <button type="button" className="booking-back-link" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div>
          <p className="booking-overline">Booking</p>
          <h1 className="booking-title">Reserve your stay</h1>
        </div>
      </div>

      <div className="booking-grid">
        <section className="booking-panel">
          <div className="booking-panel__header">
            <h2 className="booking-section-title">Guest Details</h2>
            <p className="booking-section-copy">
              Fill in your information below and review the hotel summary before confirming.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="booking-form-grid">
              <label className="booking-field">
                <span>First Name</span>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                />
              </label>

              <label className="booking-field">
                <span>Last Name</span>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                />
              </label>

              <label className="booking-field booking-field--full">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="booking-field booking-field--full">
                <span>Phone Number</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </label>

              <label className="booking-field booking-field--full">
                <span>Country / Region</span>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="India"
                  required
                />
              </label>

              <label className="booking-field booking-field--full">
                <span>Special Requests</span>
                <textarea
                  name="specialRequests"
                  value={form.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special requests?"
                  rows="4"
                />
              </label>
            </div>

            <button type="submit" className="booking-btn">
              Confirm Booking
            </button>

            {message && <p className="booking-message">{message}</p>}
          </form>
        </section>

        <aside className="booking-summary-card">
          <h2 className="booking-section-title">Booking Summary</h2>
          <div className="booking-summary-hotel">
            <div
              className="booking-summary-image"
              style={{ backgroundImage: `url(${hotel.image})` }}
              role="img"
              aria-label={hotel.name}
            />
            <div className="booking-summary-info">
              <p className="booking-summary-location">{hotel.city}</p>
              <h3 className="booking-summary-name">{hotel.name}</h3>
              <div className="booking-summary-rating">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={`${hotel.id}-star-${index}`}
                    className={`booking-summary-star${index < Math.round(hotel.rating) ? " booking-summary-star--filled" : ""}`}
                    aria-hidden="true"
                  >
                    ★
                  </span>
                ))}
                <span>{hotel.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="booking-summary-dates">
            <div className="booking-summary-date-field">
              <label htmlFor="check-in">Check in</label>
              <input
                id="check-in"
                type="date"
                value={checkIn}
                min={today}
                onChange={(event) => setCheckIn(event.target.value)}
              />
            </div>
            <div className="booking-summary-date-field">
              <label htmlFor="check-out">Check out</label>
              <input
                id="check-out"
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(event) => setCheckOut(event.target.value)}
              />
            </div>
          </div>

          <div className="booking-summary-pricing">
            {selectedRooms.map((room) => (
              <div className="booking-summary-row" key={room.id}>
                <span>{room.name} x{room.quantity}</span>
                <strong>{formatCurrency(room.priceValue * room.quantity)}</strong>
              </div>
            ))}
            <div className="booking-summary-row">
              <span>Total Rooms</span>
              <strong>{totalRooms}</strong>
            </div>
            <div className="booking-summary-row">
              <span>Total Guests</span>
              <strong>{totalGuests}</strong>
            </div>
            <div className="booking-summary-total">
              <span>Total price</span>
              <strong>{formatCurrency(totalPrice)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Booking;
