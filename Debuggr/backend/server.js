const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

/* 🔥 Import FIRST */
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

/* 🔥 SOCKET.IO SETUP */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// make globally accessible
global.io = io;

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

/* Middleware */
app.use(cors());
app.use(express.json());

/* Routes */
const projectRoutes = require("./routes/projects");

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', projectRoutes);
app.use("/api/bugs", require("./routes/bugs"));
app.use('/api/dashboard', require('./routes/dashboard'));

/* testing route */
app.get('/', (req, res) => {
  res.json({ message: 'Debuggr API is running! 🚀' });
});

/* MongoDB connection */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

/* 🔥 IMPORTANT: use server.listen NOT app.listen */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});