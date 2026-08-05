import { useState, useEffect } from "react";
import "./styles/adminCustomers.css";

const API_BASE = "http://localhost:5000";

const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;
const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

const statusClass = (status) => {
  if (status === "Checked In") return "admin-status-checked-in";
  if (status === "Reserved") return "admin-status-reserved";
  return "admin-status-checked-out";
};

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_BASE}/api/admin/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.hotelName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-customers-page">
      <div className="admin-customers-list">
        <h1>Customers</h1>
        <input
          className="admin-customers-search"
          placeholder="Search guests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="admin-customers-items">
            {filtered.map((c) => (
              <div
                className={`admin-customer-item${selected?.id === c.id ? " admin-customer-item--active" : ""}`}
                key={c.id}
                onClick={() => setSelected(c)}
              >
                <div className="admin-customer-avatar">{initials(c.name)}</div>
                <div className="admin-customer-info">
                  <p className="admin-customer-name">{c.name}</p>
                  <p className="admin-customer-hotel">{c.hotelName}</p>
                </div>
                <span className={`admin-status-badge ${statusClass(c.status)}`}>
                  {c.status}
                </span>
              </div>
            ))}
            {filtered.length === 0 && <p className="admin-customers-empty">No guests found.</p>}
          </div>
        )}
      </div>

      <div className="admin-customers-detail">
        {!selected ? (
          <div className="admin-detail-empty">
            <span>🔍</span>
            <p>Select a guest to view details</p>
          </div>
        ) : (
          <div className="admin-detail-card">
            <div className="admin-detail-header">
              <div className="admin-customer-avatar admin-customer-avatar--lg">
                {initials(selected.name)}
              </div>
              <div>
                <h2>{selected.name}</h2>
                <span className={`admin-status-badge ${statusClass(selected.status)}`}>
                  {selected.status}
                </span>
              </div>
            </div>

            <div className="admin-detail-grid">
              <div>
                <span className="admin-detail-label">Email</span>
                <p>{selected.email}</p>
              </div>
              <div>
                <span className="admin-detail-label">Phone</span>
                <p>{selected.phone}</p>
              </div>
              <div>
                <span className="admin-detail-label">Country</span>
                <p>{selected.country}</p>
              </div>
              <div>
                <span className="admin-detail-label">Hotel</span>
                <p>{selected.hotelName}, {selected.hotelCity}</p>
              </div>
              <div>
                <span className="admin-detail-label">Check-in</span>
                <p>{formatDate(selected.checkIn)}</p>
              </div>
              <div>
                <span className="admin-detail-label">Check-out</span>
                <p>{formatDate(selected.checkOut)}</p>
              </div>
              <div>
                <span className="admin-detail-label">Rooms / Guests</span>
                <p>{selected.totalRooms} rooms · {selected.totalGuests} guests</p>
              </div>
              <div>
                <span className="admin-detail-label">Total Paid</span>
                <p>{formatCurrency(selected.totalPrice)}</p>
              </div>
            </div>

            {selected.specialRequests && (
              <div className="admin-detail-notes">
                <span className="admin-detail-label">Special Requests</span>
                <p>{selected.specialRequests}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCustomers;