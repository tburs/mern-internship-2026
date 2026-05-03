const express = require('express');
const middleware = require('./middleware');
const Bug = require('../models/Bug');
const router = express.Router();

// CREATE BUG
router.post('/', middleware, async (req, res) => {
  try {
    const bug = new Bug({
      ...req.body,
      reportedBy: req.user.userId
    });
    await bug.save();
    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET RECENT BUGS (user's bugs)
router.get('/recent', middleware, async (req, res) => {
  try {
    const bugs = await Bug.find({ reportedBy: req.user.userId })
      .populate('projectId', 'name')
      .populate('reportedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET BUGS BY PROJECT
router.get('/project/:projectId', middleware, async (req, res) => {
  try {
    const bugs = await Bug.find({ projectId: req.params.projectId })
      .populate('reportedBy', 'username')
      .populate('assignedTo', 'username')
      .sort({ createdAt: -1 });
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;