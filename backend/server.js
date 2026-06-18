const pool = require("./db");
const cors = require("cors");
const express = require("express");

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

app.get("/bookings" , async (req, res) => {
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
  try {
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, password]
    );
    res.json(newUser.rows[0]);
  }
catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "An error occurred while creating the user" });
  }

  
});
app.listen(5000, () => {

  console.log("Server is running on port 5000");

});