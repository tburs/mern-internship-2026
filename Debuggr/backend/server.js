const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json()); 

/* Routes */
const projectRoutes = require("./routes/projects");

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', require('./routes/dashboard'));

/* testing route */
app.get('/', (req, res) => {
  res.json({ message: 'Debuggr API is running! 🚀' });
});

/*  mongoDB connection */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

/* Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});