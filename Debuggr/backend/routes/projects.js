const express = require("express");
const router = express.Router();

const protect = require("./middleware/auth");
const Project = require("../models/Project");

/* CREATE PROJECT */
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
      .populate("teamLead", "username email")
      .populate("members.userId", "username");

    // 🔥 SOCKET
    global.io.emit("projectCreated", populatedProject);

    res.status(201).json({
      message: "Project created successfully!",
      project: populatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* JOIN PROJECT */
router.post("/join", protect, async (req, res) => {
  try {
    const { projectKey } = req.body;

    const project = await Project.findOne({ projectKey });

    if (!project) {
      return res.status(404).json({ message: "Invalid project key" });
    }

    const alreadyMember =
      project.teamLead.toString() === req.user.userId ||
      project.members.some(
        (m) => m.userId.toString() === req.user.userId
      );

    if (alreadyMember) {
      return res.status(400).json({ message: "Already in project" });
    }

    project.members.push({
      userId: req.user.userId,
      role: "member",
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate("teamLead", "username")
      .populate("members.userId", "username");

    // 🔥 SOCKET
    global.io.emit("projectJoined", populatedProject);

    res.json({ message: "Joined project successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET USER PROJECTS */
router.get("/my-projects", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { teamLead: req.user.userId },
        { members: { $elemMatch: { userId: req.user.userId } } },
      ],
    })
      .populate("teamLead", "username")
      .populate("members.userId", "username");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* GET ALL PROJECTS */
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("teamLead", "username")
      .populate("members.userId", "username")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* UPDATE PROJECT STATUS */
router.put("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.teamLead.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    project.status = status;
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("teamLead", "username")
      .populate("members.userId", "username");

    // 🔥 SOCKET
    global.io.emit("projectUpdated", updatedProject);

    res.json({ message: "Status updated", project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* DELETE PROJECT */
router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.teamLead.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await project.deleteOne();

    // 🔥 SOCKET
    global.io.emit("projectDeleted", project._id);

    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;