const express = require("express");
const router = express.Router();

const protect = require('./middleware/auth'); // ✅ FIXED PATH
const Project = require("../models/Project");

/* 🔹 CREATE PROJECT */
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const project = await Project.create({
      title,
      description,
      status: status || "ongoing", // ✅ FIXED
      teamLead: req.user.userId,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("teamLead", "username email");

    res.status(201).json({
      message: "Project created successfully!",
      project: populatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* 🔹 GET USER PROJECTS */
router.get('/my-projects', protect, async (req, res) => { // ✅ FIXED
  try {
    const projects = await Project.find({
      $or: [
        { teamLead: req.user.userId },
        { members: { $elemMatch: { userId: req.user.userId } } }
      ]
    }).populate('teamLead', 'username');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* 🔹 GET ALL PROJECTS */
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("teamLead", "username")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;