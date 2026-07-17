import "./HotelCard.css";

function HotelCard({ name, city, location, rating, price, pricePerNight, image, imageUrl, onBook }) {
  const displayLocation = city || location;
  const displayPrice = price ?? pricePerNight;
  const displayImage = image || imageUrl;

  const handleBookNow = () => {
    if (onBook) {
      onBook();
      return;
    }

    alert(`Proceeding to book: ${name}`);
  };

  const stars = Array.from({ length: 5 }, (_, index) => (
    <span
      key={`${name}-star-${index}`}
      className={`hotel-card__star${index < Math.round(rating) ? " hotel-card__star--filled" : ""}`}
      aria-hidden="true"
    >
      ★
    </span>
  ));

  return (
    <article className="hotel-card">
      <div className="hotel-card__image-container">
        <div
          className="hotel-card__image"
          style={{ backgroundImage: `url(${displayImage})` }}
          role="img"
          aria-label={name}
        />
        <div className="hotel-card__overlay" />
      </div>
      <div className="hotel-card__body">
        <h3 className="hotel-card__name">{name}</h3>
        <p className="hotel-card__location">{displayLocation}</p>
        <div className="hotel-card__meta">
          <span className="hotel-card__rating" aria-label={`Rating ${rating} out of 5`}>
            {stars}
            <span className="hotel-card__rating-value">{rating}</span>
          </span>
          <p className="hotel-card__price">
            ₹{displayPrice.toLocaleString("en-IN")}
            <span className="hotel-card__price-unit"> / night</span>
          </p>
        </div>
        <button
          type="button"
          className="hotel-card__book-btn"
          onClick={handleBookNow}
          aria-label={`Book ${name}`}
        >
          Book Now
        </button>
      </div>
    </article>
  );
}

export default HotelCard;
