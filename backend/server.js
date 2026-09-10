const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env"), override: true });

const pool = require("./db");
const cors = require("cors");
const express = require("express");
const app = express();

const authRoutes = require("./routes/auth");
const hotelRoutes = require("./routes/hotels");
const bookingRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin");
const reviewsRoutes = require("./routes/reviews");
const paymentsRoutes = require("./routes/payments");
const chatRoutes = require("./routes/chat");

app.use(cors());
app.use(express.json());
// ========== ROUTES ==========
app.use(authRoutes);
app.use(hotelRoutes);
app.use(bookingRoutes);
app.use(adminRoutes);
app.use(reviewsRoutes);
app.use(paymentsRoutes);
app.use(chatRoutes);
app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});