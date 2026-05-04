const express = require('express');
const protect = require('./middleware/auth');
const Project = require('../models/Project');
const Bug = require('../models/Bug');
const router = express.Router();

// DASHBOARD STATS
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user?.userId;

    // 🔥 Step 1: get all projects user belongs to
    const projects = await Project.find({
      $or: [
        { teamLead: userId },
        { members: { $elemMatch: { userId } } }
      ]
    }).select("_id");

    const projectIds = projects.map(p => p._id);

    // 🔥 Step 2: count bugs in those projects
    const [totalBugs, solvedBugs, totalProjects] = await Promise.all([
      Bug.countDocuments({ projectId: { $in: projectIds } }),
      Bug.countDocuments({ projectId: { $in: projectIds }, status: 'closed' }),
      Project.countDocuments({
        $or: [
          { teamLead: userId },
          { members: { $elemMatch: { userId } } }
        ]
      })
    ]);

    res.json({ totalBugs, solvedBugs, totalProjects });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// RECENT PROJECTS (3 latest)
router.get('/recent-projects', protect, async (req, res) => {
  const projects = await Project.find({
    $or: [
      { teamLead: req.user.userId },
      { members: { $elemMatch: { userId: req.user.userId } } }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('teamLead', 'username')
    .populate('members.userId', 'username');

  res.json(projects);
});


// RECENT BUGS (5 latest)
router.get('/recent-bugs', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { teamLead: req.user.userId },
        { members: { $elemMatch: { userId: req.user.userId } } }
      ]
    }).select("_id");

    const projectIds = projects.map(p => p._id);

    const bugs = await Bug.find({
      $or: [
        { reportedBy: req.user.userId },
        { assignedTo: req.user.userId },
        { projectId: { $in: projectIds } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "projectId",
        select: "title teamLead members",
        populate: [
          { path: "teamLead", select: "username" },
          { path: "members.userId", select: "username" }
        ]
      })
      .populate('reportedBy', 'username')
      .populate('assignedTo', 'username');

    res.json(bugs);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;