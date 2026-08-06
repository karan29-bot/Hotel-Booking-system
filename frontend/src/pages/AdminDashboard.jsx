import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import "./styles/adminDashboard.css";

const API_BASE = "http://localhost:5000";

const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" });

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_BASE}/api/admin/overview`, {
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

    fetchOverview();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Failed to load dashboard data.</p>;

  return (
    <div className="admin-dashboard-page">
      <h1>Dashboard Overview</h1>
      <p className="admin-dashboard-subtitle">Real-time performance across all properties</p>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Bookings</span>
          <span className="admin-stat-value">{data.totalBookings}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Unique Guests</span>
          <span className="admin-stat-value">{data.uniqueGuests}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Revenue</span>
          <span className="admin-stat-value">{formatCurrency(data.totalRevenue)}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Avg Rating</span>
          <span className="admin-stat-value">{data.avgRating}</span>
        </div>
      </div>

      <div className="admin-charts-row">
        <div className="admin-chart-card">
          <h3>Booking Trend</h3>
          <p className="admin-chart-subtitle">Monthly bookings</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece5d8" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#8a8a8a" />
              <YAxis tick={{ fontSize: 12 }} stroke="#8a8a8a" />
              <Tooltip />
              <Line type="monotone" dataKey="bookings" stroke="#a5490f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-card">
          <h3>Occupancy by Hotel</h3>
          <p className="admin-chart-subtitle">% rooms currently booked</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.occupancyByHotel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece5d8" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#8a8a8a" hide={data.occupancyByHotel.length > 6} />
              <YAxis tick={{ fontSize: 12 }} stroke="#8a8a8a" />
              <Tooltip />
              <Bar dataKey="occupancyPercent" fill="#d98c3f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-chart-card admin-revenue-card">
        <h3>Revenue Trend</h3>
        <p className="admin-chart-subtitle">Monthly revenue</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a2a1a" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#b8ac9c" />
            <YAxis tick={{ fontSize: 12 }} stroke="#b8ac9c" />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#d98c3f" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="admin-checkins-card">
        <h3>Upcoming Check-ins (next 7 days)</h3>
        {data.upcomingCheckIns.length === 0 ? (
          <p className="admin-checkins-empty">No check-ins scheduled in the next 7 days.</p>
        ) : (
          <div className="admin-checkins-list">
            {data.upcomingCheckIns.map((c, i) => (
              <div className="admin-checkin-item" key={i}>
                <div>
                  <p className="admin-checkin-name">{c.name}</p>
                  <p className="admin-checkin-hotel">{c.hotel}</p>
                </div>
                <span className="admin-checkin-date">{formatDate(c.checkIn)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;