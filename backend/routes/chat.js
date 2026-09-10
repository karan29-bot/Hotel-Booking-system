const express = require("express");
const router = express.Router();
const pool = require("../db");

// ============================================
// TOOL DEFINITIONS — what the AI is allowed to call
// ============================================
const tools = [
  {
    type: "function",
    function: {
      name: "searchHotels",
      description: "Search for hotels by city, and optionally filter by max price per night or minimum rating.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "The city to search in, e.g. Goa, Mumbai, Bangalore" },
          maxPrice: { type: "number", description: "Maximum price per night in INR" },
          minRating: { type: "number", description: "Minimum star rating, 1-5" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getHotelDetails",
      description: "Get full details for a specific hotel, including room types, prices, and amenities. Use this when the user asks for more information about a specific hotel by name or after searching.",
      parameters: {
        type: "object",
        properties: {
          hotelId: { type: "string", description: "The unique ID of the hotel, e.g. 'blr-001'" },
        },
        required: ["hotelId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "goToBooking",
      description: "Navigate the user to the booking page for a specific hotel once they've decided to book. Only call this when the user has clearly expressed intent to book, e.g. 'book this one' or 'I'll take the second one'.",
      parameters: {
        type: "object",
        properties: {
          hotelId: { type: "string", description: "The unique ID of the hotel to book, e.g. 'blr-001'" },
        },
        required: ["hotelId"],
      },
    },
  },
];

// ============================================
// TOOL FUNCTIONS — the real code that runs when the AI asks
// ============================================
async function searchHotels({ city, maxPrice, minRating }) {
  let query = "SELECT id, name, city, rating, price_per_night FROM hotels WHERE LOWER(city) = LOWER($1)";
  const params = [city];

  if (maxPrice) {
    params.push(maxPrice);
    query += ` AND price_per_night <= $${params.length}`;
  }
  if (minRating) {
    params.push(minRating);
    query += ` AND rating >= $${params.length}`;
  }

  const result = await pool.query(query, params);
  return result.rows;
}

async function getHotelDetails({ hotelId }) {
  const result = await pool.query(
    `SELECT id, name, city, description, rating, price_per_night, amenities, highlights, rooms
     FROM hotels WHERE id = $1`,
    [hotelId]
  );

  if (result.rows.length === 0) {
    return { error: "Hotel not found" };
  }

  return result.rows[0];
}

async function goToBooking({ hotelId }) {
  const result = await pool.query(
    `SELECT id, name, city, description, image, rating, price_per_night AS price, amenities, highlights, rooms
     FROM hotels WHERE id = $1`,
    [hotelId]
  );

  if (result.rows.length === 0) {
    return { error: "Hotel not found" };
  }

  return { action: "navigate", url: `/hotel/${hotelId}`, hotel: result.rows[0] };
}

// ============================================
// CHAT ENDPOINT
// ============================================
router.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch("https://ollama.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL,
        messages,
        tools,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Ollama Cloud error:", data);
      return res.status(500).json({ error: "Failed to get a response" });
    }

    const aiMessage = data.message;

    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      const toolCall = aiMessage.tool_calls[0];
      const args = toolCall.function.arguments;

      let toolResult;
      if (toolCall.function.name === "searchHotels") {
        toolResult = await searchHotels(args);
      } else if (toolCall.function.name === "getHotelDetails") {
        toolResult = await getHotelDetails(args);
      } else if (toolCall.function.name === "goToBooking") {
        toolResult = await goToBooking(args);
      }

      const followUpMessages = [
        ...messages,
        aiMessage,
        {
          role: "tool",
          content: JSON.stringify(toolResult),
        },
      ];

      const followUpResponse = await fetch("https://ollama.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL,
          messages: followUpMessages,
          stream: false,
        }),
      });

      const followUpData = await followUpResponse.json();

      const responsePayload = { reply: followUpData.message.content };

      if (toolCall.function.name === "goToBooking" && toolResult && !toolResult.error) {
        responsePayload.navigateTo = toolResult.url;
      }

      return res.json(responsePayload);
    }

    res.json({ reply: aiMessage.content });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Failed to get a response" });
  }
});

module.exports = router;