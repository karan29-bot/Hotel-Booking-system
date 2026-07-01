
require("dotenv").config();
const verifyToken = require("./middleware/auth");
const bcrypt = require("bcrypt");
const pool = require("./db");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

  res.send("Backend server is running");

});

app.post("/bookings", async (req, res) => {

  const { customerName, hotelName, checkIn, checkOut } = req.body;

  try {

    const newBooking = await pool.query(

      `INSERT INTO bookings
      (customer_name, hotel_name, check_in, check_out)

      VALUES ($1, $2, $3, $4)

      RETURNING *`,

      [customerName, hotelName, checkIn, checkOut]

    );

    res.json(newBooking.rows[0]);

  }

  catch (err) {

    console.error(err.message);

  }

});

app.put("/bookings/:id", async (req,res) =>{
  try{ 
    const { id } = req.params;
    const{
      customerName,
      hotelName,
      checkIn,
      checkOut
    } =req.body;

const updatedBooking = await pool.query(

  `UPDATE bookings
   SET
   customer_name = $1,
   hotel_name = $2,
   check_in = $3,
   check_out = $4
   WHERE id = $5
   RETURNING *`,

  [customerName, hotelName, checkIn, checkOut, id]

);
    res.json(updatedBooking.rows[0]);
  }
catch(err){
    console.error(err.message);
} 
});

app.get("/bookings" ,verifyToken, async (req, res) => {
  try {
    const allBookings = await pool.query(
      "SELECT * FROM bookings"
    );
    res.json(allBookings.rows);
  }
  catch(err){
 console.error(err.message);
  }
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
        const token = jwt.sign (
          {
            id: user.rows[0].id,
            email: user.rows[0].email,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
          
        );
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

app.listen(5000, () => {

  console.log("Server is running on port 5000");

});