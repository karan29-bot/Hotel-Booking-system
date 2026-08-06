
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfilePage from "./pages/userprofile";
import Booking from "./pages/Booking";
import HotelDetails from "./pages/HotelDetails";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHotels from "./pages/AdminHotels";
import AdminCustomers from "./pages/AdminCustomers";
import AdminFeedback from "./pages/AdminFeedback";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/booking/:hotelId" element={<Booking />} />
      <Route path="/hotel/:hotelId" element={<HotelDetails />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path= "dashboard" element={<AdminDashboard />} />
        <Route path="hotels" element={<AdminHotels />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="feedback" element={<AdminFeedback />} />
      </Route>
    </Routes>
  );
}

export default App;