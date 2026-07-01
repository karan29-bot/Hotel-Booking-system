import { useRef, useState } from "react";
import HotelCard from "./HotelCard";
import { popularDestinations } from "../data/popularHotels";
import "./PopularHotels.css";

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
