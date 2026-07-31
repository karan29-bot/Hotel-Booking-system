import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "./styles/adminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-brand">
            <span className="admin-brand-icon" aria-hidden="true">🏨</span>
            <span className="admin-brand-name">Grandeur</span>
          </div>

          <nav className="admin-nav">
            <NavLink to="/admin/dashboard" end className="admin-nav-item">
              <span className="admin-nav-icon">▦</span> Overview
            </NavLink>
            <NavLink to="/admin/hotels" className="admin-nav-item">
              <span className="admin-nav-icon">🏠</span> Hotels
            </NavLink>
            <NavLink to="/admin/customers" className="admin-nav-item">
              <span className="admin-nav-icon">👤</span> Customers
            </NavLink>
            <NavLink to="/admin/feedback" className="admin-nav-item">
              <span className="admin-nav-icon">💬</span> Feedback
            </NavLink>
            <NavLink to="/admin/schedule" className="admin-nav-item">
              <span className="admin-nav-icon">📅</span> Schedule
            </NavLink>
          </nav>
        </div>

        <div className="admin-sidebar-bottom">
          <p className="admin-user-name">{admin.name || "Admin User"}</p>
          <p className="admin-user-email">{admin.email || ""}</p>
          <button className="admin-signout-btn" onClick={handleSignOut}>
            ⎋ Sign out
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;