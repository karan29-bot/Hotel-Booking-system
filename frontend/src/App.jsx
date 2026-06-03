import { useState, useEffect, useRef } from "react";
import PopularHotels from "./components/PopularHotels";
import "./App.css";

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

function App() {
  const [customerName, setCustomerName] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [checkIn, setCheckInName] = useState("");
  const [checkOut, setCheckOutName] = useState("");
  const [bookings, setBookings] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [activeNav, setActiveNav] = useState("booking");
  const [menuOpen, setMenuOpen] = useState(false);
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

  const scrollToSection = (sectionId, navKey) => {
    setActiveNav(navKey);
    setMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

    useEffect(() => {

  fetch("http://localhost:5000/bookings")

    .then((response) => response.json())

    .then((data) => {

      setBookings(data);

    });

}, []);

const handleBooking = () => {

  const newBooking = {

    customerName,
    hotelName,
    checkIn,
    checkOut

  };

  console.log("Fetch running");

  const today = new Date().toISOString().split("T")[0];
  if(checkIn < today ){
    alert("Past check-ins dates are not allowed");
    return ;
  } 
  if(checkOut<checkIn){
    alert("Check-out cannot be before check-in");
    return ; 
  }

  if (editingIndex !== null) {

    fetch(`http://localhost:5000/bookings/${editingIndex}`, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(newBooking),

    })

    .then(() => {

      setEditingIndex(null);

      window.location.reload();

    });

  }

  else {

    fetch("http://localhost:5000/bookings", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(newBooking),

    })

    .then(() => {

      window.location.reload();

    });

  }

};

return (
    <div className="app">
      <nav className="navbar" aria-label="Main navigation">
        <button
          type="button"
          className="navbar-brand"
          onClick={() => scrollToSection("booking-form", "booking")}
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
            <button
              type="button"
              className={`navbar-link${activeNav === "bookings" ? " navbar-link--active" : ""}`}
              onClick={() => scrollToSection("bookings-list", "bookings")}
            >
              Bookings
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`navbar-link${activeNav === "hotels" ? " navbar-link--active" : ""}`}
              onClick={() => scrollToSection("hotels-section", "hotels")}
            >
              Hotels
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`navbar-link${activeNav === "profile" ? " navbar-link--active" : ""}`}
              onClick={() => scrollToSection("profile-section", "profile")}
            >
              Profile
            </button>
          </li>
        </ul>
      </nav>

      <section className="hero" aria-label="Welcome">
        <div className="hero-inner">
          <h1 className="hero-heading">
            <span className="hero-heading-line">Where Great</span>
            <span className="hero-heading-line">Journeys</span>
            <span className="hero-heading-line">Begin.</span>
          </h1>

          <div className="hero-search" role="search" aria-label="Hotel search">
            <div className="hero-search-field">
              <span className="hero-search-label">Location</span>
            </div>
            <div className="hero-search-divider" aria-hidden="true" />
            <div className="hero-search-field hero-search-field--date">
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
                  onChange={(e) => setCheckInName(e.target.value)}
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
            <div className="hero-search-field hero-search-field--date">
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
                  onChange={(e) => setCheckOutName(e.target.value)}
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
            <div className="hero-search-field">
              <span className="hero-search-label">Guests</span>
            </div>
          </div>
        </div>
      </section>

      <PopularHotels />

      <main className="app-main">
      <section id="booking-form" className="app-section">
      <h2 className="booking-form-title">Hotel booking</h2>

      <input
        type="text"
        placeholder="Enter customer name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Enter hotel name"
        value={hotelName}
        onChange={(e) => setHotelName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="date"
        value={checkIn}
        onChange={(e) => setCheckInName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="date"
        value={checkOut}
        onChange={(e) => setCheckOutName(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleBooking}>
        Book now
      </button>
      </section>

      <section id="bookings-list" className="app-section">
      {

        bookings.map((booking, index) => (

          <div key={index}>

            <h3>{booking.customer_name}</h3>
            <h3>{booking.hotel_name}</h3>
            <h3>{booking.check_in.split("T")[0]}</h3>
            <h3>{booking.check_out.split("T")[0]}</h3>

            <button>
              Delete
            </button>

            <button
              onClick={() => {

                setEditingIndex(booking.id);

                setCustomerName(booking.customer_name);
                setHotelName(booking.hotel_name);
                setCheckInName(booking.check_in.split("T")[0]);
                setCheckOutName(booking.check_out.split("T")[0]);

              }}
            >
              Edit
            </button>

          </div>

        ))

      }
      </section>

      <section id="hotels-section" className="app-section app-section--placeholder">
        <h2>Hotels</h2>
        <p>Hotels you have booked appear in your bookings list above.</p>
      </section>

      <section id="profile-section" className="app-section app-section--placeholder">
        <h2>Profile</h2>
        <p>Your guest profile details can go here later.</p>
      </section>
      </main>
    </div>

  );

}
export default App;
