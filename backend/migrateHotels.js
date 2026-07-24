const path = require("path");
const { pathToFileURL } = require("url");
const pool = require("./db");

const hotelsFilePath = path.resolve(__dirname, "../frontend/src/data/hotels.js");

const insertHotelQuery = `
  INSERT INTO hotels (
    id,
    name,
    city,
    country,
    description,
    image,
    rating,
    price_per_night,
    total_rooms,
    available_rooms,
    amenities,
    highlights,
    rooms,
    created_at
  )
  VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11::jsonb,
    $12::jsonb,
    $13::jsonb,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id
`;

async function loadHotels() {
  const hotelsModule = await import(pathToFileURL(hotelsFilePath).href);
  const hotels = hotelsModule.default || hotelsModule.hotels;

  if (!Array.isArray(hotels)) {
    throw new Error("Expected hotels.js to export an array of hotels.");
  }

  return hotels;
}

function getTotalRooms(rooms) {
  return rooms.reduce((total, room) => total + Number(room.availableRooms || 0), 0);
}

async function migrateHotels() {
  let migratedCount = 0;

  try {
    const hotels = await loadHotels();

    for (const hotel of hotels) {
      const totalRooms = getTotalRooms(hotel.rooms);
      const values = [
        hotel.id,
        hotel.name,
        hotel.city,
        "India",
        hotel.description,
        hotel.image,
        hotel.rating,
        hotel.price,
        totalRooms,
        totalRooms,
        JSON.stringify(hotel.amenities),
        JSON.stringify(hotel.highlights),
        JSON.stringify(hotel.rooms),
      ];

      const result = await pool.query(insertHotelQuery, values);

      if (result.rowCount > 0) {
        migratedCount += 1;
        console.log(`Migrated hotel: ${hotel.name} (${hotel.id})`);
      }
    }

    console.log(`Hotels migrated: ${migratedCount}`);
  } catch (error) {
    console.error("Hotel migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrateHotels();
