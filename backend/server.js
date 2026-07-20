
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env"), override: true });
const verifyToken = require("./middleware/auth");
const bcrypt = require("bcrypt");
const pool = require("./db");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

const jwtSecretDebug = () => ({
  exists: Boolean(process.env.JWT_SECRET),
  length: process.env.JWT_SECRET?.length || 0,
  preview: process.env.JWT_SECRET
    ? `${process.env.JWT_SECRET.slice(0, 2)}...${process.env.JWT_SECRET.slice(-2)}`
    : null,
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

  res.send("Backend server is running");

});



app.post("/signup", async (req, res) => {
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
  }
catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "An error occurred while creating the user" });
  } })

  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      const validPassword =
  user.rows.length > 0 &&
  await bcrypt.compare(password, user.rows[0].password);

      if (user.rows.length > 0 && validPassword) {
        console.log("[login] JWT_SECRET:", jwtSecretDebug());

        const token = jwt.sign (
          {
            id: user.rows[0].id,
            email: user.rows[0].email,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
          
        );
        console.log("[login] issued token debug:", {
          userId: user.rows[0].id,
          tokenParts: token.split(".").length,
          tokenPreview: `${token.slice(0, 16)}...${token.slice(-16)}`,
        });
        res.json({ token, user: user.rows[0] });
      }
      else {
        res.status(401).json({ error: "Invalid email or password" });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "An error occurred while logging in" });
    }
  });
  
  app.post("/api/bookings", verifyToken, async (req, res) => {
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

    // User ID comes from the verified JWT
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

app.listen(5000, () => {

  console.log("Server is running on port 5000");

});
