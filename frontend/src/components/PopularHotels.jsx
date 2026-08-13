import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import HotelCard from "./HotelCard";
import "./PopularHotels.css";

const getDestinationId = (city) =>
  `destination-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const getHotelId = (hotelId) => `hotel-${hotelId}`;

const cityBanners = {
  Bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1600&q=80",
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80",
  Mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&q=80",
  Delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=80",
  Chennai: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80",
};

// fallback if a city isn't in the map above
const defaultBanner = "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1600&q=80";

function PopularHotels({
  popularDestinations = [],
  highlightedDestination = "",
  highlightedHotelId = "",
}){
  const navigate = useNavigate();
  const sliderRefs = useRef({});
  const [isExpanded, setIsExpanded] = useState(false);
  const highlightedIndex = popularDestinations.findIndex(
    (destination) =>
      destination.city === highlightedDestination ||
      destination.hotels.some((hotel) => hotel.id === highlightedHotelId)
  );
  const showAllDestinations = isExpanded || highlightedIndex > 2;

  const scrollSlider = (city, direction) => {
    const container = sliderRefs.current[city];
    if (!container) return;

    const cardWidth = container.querySelector(".hotel-card")?.getBoundingClientRect().width || 280;
    const gap = 24;
    container.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="hotels-section"
      className="popular-hotels"
      aria-labelledby="popular-destinations-title"
    >
      <div className="popular-hotels__inner">
        <h2 id="popular-destinations-title" className="popular-hotels__title">
          Popular Destinations
        </h2>

        <div className={`popular-hotels__destination-list ${showAllDestinations ? "popular-hotels__destination-list--expanded" : ""}`}>
          {popularDestinations.map((destination, index) => {
            const isVisible = index < 3 || showAllDestinations;
            const isHighlighted = destination.city === highlightedDestination;

            return (
              <div
                id={getDestinationId(destination.city)}
                key={destination.city}
                className={`popular-hotels__group ${isVisible ? "" : "popular-hotels__group--hidden"}${isHighlighted ? " popular-hotels__group--highlighted" : ""}`}
                style={{ backgroundImage: `url(${cityBanners[destination.city] || defaultBanner})` }}
              >
                <div className="popular-hotels__header">
                  <h3 className="popular-hotels__city">{destination.city}</h3>
                  <div className="popular-hotels__controls">
                    <button
                      type="button"
                      className="popular-hotels__arrow"
                      onClick={() => scrollSlider(destination.city, "left")}
                      aria-label={`Scroll ${destination.city} left`}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="popular-hotels__arrow"
                      onClick={() => scrollSlider(destination.city, "right")}
                      aria-label={`Scroll ${destination.city} right`}
                    >
                      →
                    </button>
                  </div>
                </div>

                <div
                  ref={(node) => {
                    sliderRefs.current[destination.city] = node;
                  }}
                  className="popular-hotels__slider"
                >
                  {destination.hotels.map((hotel) => (
                    <div
                      id={getHotelId(hotel.id)}
                      key={hotel.id}
                      className={`popular-hotels__slide${hotel.id === highlightedHotelId ? " popular-hotels__slide--highlighted" : ""}`}
                    >
                      <HotelCard
                        {...hotel}
                        onBook={() => navigate(`/hotel/${hotel.id}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {popularDestinations.length > 3 && (
          <button
            type="button"
            className="popular-hotels__toggle"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            {showAllDestinations ? "Show Less" : "Show More Destinations"}
          </button>
        )}
      </div>
    </section>
  );
}

export default PopularHotels;
