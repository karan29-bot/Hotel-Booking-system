require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
const pool = require("./db");

// Real FAQ content for your hotel app — edit/expand these as you like
const knowledgeEntries = [
  "Check-in time is 2:00 PM and check-out time is 11:00 AM at all our properties.",
  "We offer free cancellation up to 48 hours before your check-in date. Cancellations within 48 hours are non-refundable.",
  "Pets are not allowed at any of our properties at this time.",
  "All rooms include free Wi-Fi, and most properties offer complimentary breakfast — check the specific hotel's amenities for details.",
  "We accept payments via credit card, debit card, UPI, and net banking through our secure Razorpay checkout.",
  "You can view and manage your bookings anytime by logging in and visiting your Profile page under 'My Bookings'.",
];

async function getEmbedding(text) {
  const response = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text }),
  });
  const data = await response.json();
  return data.embedding;
}

async function ingest() {
  for (const content of knowledgeEntries) {
    const embedding = await getEmbedding(content);

    await pool.query(
      "INSERT INTO knowledge_base (content, embedding) VALUES ($1, $2)",
      [content, JSON.stringify(embedding)]
    );

    console.log("Inserted:", content.slice(0, 50) + "...");
  }

  console.log("Done ingesting knowledge base.");
  process.exit(0);
}

ingest();