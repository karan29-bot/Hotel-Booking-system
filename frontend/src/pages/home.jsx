import { useState, useRef } from "react";
import PopularHotels from "../components/PopularHotels";
import "../App.css";

function CalendarIcon() {
  return (
    <svg
      className="hero-calendar-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
import {Link} from "react-router-dom";

function Home() {
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState("Bangalore");
  const [guests, setGuests] = useState(1);
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  const openDatePicker = (inputRef) => {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully!");
    window.location.href = "/";
  }

  // Helper function to increment guests (no upper limit)
  const handleGuestIncrement = () => {
    setGuests((prevGuests) => prevGuests + 1);
  };

  // Helper function to decrement guests (minimum 1)
  const handleGuestDecrement = () => {
    setGuests((prevGuests) => (prevGuests > 1 ? prevGuests - 1 : 1));
  };

  // Handle search button click - triggers hotel search
  const handleSearchHotels = () => {
    if (!location || !checkIn || !checkOut) {
      alert("Please fill in all fields: Location, Check-in, and Check-out dates");
      return;
    }
  };


return (
    <div className="app">
      <nav className="navbar" aria-label="Main navigation">
        <button
          type="button"
          className="navbar-brand"
        >
          Hotel Booking
        </button>

        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={menuOpen}
          aria-controls="navbar-links"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
          <span className="visually-hidden">
            {menuOpen ? "Close menu" : "Open menu"}
          </span>
        </button>

        <ul
          id="navbar-links"
          className={`navbar-links${menuOpen ? " navbar-links--open" : ""}`}
        >
          <li>
            <Link to="/" className="navbar-link" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="navbar-link"
              onClick={() => {
                setMenuOpen(false);
                document.getElementById("hotels-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Hotels
            </button>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <button
                  type="button"
                  className="navbar-link"
                  onClick={() => setMenuOpen(false)}
                >
                  My Bookings
                </button>
              </li>
              <li>
                <Link to="/profile" className="navbar-link" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <button
              className="navbar-auth-btn navbar-auth-btn--signup"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="navbar-auth-btn navbar-auth-btn--login">
                Login
              </Link>

              <Link to="/signup" className="navbar-auth-btn navbar-auth-btn--signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero" aria-label="Welcome">
        <div className="hero-inner">
          <h1 className="hero-heading">
            <span className="hero-heading-line">Where Great</span>
            <span className="hero-heading-line">Journeys</span>
            <span className="hero-heading-line">Begin.</span>
          </h1>

          <div className="hero-search" role="search" aria-label="Hotel search">
            {/* Location Section: 25% */}
            <div className="hero-search-field hero-search-field--location">
              <label className="hero-search-label" htmlFor="location-select">
                Location
              </label>
              <div className="hero-search-select-wrapper">
                <select
                  id="location-select"
                  className="hero-search-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  aria-label="Select location"
                >
                  <option value="Bangalore">Bangalore</option>
                  <option value="Goa">Goa</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Chennai">Chennai</option>
                </select>
                <svg className="hero-search-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <div className="hero-search-divider" aria-hidden="true" />

            {/* Check In Section: 30% */}
            <div className="hero-search-field hero-search-field--date hero-search-field--checkin">
              <label className="hero-search-label" htmlFor="hero-check-in">
                Check in
              </label>
              <div className="hero-search-date-control">
                <input
                  ref={checkInRef}
                  id="hero-check-in"
                  type="date"
                  className="hero-search-date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                  aria-label="Check in date"
                />
                <button
                  type="button"
                  className="hero-search-calendar-btn"
                  onClick={() => openDatePicker(checkInRef)}
                  aria-label="Open check-in calendar"
                >
                  <CalendarIcon />
                </button>
              </div>
            </div>

            <div className="hero-search-divider" aria-hidden="true" />

            {/* Check Out Section: 30% */}
            <div className="hero-search-field hero-search-field--date hero-search-field--checkout">
              <label className="hero-search-label" htmlFor="hero-check-out">
                Check out
              </label>
              <div className="hero-search-date-control">
                <input
                  ref={checkOutRef}
                  id="hero-check-out"
                  type="date"
                  className="hero-search-date"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  aria-label="Check out date"
                />
                <button
                  type="button"
                  className="hero-search-calendar-btn"
                  onClick={() => openDatePicker(checkOutRef)}
                  aria-label="Open check-out calendar"
                >
                  <CalendarIcon />
                </button>
              </div>
            </div>

            <div className="hero-search-divider" aria-hidden="true" />

            {/* Guests Section: 15% */}
            <div className="hero-search-field hero-search-field--guests">
              <label className="hero-search-label">Guests</label>
              <div className="hero-guest-counter">
                <button
                  type="button"
                  className="hero-guest-btn"
                  onClick={handleGuestDecrement}
                  aria-label="Decrease guest count"
                  disabled={guests === 1}
                >
                  −
                </button>
                <span className="hero-guest-count">
                  {guests} {guests === 1 ? "Guest" : "Guests"}
                </span>
                <button
                  type="button"
                  className="hero-guest-btn"
                  onClick={handleGuestIncrement}
                  aria-label="Increase guest count"
                >
                  +
                </button>
              </div>
            </div>

            <div className="hero-search-button-wrap">
              <button
                type="button"
                className="hero-search-btn"
                onClick={handleSearchHotels}
                aria-label="Search hotels"
              >
                Search Hotels
              </button>
            </div>
          </div>
        </div>
      </section>

      <PopularHotels />
    </div>

  );

}
export default Home;
