import { useRef, useState } from "react";
import HotelCard from "./HotelCard";
import { popularDestinations } from "../data/popularHotels";
import "./PopularHotels.css";
const cityBanners = {
  Bangalore: "https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1600&q=80",
  Goa: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
  Mumbai: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
  Delhi: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  Chennai: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1600&q=80",
};

// fallback if a city isn't in the map above
const defaultBanner = "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1600&q=80";

function PopularHotels() {
  const sliderRefs = useRef({});
  const [isExpanded, setIsExpanded] = useState(false);

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

        <div className={`popular-hotels__destination-list ${isExpanded ? "popular-hotels__destination-list--expanded" : ""}`}>
          {popularDestinations.map((destination, index) => {
            const isVisible = index < 3 || isExpanded;

            return (
              <div
                key={destination.city}
                className={`popular-hotels__group ${isVisible ? "" : "popular-hotels__group--hidden"}`}
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
                    <div key={hotel.id} className="popular-hotels__slide">
                      <HotelCard {...hotel} />
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
            {isExpanded ? "Show Less" : "Show More Destinations"}
          </button>
        )}
      </div>
    </section>
  );
}

export default PopularHotels;
