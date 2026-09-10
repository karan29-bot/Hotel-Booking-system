const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth");

// ============================================
// CREATE BOOKING
// ============================================
router.post("/api/bookings", verifyToken, async (req, res) => {
  try {
    const {
      hotel,
      selectedRooms,
      totalRooms,
      totalGuests,
      totalPrice,
      guestDetails,
      checkIn,
      checkOut,
    } = req.body;

    const userId = req.user.id;

    const newBooking = await pool.query(
      `INSERT INTO hotel_bookings (
        user_id,
        hotel_id,
        hotel_name,
        hotel_city,
        selected_rooms,
        total_rooms,
        total_guests,
        total_price,
        guest_first_name,
        guest_last_name,
        guest_email,
        guest_phone,
        country,
        special_requests,
        check_in,
        check_out
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING *`,
      [
        userId,
        hotel.id,
        hotel.name,
        hotel.city,
        JSON.stringify(selectedRooms),
        totalRooms,
        totalGuests,
        totalPrice,
        guestDetails.firstName,
        guestDetails.lastName,
        guestDetails.email,
        guestDetails.phone,
        guestDetails.country,
        guestDetails.specialRequests,
        checkIn,
        checkOut,
      ]
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking.rows[0],
    });
  } catch (err) {
    console.error("Booking error:", err.message);
    res.status(500).json({
      error: "Failed to create booking",
    });
  }
});

// ============================================
// GET MY BOOKINGS
// ============================================
router.get("/api/bookings/mine", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT * FROM hotel_bookings WHERE user_id = $1 ORDER BY check_in DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

module.exports = router;