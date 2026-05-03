const express = require("express");
const router = express.Router();

const protect = require('./middleware/auth'); 
const Project = require("../models/Project");

//creating project
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const project = await Project.create({
      title,
      description,
      status: status || "ongoing", 
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


/* to join project */
router.post("/join", protect, async (req, res) => {
  try {
    const { projectKey } = req.body;

    const project = await Project.findOne({ projectKey });

    if (!project) {
      return res.status(404).json({ message: "Invalid project key" });
    }

    // ❌ already member?
    const alreadyMember =
      project.teamLead.toString() === req.user.userId ||
      project.members.some(
        (m) => m.userId.toString() === req.user.userId
      );

    if (alreadyMember) {
      return res.status(400).json({ message: "Already in project" });
    }

    // ✅ add user
    project.members.push({
      userId: req.user.userId,
      role: "member",
    });

    await project.save();

    res.json({ message: "Joined project successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//till here

/* to get the user projects*/
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

/*  to get all projects */
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

//backend route for status changing in dashboard
router.put("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // only allow team lead to update
    if (project.teamLead.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    project.status = status;
    await project.save();

    res.json({ message: "Status updated", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;