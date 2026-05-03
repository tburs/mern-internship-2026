const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title required"],
    },

    description: String,

    status: {
      type: String,
      enum: ["ongoing", "paused", "completed"],
      default: "ongoing",
    },

    projectKey: {
      type: String,
      unique: true,
      default: () => nanoid(6).toUpperCase(), // ✅ Auto-generated 6 uppercase chars
    },

    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

members: [
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      default: "member",
    },
  },
],

  },
  { timestamps: true }
  
);

module.exports = mongoose.model("Project", projectSchema);