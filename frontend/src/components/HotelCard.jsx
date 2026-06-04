import "./HotelCard.css";

function HotelCard({ name, location, rating, pricePerNight, imageUrl }) {
  const handleBookNow = () => {
    alert(`Proceeding to book: ${name}`);
  };

  return (
    <article className="hotel-card">
      <div className="hotel-card__image-container">
        <div
          className="hotel-card__image"
          style={{ backgroundImage: `url(${imageUrl})` }}
          role="img"
          aria-label={name}
        />
        <div className="hotel-card__overlay" />
        <button
          type="button"
          className="hotel-card__book-btn"
          onClick={handleBookNow}
          aria-label={`Book ${name}`}
        >
          Book Now
        </button>
      </div>
      <div className="hotel-card__body">
        <h3 className="hotel-card__name">{name}</h3>
        <p className="hotel-card__location">{location}</p>
        <div className="hotel-card__meta">
          <span className="hotel-card__rating" aria-label={`Rating ${rating} out of 5`}>
            ★ {rating}
          </span>
          <p className="hotel-card__price">
            ₹{pricePerNight.toLocaleString("en-IN")}
            <span className="hotel-card__price-unit"> / night</span>
          </p>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
