import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

function Booking() {
  const navigate = useNavigate();
  const location = useLocation();

  let storedUser = {};
  if (typeof window !== "undefined") {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        storedUser = JSON.parse(savedUser);
      } catch {
        storedUser = {};
      }
    }
  }

  const safeStoredUser = storedUser && typeof storedUser === "object" ? storedUser : {};
  const bookingState = location.state || {};
  const { hotel, selectedRooms, totalRooms, totalGuests } = bookingState;
  const safeHotel = hotel && typeof hotel === "object" ? hotel : null;
  const safeSelectedRooms = Array.isArray(selectedRooms) ? selectedRooms : [];

  const computedTotalRooms = typeof totalRooms === "number"
    ? totalRooms
    : safeSelectedRooms.reduce((sum, room) => sum + (Number(room?.quantity) || 0), 0);
  const computedTotalGuests = typeof totalGuests === "number"
    ? totalGuests
    : safeSelectedRooms.reduce(
        (sum, room) => sum + ((Number(room?.guestCount) || 0) * (Number(room?.quantity) || 0)),
        0,
      );

  const today = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [message, setMessage] = useState("");

  // Nights is derived live from checkIn/checkOut, minimum 1 night.
  const nights = Math.max(
    1,
    Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
  );

  const perNightPrice = safeSelectedRooms.reduce(
    (sum, room) => sum + ((Number(room?.priceValue) || 0) * (Number(room?.quantity) || 0)),
    0,
  );

  const computedTotalPrice = perNightPrice * nights;

  const [form, setForm] = useState({
    firstName: safeStoredUser.name ? safeStoredUser.name.split(" ")[0] : "",
    lastName: safeStoredUser.name ? safeStoredUser.name.split(" ").slice(1).join(" ") : "",
    email: safeStoredUser.email || "",
    phone: safeStoredUser.phone || "",
    country: safeStoredUser.country || "",
    specialRequests: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!safeHotel || safeSelectedRooms.length === 0) {
      setMessage("Please select at least one room before confirming.");
      return;
    }

    const bookingData = {
      hotel: safeHotel,
      selectedRooms: safeSelectedRooms,
      totalRooms: computedTotalRooms,
      totalGuests: computedTotalGuests,
      totalPrice: computedTotalPrice,
      nights,
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

    navigate("/payment", { state: { bookingData } });
  };

  if (!location.state || !safeHotel) {
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
              Proceed to Payment
            </button>

            {message && <p className="booking-message">{message}</p>}
          </form>
        </section>

        <aside className="booking-summary-card">
          <h2 className="booking-section-title">Booking Summary</h2>
          <div className="booking-summary-hotel">
            <div
              className="booking-summary-image"
              style={{ backgroundImage: `url(${safeHotel?.image || ""})` }}
              role="img"
              aria-label={safeHotel?.name || "Hotel image"}
            />
            <div className="booking-summary-info">
              <p className="booking-summary-location">{safeHotel?.city || "Location unavailable"}</p>
              <h3 className="booking-summary-name">{safeHotel?.name || "Hotel unavailable"}</h3>
              <div className="booking-summary-rating">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={`${safeHotel?.id || "hotel"}-star-${index}`}
                    className={`booking-summary-star${index < Math.round(Number(safeHotel?.rating) || 0) ? " booking-summary-star--filled" : ""}`}
                    aria-hidden="true"
                  >
                    ★
                  </span>
                ))}
                <span>{typeof safeHotel?.rating === "number" ? safeHotel.rating.toFixed(1) : "0.0"}</span>
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
            {safeSelectedRooms.map((room, index) => (
              <div className="booking-summary-row" key={room.id || `${room.name || "room"}-${index}`}>
                <span>{room.name || "Room"} x{room.quantity || 0} · {nights} night{nights > 1 ? "s" : ""}</span>
                <strong>{formatCurrency((Number(room.priceValue) || 0) * (Number(room.quantity) || 0) * nights)}</strong>
              </div>
            ))}
            <div className="booking-summary-row">
              <span>Total Rooms</span>
              <strong>{computedTotalRooms}</strong>
            </div>
            <div className="booking-summary-row">
              <span>Total Guests</span>
              <strong>{computedTotalGuests}</strong>
            </div>
            <div className="booking-summary-row">
              <span>Nights</span>
              <strong>{nights}</strong>
            </div>
            <div className="booking-summary-total">
              <span>Total price</span>
              <strong>{formatCurrency(computedTotalPrice)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Booking;
