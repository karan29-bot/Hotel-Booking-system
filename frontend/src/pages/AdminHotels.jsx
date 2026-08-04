import { useState, useEffect } from "react";
import "./styles/adminHotels.css";

const API_BASE = "http://localhost:5000";

const emptyRoomInputs = {
  Deluxe: { price: "", availableRooms: "" },
  Executive: { price: "", availableRooms: "" },
  Suite: { price: "", availableRooms: "" },
};

const emptyForm = {
  name: "",
  city: "",
  country: "",
  description: "",
  image: "",
  rating: "",
  totalRooms: "",
  availableRooms: "",
  amenities: [],
  highlights: [],
  roomInputs: emptyRoomInputs,
};

function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [amenityInput, setAmenityInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("adminToken");

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/hotels`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setHotels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setAmenityInput("");
    setHighlightInput("");
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (hotel) => {
    setEditingId(hotel.id);
    setForm({
      name: hotel.name || "",
      city: hotel.city || "",
      country: hotel.country || "",
      description: hotel.description || "",
      image: hotel.image || "",
      rating: hotel.rating ?? "",
      totalRooms: hotel.total_rooms ?? "",
      availableRooms: hotel.available_rooms ?? "",
      amenities: hotel.amenities || [],
      highlights: hotel.highlights || [],
      roomInputs: (hotel.rooms || []).reduce((acc, room) => {
        acc[room.type] = { price: room.price, availableRooms: room.availableRooms };
        return acc;
      }, structuredClone(emptyRoomInputs)),
    });
    setAmenityInput("");
    setHighlightInput("");
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoomChange = (type, field, value) => {
    setForm((prev) => ({
      ...prev,
      roomInputs: {
        ...prev.roomInputs,
        [type]: { ...prev.roomInputs[type], [field]: value },
      },
    }));
  };

  const addAmenity = () => {
    if (!amenityInput.trim()) return;
    setForm((prev) => ({ ...prev, amenities: [...prev.amenities, amenityInput.trim()] }));
    setAmenityInput("");
  };

  const removeAmenity = (item) => {
    setForm((prev) => ({ ...prev, amenities: prev.amenities.filter((a) => a !== item) }));
  };

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, highlightInput.trim()] }));
    setHighlightInput("");
  };

  const removeHighlight = (item) => {
    setForm((prev) => ({ ...prev, highlights: prev.highlights.filter((h) => h !== item) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      ...form,
      rating: Number(form.rating),
      totalRooms: Number(form.totalRooms),
      availableRooms: Number(form.availableRooms),
    };

    const url = editingId
      ? `${API_BASE}/api/admin/hotels/${editingId}`
      : `${API_BASE}/api/admin/hotels`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        return;
      }

      setModalOpen(false);
      fetchHotels();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hotel? This cannot be undone.")) return;

    try {
      await fetch(`${API_BASE}/api/admin/hotels/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchHotels();
    } catch (err) {
      console.error(err);
    }
  };

  const occupancyPercent = (hotel) => {
    if (!hotel.total_rooms) return 0;
    const booked = hotel.total_rooms - hotel.available_rooms;
    return Math.round((booked / hotel.total_rooms) * 100);
  };

  return (
    <div className="admin-hotels-page">
      <div className="admin-hotels-header">
        <div>
          <h1>Hotels</h1>
          <p>{hotels.length} properties</p>
        </div>
        <button className="admin-add-hotel-btn" onClick={openAddModal}>
          + Add Hotel
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-hotels-grid">
          {hotels.map((hotel) => (
            <div className="admin-hotel-card" key={hotel.id}>
              <img src={hotel.image} alt={hotel.name} className="admin-hotel-image" />
              <div className="admin-hotel-card-body">
                <div className="admin-hotel-card-top">
                  <h3>{hotel.name}</h3>
                  <span className="admin-hotel-rating">★ {hotel.rating}</span>
                </div>
                <p className="admin-hotel-location">📍 {hotel.city}, {hotel.country}</p>

                <div className="admin-hotel-occupancy">
                  <div className="admin-occupancy-labels">
                    <span>Occupancy</span>
                    <span>{occupancyPercent(hotel)}%</span>
                  </div>
                  <div className="admin-occupancy-bar">
                    <div
                      className="admin-occupancy-fill"
                      style={{ width: `${occupancyPercent(hotel)}%` }}
                    />
                  </div>
                </div>

                <div className="admin-hotel-card-footer">
                  <span>{hotel.available_rooms} rooms free</span>
                  <div className="admin-hotel-actions">
                    <button onClick={() => openEditModal(hotel)} title="Edit">✏️</button>
                    <button onClick={() => handleDelete(hotel.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingId ? "Edit Hotel" : "Add New Hotel"}</h2>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <label>
                HOTEL NAME
                <input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. The Grand Meridian"
                  required
                />
              </label>

              <div className="admin-form-row">
                <label>
                  CITY
                  <input
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="City"
                    required
                  />
                </label>
                <label>
                  COUNTRY
                  <input
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    placeholder="Country"
                    required
                  />
                </label>
              </div>

              <label>
                IMAGE URL
                <input
                  value={form.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                  placeholder="https://..."
                  required
                />
              </label>

              <label>
                DESCRIPTION
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Short description of the hotel"
                  rows={3}
                  required
                />
              </label>

              <div className="admin-form-row">
                <label>
                  TOTAL ROOMS
                  <input
                    type="number"
                    value={form.totalRooms}
                    onChange={(e) => handleChange("totalRooms", e.target.value)}
                    placeholder="120"
                    required
                  />
                </label>
                <label>
                  AVAILABLE ROOMS
                  <input
                    type="number"
                    value={form.availableRooms}
                    onChange={(e) => handleChange("availableRooms", e.target.value)}
                    placeholder="40"
                    required
                  />
                </label>
                <label>
                  RATING
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => handleChange("rating", e.target.value)}
                    placeholder="4.5"
                    required
                  />
                </label>
              </div>

              <label>
                AMENITIES
                <div className="admin-tag-input-row">
                  <input
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    placeholder="e.g. Pool"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addAmenity(); }
                    }}
                  />
                  <button type="button" onClick={addAmenity}>Add</button>
                </div>
              </label>
              <div className="admin-tag-list">
                {form.amenities.map((item) => (
                  <span className="admin-tag" key={item}>
                    {item} <button type="button" onClick={() => removeAmenity(item)}>✕</button>
                  </span>
                ))}
              </div>

              <label>
                HIGHLIGHTS
                <div className="admin-tag-input-row">
                  <input
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    placeholder="e.g. Central business location"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addHighlight(); }
                    }}
                  />
                  <button type="button" onClick={addHighlight}>Add</button>
                </div>
              </label>
              <div className="admin-tag-list">
                {form.highlights.map((item) => (
                  <span className="admin-tag" key={item}>
                    {item} <button type="button" onClick={() => removeHighlight(item)}>✕</button>
                  </span>
                ))}
              </div>

              <div className="admin-room-types-section">
                <h3>Room Types</h3>
                {["Deluxe", "Executive", "Suite"].map((type) => (
                  <div className="admin-room-type-row" key={type}>
                    <span className="admin-room-type-label">{type}</span>
                    <label>
                      Price/night
                      <input
                        type="number"
                        value={form.roomInputs[type].price}
                        onChange={(e) => handleRoomChange(type, "price", e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Available
                      <input
                        type="number"
                        value={form.roomInputs[type].availableRooms}
                        onChange={(e) => handleRoomChange(type, "availableRooms", e.target.value)}
                        required
                      />
                    </label>
                  </div>
                ))}
              </div>

              {error && <p className="admin-modal-error">{error}</p>}

              <button type="submit" className="admin-modal-submit">
                {editingId ? "Save Changes" : "Add Hotel"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHotels;