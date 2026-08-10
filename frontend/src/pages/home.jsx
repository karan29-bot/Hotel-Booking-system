import { useState, useRef , useEffect } from "react";
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
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [isDestinationMenuOpen, setIsDestinationMenuOpen] = useState(false);
  const [destinationMessage, setDestinationMessage] = useState("");
  const [highlightedDestination, setHighlightedDestination] = useState("");
  const [highlightedHotelId, setHighlightedHotelId] = useState("");
  const [guests, setGuests] = useState(1);
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  useEffect(() => {
  const fetchHomeData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/home");
      const data = await response.json();

      setHotels(data.hotels);
      setPopularDestinations(data.popularDestinations);
    } catch (error) {
      console.error("Failed to load homepage:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchHomeData();
}, []);

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

  const getDestinationId = (city) =>
    `destination-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  const getHotelId = (hotelId) => `hotel-${hotelId}`;

  const searchOptions = popularDestinations.flatMap((destination) => [
    {
      id: `destination-${destination.city}`,
      type: "destination",
      label: destination.city,
      detail: "Destination",
      destination,
    },
    ...destination.hotels.map((hotel) => ({
      id: `hotel-${hotel.id}`,
      type: "hotel",
      label: hotel.name,
      detail: destination.city,
      destination,
      hotel,
    })),
  ]);

  const destinationSuggestions = searchOptions.filter((option) =>
    option.label.toLowerCase().includes(destinationQuery.trim().toLowerCase())
  );

  const findSearchMatch = () => {
    const query = destinationQuery.trim().toLowerCase();
    if (!query) return null;

    return (
      searchOptions.find((option) => option.label.toLowerCase() === query) ||
      searchOptions.find((option) => option.label.toLowerCase().includes(query))
    );
  };

  const highlightSearchTarget = ({ destination, hotel }) => {
    setDestinationMessage("");
    setIsDestinationMenuOpen(false);
    setHighlightedDestination(hotel ? "" : destination.city);
    setHighlightedHotelId(hotel?.id || "");

    window.requestAnimationFrame(() => {
      const targetId = hotel ? getHotelId(hotel.id) : getDestinationId(destination.city);
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    window.clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedDestination("");
      setHighlightedHotelId("");
    }, 1800);
  };

  const handleSearchHotels = () => {
    const match = findSearchMatch();

    if (!match) {
      setDestinationMessage("No hotels found.");
      setIsDestinationMenuOpen(false);
      return;
    }

    setDestinationQuery(match.label);
    highlightSearchTarget(match);
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
  <Link
    to="/profile?tab=bookings"
    className="navbar-link"
    onClick={() => setMenuOpen(false)}
  >
    My Bookings
  </Link>
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
              <label className="hero-search-label" htmlFor="destination-search">
                Location
              </label>
              <div className="hero-search-destination">
                <input
                  id="destination-search"
                  type="text"
                  className="hero-search-destination-input"
                  value={destinationQuery}
                  onChange={(e) => {
                    setDestinationQuery(e.target.value);
                    setDestinationMessage("");
                    setIsDestinationMenuOpen(true);
                  }}
                  onFocus={() => setIsDestinationMenuOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchHotels();
                    }
                  }}
                  placeholder="Search destination or hotel"
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls="destination-suggestions"
                  aria-expanded={isDestinationMenuOpen}
                />
                {isDestinationMenuOpen && destinationQuery.trim() && (
                  <div
                    id="destination-suggestions"
                    className="hero-search-suggestions"
                    role="listbox"
                  >
                    {destinationSuggestions.length > 0 ? (
                      destinationSuggestions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="hero-search-suggestion"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setDestinationQuery(option.label);
                            setDestinationMessage("");
                            setIsDestinationMenuOpen(false);
                          }}
                          role="option"
                        >
                          <span className="hero-search-suggestion-label">
                            {option.label}
                          </span>
                          <span className="hero-search-suggestion-detail">
                            {option.detail}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="hero-search-suggestion-empty">
                        No hotels found.
                      </p>
                    )}
                  </div>
                )}
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
          {destinationMessage && (
            <p className="hero-search-message" role="status">
              {destinationMessage}
            </p>
          )}
        </div>
      </section>

    {!loading && (
  <PopularHotels
    popularDestinations={popularDestinations}
    highlightedDestination={highlightedDestination}
    highlightedHotelId={highlightedHotelId}
  />
)}
    </div>

  );

}
export default Home;
