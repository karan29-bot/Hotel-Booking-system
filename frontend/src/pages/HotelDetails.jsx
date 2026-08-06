import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./styles/hotelDetails.css";

const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

function HotelDetails() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [roomQuantities, setRoomQuantities] = useState({});
  const [currentHotel, setCurrentHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/hotels/${hotelId}`);
        if (response.status === 404) {
          setCurrentHotel(null);
          return;
        }
        const data = await response.json();
        setCurrentHotel(data);
      } catch (error) {
        console.error(error);
        setCurrentHotel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId]);

  if (loading) {
    return null;
  }

  if (!currentHotel) {
    return (
      <div className="hotel-details-page">
        <div className="hotel-details-card">
          <div className="hotel-content">
            <section className="detail-section">
              <h2>Hotel not found</h2>
              <p>Choose another hotel from the home page.</p>
              <button
                className="proceed-booking-btn"
                type="button"
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
            </section>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (roomId, change) => {
    setRoomQuantities((prev) => {
      const currentQty = prev[roomId] || 0;
      const newQty = Math.max(0, currentQty + change);
      const room = currentHotel.rooms.find((r) => r.id === roomId);
      
      if (room && newQty <= room.availableRooms) {
        return { ...prev, [roomId]: newQty };
      }
      return prev;
    });
  };

  const selectedRooms = currentHotel.rooms
    .filter((room) => roomQuantities[room.id] > 0)
    .map((room) => ({
      ...room,
      quantity: roomQuantities[room.id],
      priceValue: room.price,
      guestCount: parseInt(room.guests.replace(/[^0-9]/g, "")),
    }));

  const totalRooms = selectedRooms.reduce((sum, room) => sum + room.quantity, 0);
  const totalGuests = selectedRooms.reduce((sum, room) => sum + (room.guestCount * room.quantity), 0);
  const totalPrice = selectedRooms.reduce((sum, room) => sum + (room.priceValue * room.quantity), 0);
  const hasSelectedRooms = selectedRooms.length > 0;

  const handleProceedToBooking = () => {
    navigate(`/booking/${hotelId}`, {
      state: {
        hotel: currentHotel,
        selectedRooms,
        totalPrice,
        totalRooms,
        totalGuests,
      },
    });
  };

  return (
    <div className="hotel-details-page">
      <div className="hotel-details-card">
        <div className="hotel-image-wrap">
          <img className="hotel-image" src={currentHotel.image} alt={currentHotel.name} />

          <div className="hotel-header-overlay">
            <div className="hotel-header">
              <div>
                <p className="hotel-kicker">Featured Stay</p>
                <h1 className="hotel-title">{currentHotel.name}</h1>
                <div className="hotel-meta">
                  <span className="hotel-rating">⭐ {currentHotel.rating}</span>
                  <span className="hotel-location">📍 {currentHotel.city}</span>
                </div>
              </div>

              <div className="hotel-price-card">
                <span className="hotel-price">{formatCurrency(currentHotel.price)}</span>
                <span className="hotel-night">per night</span>
              </div>
            </div>

          </div>
        </div>

        <div className="hotel-content">
          <div className="hotel-details-layout">
            <div className="hotel-details-main">
          <section className="detail-section">
            <h2>About</h2>
            <p>{currentHotel.description}</p>
            <ul className="highlights-list">
              {currentHotel.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="detail-section">
            <h2>Amenities</h2>
            <div className="amenities-grid">
              {currentHotel.amenities.map((item) => (
                <div className="amenity-pill" key={item}>
                  <span className="amenity-icon" aria-hidden="true">
                    ✨
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="detail-section">
            <h2>Available Rooms</h2>
            <div className="rooms-grid">
              {currentHotel.rooms.map((room) => {
                const quantity = roomQuantities[room.id] || 0;
                const isMaxReached = quantity >= room.availableRooms;

                return (
                  <article
                    className={`room-card${quantity > 0 ? " room-card--selected" : ""}`}
                    key={room.id}
                  >
                    <div className="room-card-main">
                      <div className="room-card-top">
                        <div>
                          <h3>{room.name}</h3>
                          <p className="room-price">{formatCurrency(room.price)}</p>
                        </div>
                        <span className="room-badge">🛏 {room.bedType}</span>
                      </div>

                      <div className="room-specs">
                        <span>👥 {room.guests}</span>
                        <span>📐 {room.size}</span>
                      </div>

                      <p className="room-description">{room.description}</p>

                      <div className="room-amenities">
                        {room.amenities.map((amenity) => (
                          <span key={amenity}>✨ {amenity}</span>
                        ))}
                      </div>

                      {isMaxReached && quantity > 0 && (
                        <p className="room-availability">
                          Only {room.availableRooms} rooms available
                        </p>
                      )}
                    </div>

                    <div className="room-quantity-control">
                      <button
                        className="quantity-btn quantity-btn--decrease"
                        type="button"
                        onClick={() => handleQuantityChange(room.id, -1)}
                        disabled={quantity === 0}
                      >
                        -
                      </button>
                      <span className="quantity-value">{quantity}</span>
                      <button
                        className="quantity-btn quantity-btn--increase"
                        type="button"
                        onClick={() => handleQuantityChange(room.id, 1)}
                        disabled={isMaxReached}
                      >
                        +
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

          </section>

            </div>

            <aside className="hotel-details-sidebar" aria-label="Booking Summary">
            <section className="detail-section booking-summary-section">
              <h2>Booking Summary</h2>
              <div className="booking-summary">
                <div className="summary-items">
                  {hasSelectedRooms ? (
                    selectedRooms.map((room) => (
                    <div className="summary-item" key={room.id}>
                      <div className="summary-item-main">
                        <h4>{room.name}</h4>
                        <span className="summary-item-qty">x{room.quantity}</span>
                      </div>
                      <div className="summary-item-details">
                        <span className="summary-item-price">{formatCurrency(room.price)}/room</span>
                        <span className="summary-item-subtotal">
                          {formatCurrency(room.priceValue * room.quantity)}
                        </span>
                      </div>
                    </div>
                    ))
                  ) : (
                    <p className="summary-empty">No rooms selected</p>
                  )}
                </div>

                <div className="summary-totals">
                  <div className="summary-total-row">
                    <span>Total Rooms</span>
                    <span className="summary-total-value">{totalRooms}</span>
                  </div>
                  <div className="summary-total-row">
                    <span>Total Guests</span>
                    <span className="summary-total-value">{totalGuests}</span>
                  </div>
                  <div className="summary-total-row summary-total-row--highlight">
                    <span>Total Price</span>
                    <span className="summary-total-value summary-total-value--price">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                <button
                  className="proceed-booking-btn"
                  type="button"
                  disabled={!hasSelectedRooms}
                  onClick={handleProceedToBooking}
                >
                  Proceed to Booking
                </button>
              </div>
            </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HotelDetails;
