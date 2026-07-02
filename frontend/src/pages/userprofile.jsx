import { useState } from "react";
import HotelCard from "../components/HotelCard";
import "./styles/userprofile.css";

// Placeholder data — replace with real API calls to your Express backend
const dummyBookings = [
  { id: 1, hotelName: "The Leela Palace", location: "Old Airport Road, Bangalore", checkIn: "2026-08-10", checkOut: "2026-08-12", status: "Upcoming" },
  { id: 2, hotelName: "Taj West End", location: "Race Course Road, Bangalore", checkIn: "2026-05-02", checkOut: "2026-05-04", status: "Completed" },
];

const dummySavedHotels = [
  { id: 1, name: "ITC Gardenia", location: "Residency Road, Bangalore", rating: 4.7, price: 8200, image: "" },
];

function ProfilePage() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("account");
  const [avatarPreview, setAvatarPreview] = useState(storedUser.avatar || null);
  const [form, setForm] = useState({
    name: storedUser.name || "",
    email: storedUser.email || "",
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    // TODO: upload `file` to backend (multipart/form-data) and store returned URL
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      // TODO: replace with your real endpoint, e.g. PUT /api/users/:id
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          ...(form.password ? { password: form.password } : {}),
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      localStorage.setItem("user", JSON.stringify(updated));
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <div
            className="profile-avatar"
            style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : {}}
          >
            {!avatarPreview && (form.name ? form.name[0].toUpperCase() : "?")}
          </div>
          <label className="profile-avatar-edit" htmlFor="avatar-upload">
            Change photo
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            hidden
          />
        </div>
        <div>
          <h1 className="profile-name">{form.name || "Your Name"}</h1>
          <p className="profile-email">{form.email || "your@email.com"}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === "account" ? "profile-tab--active" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          Account Details
        </button>
        <button
          className={`profile-tab ${activeTab === "bookings" ? "profile-tab--active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          My Bookings
        </button>
        <button
          className={`profile-tab ${activeTab === "saved" ? "profile-tab--active" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          Saved Hotels
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "account" && (
          <form className="profile-form" onSubmit={handleSave}>
            <label className="profile-field">
              <span>Full Name</span>
              <input name="name" value={form.name} onChange={handleChange} />
            </label>
            <label className="profile-field">
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </label>
            <label className="profile-field">
              <span>New Password</span>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
            </label>
            <label className="profile-field">
              <span>Confirm New Password</span>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
            </label>

            {message && <p className="profile-message">{message}</p>}

            <button type="submit" className="profile-save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {activeTab === "bookings" && (
          <div className="profile-bookings">
            {dummyBookings.length === 0 ? (
              <p className="profile-empty">No bookings yet.</p>
            ) : (
              dummyBookings.map((b) => (
                <div key={b.id} className="booking-card">
                  <div>
                    <h3>{b.hotelName}</h3>
                    <p className="booking-location">{b.location}</p>
                    <p className="booking-dates">{b.checkIn} → {b.checkOut}</p>
                  </div>
                  <span className={`booking-status booking-status--${b.status.toLowerCase()}`}>
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="profile-saved-grid">
            {dummySavedHotels.length === 0 ? (
              <p className="profile-empty">No saved hotels yet.</p>
            ) : (
              dummySavedHotels.map((hotel) => (
                <HotelCard key={hotel.id} {...hotel} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;