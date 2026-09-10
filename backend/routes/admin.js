const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyAdmin = require("../middleware/verifyAdmin");

// ============================================
// HELPER: Sentiment Analysis
// ============================================
function getSentiment(rating) {
  if (rating >= 4) return "Positive sentiment";
  if (rating === 3) return "Neutral sentiment";
  return "Negative sentiment";
}

// ============================================
// GET ALL CUSTOMERS / BOOKINGS
// ============================================
router.get("/api/admin/customers", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM hotel_bookings
      ORDER BY check_in DESC
    `);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const customers = result.rows.map((booking) => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);

      let status = "Reserved";
      if (today >= checkIn && today <= checkOut) {
        status = "Checked In";
      } else if (today > checkOut) {
        status = "Checked Out";
      }

      return {
        id: booking.id,
        name: `${booking.guest_first_name} ${booking.guest_last_name}`,
        email: booking.guest_email,
        phone: booking.guest_phone,
        country: booking.country,
        hotelName: booking.hotel_name,
        hotelCity: booking.hotel_city,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        totalRooms: booking.total_rooms,
        totalGuests: booking.total_guests,
        totalPrice: booking.total_price,
        selectedRooms: booking.selected_rooms,
        specialRequests: booking.special_requests,
        status,
      };
    });

    res.json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// ============================================
// ADMIN DASHBOARD OVERVIEW STATS
// ============================================
router.get("/api/admin/overview", verifyAdmin, async (req, res) => {
  try {
    const bookingsResult = await pool.query(`SELECT * FROM hotel_bookings`);
    const bookings = bookingsResult.rows;

    const hotelsResult = await pool.query(`SELECT rating, total_rooms, available_rooms, name FROM hotels`);
    const hotels = hotelsResult.rows;

    const totalBookings = bookings.length;
    const uniqueGuests = new Set(bookings.map((b) => b.guest_email)).size;
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
    const avgRating = hotels.length
      ? (hotels.reduce((sum, h) => sum + Number(h.rating), 0) / hotels.length).toFixed(2)
      : 0;

    // Monthly booking trend
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyData = monthNames.map((month) => ({ month, bookings: 0, revenue: 0 }));

    bookings.forEach((b) => {
      const monthIndex = new Date(b.check_in).getMonth();
      monthlyData[monthIndex].bookings += 1;
      monthlyData[monthIndex].revenue += Number(b.total_price);
    });

    // Occupancy per hotel
    const occupancyByHotel = hotels.map((h) => ({
      name: h.name,
      occupancyPercent: h.total_rooms
        ? Math.round(((h.total_rooms - h.available_rooms) / h.total_rooms) * 100)
        : 0,
    }));

    // Upcoming check-ins (next 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    const upcomingCheckIns = bookings
      .filter((b) => {
        const checkIn = new Date(b.check_in);
        return checkIn >= today && checkIn <= weekFromNow;
      })
      .map((b) => ({
        name: `${b.guest_first_name} ${b.guest_last_name}`,
        hotel: b.hotel_name,
        checkIn: b.check_in,
      }))
      .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

    res.json({
      totalBookings,
      uniqueGuests,
      totalRevenue,
      avgRating: Number(avgRating),
      monthlyData,
      occupancyByHotel,
      upcomingCheckIns,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to load overview data" });
  }
});

// ============================================
// ADMIN SCHEDULE (Calendar View)
// ============================================
router.get("/api/admin/schedule", verifyAdmin, async (req, res) => {
  const { month, year } = req.query;

  try {
    const result = await pool.query(`SELECT * FROM hotel_bookings`);
    const bookings = result.rows;

    const targetMonth = Number(month) - 1;
    const targetYear = Number(year);

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    const dayData = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dayData[d] = { checkIns: 0, checkOuts: 0, events: [] };
    }

    bookings.forEach((b) => {
      const checkIn = new Date(b.check_in);
      const checkOut = new Date(b.check_out);

      if (checkIn.getFullYear() === targetYear && checkIn.getMonth() === targetMonth) {
        const d = checkIn.getDate();
        dayData[d].checkIns += 1;
        dayData[d].events.push({ type: "check-in", hotel: b.hotel_name, guest: `${b.guest_first_name} ${b.guest_last_name}` });
      }

      if (checkOut.getFullYear() === targetYear && checkOut.getMonth() === targetMonth) {
        const d = checkOut.getDate();
        dayData[d].checkOuts += 1;
        dayData[d].events.push({ type: "check-out", hotel: b.hotel_name, guest: `${b.guest_first_name} ${b.guest_last_name}` });
      }
    });

    const days = Object.entries(dayData).map(([day, data]) => {
      const total = data.checkIns + data.checkOuts;
      let intensity = "none";
      if (total >= 5) intensity = "peak";
      else if (total >= 2) intensity = "busy";
      else if (total >= 1) intensity = "light";

      return {
        day: Number(day),
        checkIns: data.checkIns,
        checkOuts: data.checkOuts,
        intensity,
        events: data.events,
      };
    });

    res.json({ month: targetMonth + 1, year: targetYear, daysInMonth, days });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to load schedule" });
  }
});

// ============================================
// ADMIN FEEDBACK / REVIEWS
// ============================================
router.get("/api/admin/feedback", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM reviews ORDER BY created_at DESC`);
    const reviews = result.rows;

    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    const recentReviews = reviews.map((r) => ({
      id: r.id,
      guestName: r.guest_name,
      hotelName: r.hotel_name,
      rating: r.rating,
      comment: r.comment,
      date: r.created_at,
      sentiment: getSentiment(r.rating),
    }));

    res.json({ avgRating: Number(avgRating), distribution, recentReviews });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to load feedback" });
  }
});

module.exports = router;