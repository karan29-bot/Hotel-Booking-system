import HotelCard from "./HotelCard";
import { bangaloreHotels, goaHotels } from "../data/popularHotels";
import "./PopularHotels.css";

function PopularHotels() {
  return (
    <section
      id="hotels-section"
      className="popular-hotels"
      aria-labelledby="popular-hotels-title"
    >
      <div className="popular-hotels__inner">
        <h2 id="popular-hotels-title" className="popular-hotels__title">
          Popular Hotels
        </h2>

        <div className="popular-hotels__group">
          <h3 className="popular-hotels__city">Bangalore</h3>
          <div className="popular-hotels__grid">
            {bangaloreHotels.map((hotel) => (
              <HotelCard key={hotel.id} {...hotel} />
            ))}
          </div>
        </div>

        <div className="popular-hotels__group">
          <h3 className="popular-hotels__city">Goa</h3>
          <div className="popular-hotels__grid">
            {goaHotels.map((hotel) => (
              <HotelCard key={hotel.id} {...hotel} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PopularHotels;
