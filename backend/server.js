const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const app = express();

/* -------------------------
   MIDDLEWARE (MUST BE TOP)
--------------------------*/
mongoose.connect("mongodb://127.0.0.1:27017/doubtsphere")
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log(err));
app.use(cors());
app.use(express.json());

/* -------------------------
   IN-MEMORY STORAGE
--------------------------*/
const doubtSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, default: "OPEN" },
  acceptedBy: { type: String, default: null }
});

const Doubt = mongoose.model("Doubt", doubtSchema);

/* -------------------------
   TEST ROUTE
--------------------------*/
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

/* -------------------------
   CREATE DOUBT
--------------------------*/
app.post("/doubt", async (req, res) => {
  const { title, description } = req.body;

  const newDoubt = await Doubt.create({
    title,
    description
  });

  res.json(newDoubt);
});

/* -------------------------
   GET ALL DOUBTS
--------------------------*/
app.get("/doubts", async (req, res) => {
  try {
    const doubts = await Doubt.find();
    res.json(doubts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------
   UPDATE DOUBT
--------------------------*/
app.put("/doubt/:id", async (req, res) => {
  const updated = await Doubt.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});

/* -------------------------
   ACCEPT DOUBT (CORE FEATURE)
--------------------------*/
app.post("/accept-doubt", async (req, res) => {
  const { doubtId, userId } = req.body;

  try {
    const updated = await Doubt.findOneAndUpdate(
      {
        _id: doubtId,
        status: "OPEN"   // 🔥 KEY CONDITION
      },
      {
        status: "MATCHED",
        acceptedBy: userId
      },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ error: "Already accepted" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------
   DELETE DOUBT
--------------------------*/
app.delete("/doubt/:id", async (req, res) => {
  const deleted = await Doubt.findByIdAndDelete(req.params.id);
  res.json(deleted);
});

/* -------------------------
   START SERVER
--------------------------*/
app.listen(5001, () => {
  console.log("Server running on port 5001");
});