const express = require("express");
const app = express();

app.use(express.json());

// 👉 Store doubts in memory
let doubts = [];

// 👉 Test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// 👉 POST doubt API
app.post("/doubt", (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description required" });
  }

  const newDoubt = {
    id: doubts.length + 1,
    title,
    description,
    status: "OPEN",
  };

  doubts.push(newDoubt);
  res.json(newDoubt);
});

// 👉 Start server (ALWAYS LAST)
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
app.get("/doubts", (req, res) => {
  res.json(doubts);
});