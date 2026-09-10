require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
const pool = require("./db");

async function getEmbedding(text) {
  const response = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text }),
  });
  const data = await response.json();
  return data.embedding;
}

async function search(question) {
  const queryEmbedding = await getEmbedding(question);

  const result = await pool.query(
    `SELECT content, embedding <=> $1 AS distance
     FROM knowledge_base
     ORDER BY distance ASC
     LIMIT 3`,
    [JSON.stringify(queryEmbedding)]
  );

  console.log(`\nQuestion: "${question}"\n`);
  result.rows.forEach((row, i) => {
    console.log(`${i + 1}. (distance: ${row.distance.toFixed(4)}) ${row.content}`);
  });

  process.exit(0);
}

// Try asking something that doesn't exactly match your stored wording
search("Can I bring my dog?");