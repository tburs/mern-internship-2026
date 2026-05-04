const express = require("express");
const router = express.Router();

const protect = require("./middleware/auth");
const Bug = require("../models/Bug");
const Project = require("../models/Project");

/* CREATE BUG */
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      priority,
      status,
      assignedTo,
    } = req.body;

    const bug = await Bug.create({
      title,
      description,
      projectId,
      priority,
      status,
      assignedTo,
      reportedBy: req.user.userId,
    });

    const populatedBug = await Bug.findById(bug._id)
      .populate({
        path: "projectId",
        select: "title teamLead members",
        populate: [
          { path: "teamLead", select: "username" },
          { path: "members.userId", select: "username" },
        ],
      })
      .populate("reportedBy", "username")
      .populate("assignedTo", "username");

    res.status(201).json({ bug: populatedBug });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET USER BUGS */
router.get("/", protect, async (req, res) => {
  try {
    const bugs = await Bug.find({
      $or: [
        { reportedBy: req.user.userId },
        { assignedTo: req.user.userId },
      ],
    })
      .populate({
        path: "projectId",
        select: "title teamLead members",
        populate: [
          { path: "teamLead", select: "username" },
          { path: "members.userId", select: "username" },
        ],
      })
      .populate("reportedBy", "username")
      .populate("assignedTo", "username")
      .sort({ createdAt: -1 });

    res.json(bugs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE BUG (role-based) */
router.put("/:id", protect, async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) return res.status(404).json({ message: "Bug not found" });

    const project = await Project.findById(bug.projectId);

    const isReporter = bug.reportedBy.toString() === req.user.userId;
    const isTeamLead = project.teamLead.toString() === req.user.userId;
    const isAssigned =
      bug.assignedTo && bug.assignedTo.toString() === req.user.userId;

    /* STATUS → assigned user OR TL/reporter if unassigned */
    if (req.body.status) {
      if (isAssigned || (!bug.assignedTo && (isReporter || isTeamLead))) {
        bug.status = req.body.status;
      } else {
        return res
          .status(403)
          .json({ message: "Not allowed to change status" });
      }
    }

    /* PRIORITY → TL or reporter */
    if (req.body.priority) {
      if (isReporter || isTeamLead) {
        bug.priority = req.body.priority;
      } else {
        return res
          .status(403)
          .json({ message: "Not allowed to change priority" });
      }
    }

    /* ASSIGN → TL or reporter */
    if ("assignedTo" in req.body) {
      if (isReporter || isTeamLead) {
        bug.assignedTo = req.body.assignedTo || null;
      } else {
        return res
          .status(403)
          .json({ message: "Not allowed to assign bug" });
      }
    }

    await bug.save();

    const updatedBug = await Bug.findById(bug._id)
      .populate({
        path: "projectId",
        select: "title teamLead members",
        populate: [
          { path: "teamLead", select: "username" },
          { path: "members.userId", select: "username" },
        ],
      })
      .populate("reportedBy", "username")
      .populate("assignedTo", "username");

    res.json(updatedBug);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE BUG (only team lead or bug creator) */
router.delete("/:id", protect, async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    const project = await Project.findById(bug.projectId);

    const isAllowed =
      bug.reportedBy.toString() === req.user.userId ||
      project.teamLead.toString() === req.user.userId;

    if (!isAllowed) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await bug.deleteOne();

    res.json({ message: "Bug deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;