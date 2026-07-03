import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { popularDestinations } from "../data/popularHotels";

function Booking() {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const hotel = useMemo(() => {
    return popularDestinations
      .flatMap((destination) => destination.hotels)
      .find((hotelItem) => hotelItem.id === hotelId);
  }, [hotelId]);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    firstName: storedUser.name ? storedUser.name.split(" ")[0] : "",
    lastName: storedUser.name ? storedUser.name.split(" ").slice(1).join(" ") : "",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
    country: storedUser.country || "",
    adults: 2,
    children: 0,
    roomType: "Deluxe",
    rooms: 1,
    specialRequests: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const nights = useMemo(() => {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = Math.ceil((outDate - inDate) / 86400000);
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  const totalPrice = hotel ? hotel.pricePerNight * form.rooms * nights : 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("Booking confirmed! This is a demo summary.");
  };

  if (!hotel) {
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

              <label className="booking-field">
                <span>Adults</span>
                <input
                  type="number"
                  name="adults"
                  min="1"
                  value={form.adults}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="booking-field">
                <span>Children</span>
                <input
                  type="number"
                  name="children"
                  min="0"
                  value={form.children}
                  onChange={handleChange}
                />
              </label>

              <label className="booking-field">
                <span>Room Type</span>
                <select name="roomType" value={form.roomType} onChange={handleChange}>
                  <option>Deluxe</option>
                  <option>Superior</option>
                  <option>Suite</option>
                  <option>Presidential</option>
                </select>
              </label>

              <label className="booking-field">
                <span>Number of Rooms</span>
                <input
                  type="number"
                  name="rooms"
                  min="1"
                  value={form.rooms}
                  onChange={handleChange}
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
              style={{ backgroundImage: `url(${hotel.imageUrl})` }}
              role="img"
              aria-label={hotel.name}
            />
            <div className="booking-summary-info">
              <p className="booking-summary-location">{hotel.location}</p>
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
            <div className="booking-summary-row">
              <span>Price per night</span>
              <strong>₹{hotel.pricePerNight.toLocaleString("en-IN")}</strong>
            </div>
            <div className="booking-summary-row">
              <span>Rooms</span>
              <strong>{form.rooms}</strong>
            </div>
            <div className="booking-summary-row">
              <span>Night(s)</span>
              <strong>{nights}</strong>
            </div>
            <div className="booking-summary-total">
              <span>Total price</span>
              <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Booking;
