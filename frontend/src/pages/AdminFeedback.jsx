import { useState, useEffect } from "react";
import "./styles/adminFeedback.css";

const API_BASE = "http://localhost:5000";

const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

function initials(name) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function StarRow({ rating }) {
  return (
    <span className="admin-feedback-stars">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

function AdminFeedback() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_BASE}/api/admin/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Failed to load feedback.</p>;

  const maxCount = Math.max(...data.distribution.map((d) => d.count), 1);

  return (
    <div className="admin-feedback-page">
      <h1>Guest Feedback</h1>
      <p className="admin-feedback-subtitle">Reviews collected across all properties</p>

      <div className="admin-feedback-summary">
        <div className="admin-feedback-avg-card">
          <span className="admin-feedback-avg-number">{data.avgRating}</span>
          <StarRow rating={Math.round(data.avgRating)} />
          <span className="admin-feedback-avg-label">Average rating</span>
        </div>

        <div className="admin-feedback-distribution-card">
          <h3>Rating Distribution</h3>
          {data.distribution.map((d) => (
            <div className="admin-distribution-row" key={d.star}>
              <span>{d.star} ★</span>
              <div className="admin-distribution-bar-track">
                <div
                  className="admin-distribution-bar-fill"
                  style={{ width: `${(d.count / maxCount) * 100}%` }}
                />
              </div>
              <span>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="admin-feedback-recent-title">Recent Reviews</h2>
      {data.recentReviews.length === 0 ? (
        <p className="admin-feedback-empty">No reviews yet.</p>
      ) : (
        <div className="admin-feedback-list">
          {data.recentReviews.map((r) => (
            <div className="admin-feedback-item" key={r.id}>
              <div className="admin-feedback-item-header">
                <div className="admin-customer-avatar">{initials(r.guestName)}</div>
                <div className="admin-feedback-item-meta">
                  <p className="admin-feedback-guest-name">{r.guestName}</p>
                  <p className="admin-feedback-hotel-name">{r.hotelName}</p>
                </div>
                <div className="admin-feedback-item-right">
                  <StarRow rating={r.rating} />
                  <span className="admin-feedback-date">{formatDate(r.date)}</span>
                </div>
              </div>
              <p className="admin-feedback-comment">"{r.comment}"</p>
              <span className="admin-feedback-sentiment">↗ {r.sentiment}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminFeedback;