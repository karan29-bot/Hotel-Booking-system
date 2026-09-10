const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================================
// CREATE PAYMENT ORDER
// ============================================
router.post("/api/payment/create-order", verifyToken, async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// ============================================
// VERIFY PAYMENT & CREATE BOOKING
// ============================================
router.post("/api/payment/verify", verifyToken, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingData,
  } = req.body;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed. Signature mismatch." });
    }

    const userId = req.user.id;
    const { hotel, selectedRooms, totalRooms, totalGuests, totalPrice, guestDetails, checkIn, checkOut } = bookingData;

    const newBooking = await pool.query(
      `INSERT INTO hotel_bookings (
        user_id, hotel_id, hotel_name, hotel_city,
        selected_rooms, total_rooms, total_guests, total_price,
        guest_first_name, guest_last_name, guest_email, guest_phone,
        country, special_requests, check_in, check_out,
        razorpay_payment_id, payment_status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [
        userId, hotel.id, hotel.name, hotel.city,
        JSON.stringify(selectedRooms), totalRooms, totalGuests, totalPrice,
        guestDetails.firstName, guestDetails.lastName, guestDetails.email, guestDetails.phone,
        guestDetails.country, guestDetails.specialRequests, checkIn, checkOut,
        razorpay_payment_id, "paid",
      ]
    );

    res.status(201).json({
      message: "Payment verified and booking created",
      booking: newBooking.rows[0],
    });
  } catch (err) {
    console.error("Payment verification error:", err.message);
    res.status(500).json({ error: "Failed to verify payment or create booking" });
  }
});

module.exports = router;