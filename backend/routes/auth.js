const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");           // your existing db.js
const verifyToken = require("../middleware/auth");

// ============================================
// SIGNUP (moved from server.js)
// ============================================
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, hashedPassword]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    res.status(500).json({ error: "An error occurred while creating the user" });
  }
});

module.exports = router;