const express = require('express');
const protect = require('./middleware/auth');
const Project = require('../models/Project');
const Bug = require('../models/Bug');
const router = express.Router();

// DASHBOARD STATS
router.get('/stats', protect, async (req, res)=> {
  const userId = req.user.userId;
  
  const [totalBugs, solvedBugs, totalProjects] = await Promise.all([
    Bug.countDocuments({ reportedBy: userId }),
    Bug.countDocuments({ reportedBy: userId, status: 'closed' }),
    Project.countDocuments({
      $or: [{ teamLead: userId }, { members: { $elemMatch: { userId } } }]
    })
  ]);
  
  res.json({ totalBugs, solvedBugs, totalProjects });
});

// RECENT PROJECTS (3 latest)
router.get('/recent-projects', protect, async (req, res) => {
  const projects = await Project.find({
    $or: [{ teamLead: req.user.userId }, { members: { $elemMatch: { userId: req.user.userId } } }]
  })
  .sort({ createdAt: -1 })
  .limit(3)
  .populate('teamLead', 'username');
  res.json(projects);
});

// RECENT BUGS (5 latest)
router.get('/recent-bugs', protect, async (req, res) => {
  const bugs = await Bug.find({ reportedBy: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('projectId', 'name');
  res.json(bugs);
});

module.exports = router;