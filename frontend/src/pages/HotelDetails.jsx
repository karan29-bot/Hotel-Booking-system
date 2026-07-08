import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./styles/hotelDetails.css";

const hotelData = {
  id: "aurora-lake-resort",
  name: "Aurora Lake Resort",
  image:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  rating: "4.9",
  location: "Bangalore, India",
  price: "$220",
  about:
    "Set beside a serene lakefront, Aurora Lake Resort blends contemporary luxury with calm natural surroundings. Guests enjoy spacious suites, curated dining, and a tranquil spa experience designed for rest and rejuvenation.",
  highlights: [
    "Breakfast Included",
    "Couple Friendly",
    "Free Cancellation",
    "24/7 Check-in",
  ],
  amenities: [
    { icon: "🌊", label: "Lake View" },
    { icon: "🛁", label: "Spa Access" },
    { icon: "📶", label: "High Speed Wi-Fi" },
    { icon: "🍽️", label: "Fine Dining" },
    { icon: "🏋️", label: "Fitness Center" },
    { icon: "🚗", label: "Airport Pickup" },
  ],
  rooms: [
    {
      id: "deluxe",
      name: "Deluxe Room",
      price: "$260",
      bedType: "King Bed",
      guests: "2 Guests",
      size: "430 sq ft",
      description: "A serene retreat with plush bedding, a private balcony, and elegant city views.",
      amenities: ["Breakfast", "Wi-Fi", "Air Conditioning"],
      availableRooms: 5,
    },
    {
      id: "executive",
      name: "Executive Room",
      price: "$320",
      bedType: "Queen Bed",
      guests: "3 Guests",
      size: "560 sq ft",
      description: "Perfect for extended stays, with a lounge corner and upgraded bath amenities.",
      amenities: ["Late Checkout", "Workspace", "Mini Bar"],
      availableRooms: 3,
    },
    {
      id: "luxury-suite",
      name: "Luxury Suite",
      price: "$480",
      bedType: "King Bed",
      guests: "4 Guests",
      size: "820 sq ft",
      description: "An expansive suite featuring a separate living area and panoramic lake views.",
      amenities: ["Butler Service", "Spa Access", "Premium Lounge"],
      availableRooms: 2,
    },
  ],
};

function HotelDetails() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [roomQuantities, setRoomQuantities] = useState({});

  const currentHotel = hotelId === hotelData.id ? hotelData : hotelData;

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
      priceValue: parseInt(room.price.replace(/[^0-9]/g, "")),
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
                  <span className="hotel-location">📍 {currentHotel.location}</span>
                </div>
              </div>

              <div className="hotel-price-card">
                <span className="hotel-price">{currentHotel.price}</span>
                <span className="hotel-night">per night</span>
              </div>
            </div>

            <button className="book-now-btn book-now-btn--secondary" type="button">
              Book Now
            </button>
          </div>
        </div>

        <div className="hotel-content">
          <section className="detail-section">
            <h2>About</h2>
            <p>{currentHotel.about}</p>
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
                <div className="amenity-pill" key={item.label}>
                  <span className="amenity-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
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
                          <p className="room-price">{room.price}</p>
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

            <button
              className="book-selected-btn"
              type="button"
              disabled={Object.values(roomQuantities).every((qty) => qty === 0)}
            >
              Book Selected Rooms
            </button>
          </section>

          {hasSelectedRooms && (
            <section className="detail-section">
              <h2>Booking Summary</h2>
              <div className="booking-summary">
                <div className="summary-items">
                  {selectedRooms.map((room) => (
                    <div className="summary-item" key={room.id}>
                      <div className="summary-item-main">
                        <h4>{room.name}</h4>
                        <span className="summary-item-qty">x{room.quantity}</span>
                      </div>
                      <div className="summary-item-details">
                        <span className="summary-item-price">{room.price}/room</span>
                        <span className="summary-item-subtotal">
                          ${room.priceValue * room.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
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
                      ${totalPrice}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default HotelDetails;
