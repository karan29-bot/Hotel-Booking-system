const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyAdmin = require("../middleware/verifyAdmin");

// ============================================
// HELPER DATA & FUNCTIONS
// ============================================

// These room templates are shared by all hotels
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

// Takes room inputs from the admin form and builds full room objects
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

// Converts "My Hotel" → "my-hotel"
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Converts "new york" → "New York"
function normalizeCity(city) {
  return city
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Makes sure no two hotels have the same ID
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

// ============================================
// PUBLIC ROUTES (No login required)
// ============================================

// GET all hotels
router.get("/api/hotels", async (req, res) => {
  try {
    const hotels = await pool.query(`
      SELECT *
      FROM hotels
      ORDER BY city, name
    `);
    res.json(hotels.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// GET single hotel by ID
router.get("/api/hotels/:id", async (req, res) => {
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
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch hotel" });
  }
});

// GET homepage data (hotels + grouped by city)
router.get("/api/home", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM hotels
      ORDER BY city, name
    `);

    const hotels = result.rows;

    const popularDestinations = hotels.reduce((destinations, hotel) => {
      const existingDestination = destinations.find(
        (destination) => destination.city.toLowerCase() === hotel.city.toLowerCase()
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

    res.json({ hotels, popularDestinations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load homepage data" });
  }
});

// ============================================
// ADMIN ROUTES (Login + admin role required)
// ============================================

// GET all hotels (admin view)
router.get("/api/admin/hotels", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM hotels ORDER BY city, name");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// CREATE hotel
router.post("/api/admin/hotels", verifyAdmin, async (req, res) => {
  let {
    name, city, country, description, image,
    rating, totalRooms, availableRooms,
    amenities, highlights, roomInputs,
  } = req.body;

  try {
    city = normalizeCity(city);
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
router.put("/api/admin/hotels/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  let {
    name, city, country, description, image,
    rating, totalRooms, availableRooms,
    amenities, highlights, roomInputs,
  } = req.body;

  try {
    city = normalizeCity(city);
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
router.delete("/api/admin/hotels/:id", verifyAdmin, async (req, res) => {
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

module.exports = router;