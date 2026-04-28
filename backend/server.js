const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

/* ---------- DB ---------- */
mongoose.connect("mongodb://127.0.0.1:27017/doubtsphere")
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log(err));

/* ---------- SCHEMAS ---------- */
const doubtSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, default: "OPEN" },
  acceptedBy: { type: String, default: null }
});

const messageSchema = new mongoose.Schema({
  roomId: String,
  sender: String,
  message: String,
  time: String
});

const Doubt = mongoose.model("Doubt", doubtSchema);
const Message = mongoose.model("Message", messageSchema);

/* ---------- ROUTES ---------- */
app.get("/", (req, res) => res.send("Server running 🚀"));

app.post("/doubt", async (req, res) => {
  const doubt = await Doubt.create(req.body);
  res.json(doubt);
});

app.get("/doubts", async (req, res) => {
  const doubts = await Doubt.find();
  res.json(doubts);
});

app.post("/accept-doubt", async (req, res) => {
  const { doubtId, userId } = req.body;

  const updated = await Doubt.findOneAndUpdate(
    { _id: doubtId, status: "OPEN" },
    { status: "MATCHED", acceptedBy: userId },
    { new: true }
  );

  if (!updated) return res.status(400).json({ error: "Already accepted" });

  res.json(updated);
});

app.delete("/doubt/:id", async (req, res) => {
  await Doubt.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

/* ---------- MESSAGES ---------- */
app.get("/messages/:roomId", async (req, res) => {
  const msgs = await Message.find({ roomId: req.params.roomId });
  res.json(msgs);
});

/* ---------- SOCKET ---------- */
io.on("connection", (socket) => {

  /* ---------- JOIN ROOM ---------- */
  socket.on("join_room", (roomId) => {
    socket.join(roomId);

    // notify other user
    socket.to(roomId).emit("user_connected");
  });

  /* ---------- SEND MESSAGE ---------- */
  socket.on("send_message", async (data) => {
    await Message.create(data);
    io.to(data.roomId).emit("receive_message", data);
  });

  /* ---------- TYPING ---------- */
  socket.on("typing", (user) => {
    socket.broadcast.emit("typing", user);
  });

  /* ---------- SEEN ---------- */
  socket.on("message_seen", (roomId) => {
    socket.to(roomId).emit("seen");
  });

  /* ---------- DISCONNECT ---------- */
  socket.on("disconnect", () => {
    socket.broadcast.emit("user_disconnected");
  });

});

/* ---------- START ---------- */
server.listen(5001, () => {
  console.log("Server running on 5001 🚀");
});
