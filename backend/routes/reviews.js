const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middleware/auth");

// ============================================
// CUSTOMER SUBMITS A REVIEW
// ============================================
router.post("/api/reviews", verifyToken, async (req, res) => {
  const { hotelId, hotelName, rating, comment } = req.body;
  const userId = req.user.id;

  try {
    const userResult = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
    const guestName = userResult.rows[0]?.name || "Guest";

    const newReview = await pool.query(
      `INSERT INTO reviews (user_id, hotel_id, hotel_name, guest_name, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, hotelId, hotelName, guestName, rating, comment]
    );

    res.status(201).json(newReview.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

module.exports = router;