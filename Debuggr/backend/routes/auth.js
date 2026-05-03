const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');

console.log('🔄 Auth routes loaded');  //debugging

// register mech
router.post('/register', async (req, res) => {
  console.log('📥 Register request:', req.body); // register debug
  
  try {
    const { username, email, password } = req.body;
    
    console.log('📝 Creating user:', { username, email }); // debugging
    
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      console.log('❌ User exists'); // DEBUG
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ username, email, password });
    await user.save();
    console.log('✅ User saved:', user._id); // DEBUG

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log('🔑 Token created'); // DEBUG
    
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('💥 REGISTER ERROR:', error); // DEBUG
    res.status(500).json({ message: error.message });
  }
});

// LOGIN  
router.post('/login', async (req, res) => {
  console.log('🔑 Login start:', req.body.email);
  
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log('👤 User found:', user ? user.username : 'NOT FOUND');
    
    if (!user) {
      console.log('❌ No user');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('✅ Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('🔑 Token created');

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;