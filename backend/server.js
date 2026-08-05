
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env"), override: true });
const verifyToken = require("./middleware/auth");
const bcrypt = require("bcrypt");
const pool = require("./db");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const verifyAdmin = require("./middleware/verifyAdmin");

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
  app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    const validPassword =
      admin.rows.length > 0 &&
      (await bcrypt.compare(password, admin.rows[0].password));

    if (admin.rows.length > 0 && validPassword) {
      const token = jwt.sign(
        {
          id: admin.rows[0].id,
          email: admin.rows[0].email,
          role: "admin",
        },
        process.env.JWT_SECRET,
        { expiresIn: "4h" }
      );
      res.json({
        token,
        admin: {
          id: admin.rows[0].id,
          name: admin.rows[0].name,
          email: admin.rows[0].email,
        },
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "An error occurred while logging in" });
  }
});

  app.get("/api/hotels", async (req, res) => {
  try {
    const hotels = await pool.query(`
      SELECT *
      FROM hotels
      ORDER BY city, name
    `);

    res.json(hotels.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Failed to fetch hotels",
    });
  }
});

// Shared room templates, same as your old frontend hotels.js
const roomDetailsByType = {
  Deluxe: {
    guests: "2 Guests",
    size: "320 sq ft",
    bedType: "King Bed",
    description: "A comfortable room with city views, modern furnishings, and all essential amenities for a relaxed stay.",
    amenities: ["Wi-Fi", "Breakfast", "Work Desk"],
  },
  Executive: {
    guests: "3 Guests",
    size: "420 sq ft",
    bedType: "King Bed",
    description: "A spacious room with premium comforts, a dedicated work area, and enhanced services for business or leisure.",
    amenities: ["Wi-Fi", "Breakfast", "Lounge Access"],
  },
  Suite: {
    guests: "4 Guests",
    size: "650 sq ft",
    bedType: "King Bed",
    description: "An elegant suite with separate living space, upgraded amenities, and extra room for families or longer stays.",
    amenities: ["Wi-Fi", "Breakfast", "Living Area"],
  },
};

function buildRooms(hotelId, roomInputs) {
  return Object.entries(roomInputs).map(([type, { price, availableRooms }]) => ({
    ...roomDetailsByType[type],
    id: `${hotelId}-${type.toLowerCase()}`,
    name: `${type} Room`,
    type,
    price: Number(price),
    availableRooms: Number(availableRooms),
  }));
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueHotelId(name, city) {
  const baseSlug = slugify(`${name}-${city}`);
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await pool.query("SELECT id FROM hotels WHERE id = $1", [slug]);
    if (existing.rows.length === 0) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// GET all hotels (admin)
app.get("/api/admin/hotels", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM hotels ORDER BY city, name");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// CREATE hotel
app.post("/api/admin/hotels", verifyAdmin, async (req, res) => {
  const {
    name, city, country, description, image,
    rating, totalRooms, availableRooms,
    amenities, highlights, roomInputs,
  } = req.body;

  try {
    const id = await generateUniqueHotelId(name, city);
    const rooms = buildRooms(id, roomInputs);

    const result = await pool.query(
      `INSERT INTO hotels (
        id, name, city, country, description, image,
        rating, price_per_night, total_rooms, available_rooms,
        amenities, highlights, rooms
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        id, name, city, country, description, image,
        rating, roomInputs.Deluxe.price, totalRooms, availableRooms,
        JSON.stringify(amenities), JSON.stringify(highlights), JSON.stringify(rooms),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create hotel" });
  }
});

// UPDATE hotel
app.put("/api/admin/hotels/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    name, city, country, description, image,
    rating, totalRooms, availableRooms,
    amenities, highlights, roomInputs,
  } = req.body;

  try {
    const rooms = buildRooms(id, roomInputs);

    const result = await pool.query(
      `UPDATE hotels SET
        name=$1, city=$2, country=$3, description=$4, image=$5,
        rating=$6, price_per_night=$7, total_rooms=$8, available_rooms=$9,
        amenities=$10, highlights=$11, rooms=$12
      WHERE id=$13
      RETURNING *`,
      [
        name, city, country, description, image,
        rating, roomInputs.Deluxe.price, totalRooms, availableRooms,
        JSON.stringify(amenities), JSON.stringify(highlights), JSON.stringify(rooms),
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to update hotel" });
  }
});

// DELETE hotel
app.delete("/api/admin/hotels/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM hotels WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    res.json({ message: "Hotel deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to delete hotel" });
  }
});

app.get("/api/home", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM hotels
      ORDER BY city, name
    `);

    const hotels = result.rows;

    const popularDestinations = hotels.reduce((destinations, hotel) => {
      const existingDestination = destinations.find(
        (destination) => destination.city === hotel.city
      );

      const destinationHotel = {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        rating: Number(hotel.rating),
        price: hotel.price_per_night,
        image: hotel.image,
      };

      if (existingDestination) {
        existingDestination.hotels.push(destinationHotel);
      } else {
        destinations.push({
          city: hotel.city,
          hotels: [destinationHotel],
        });
      }

      return destinations;
    }, []);

    res.json({
      hotels,
      popularDestinations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to load homepage data",
    });
  }
});
  app.get("/api/hotels/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         id, name, city, country, description, image, rating,
         price_per_night AS price,
         amenities, highlights, rooms
       FROM hotels
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    const hotel = result.rows[0];
    hotel.rating = Number(hotel.rating);
    res.json(hotel);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Failed to fetch hotel",
    });
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
// GET all customers/bookings (admin)
app.get("/api/admin/customers", verifyAdmin, async (req, res) => {
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
app.listen(5000, () => {

  console.log("Server is running on port 5000");

});
