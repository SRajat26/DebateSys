const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    totalRounds: {
      type: Number,
      required: true,
    },
    currentRound: {
      type: Number,
      default: 0, // 0 means not started, 1 to totalRounds
    },
    roundStatus: {
      type: String,
      enum: ["open", "closed"],
      default: "open", // open: results visible, closed: secret round
    },
    teamSize: {
      type: Number,
      required: true,
    },
    adjudicatorsPerMatch: {
      type: Number,
      required: true,
    },
    venues: {
      type: [String],
      required: true,
    },
    ocMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Pending registration requests (awaiting OC approval)
    pendingTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pendingAdjudicators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // OC-approved registrations (can now check in)
    approvedTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    approvedAdjudicators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Actually checked-in participants (used for match generation)
    checkedInTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    checkedInAdjudicators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["registration", "ongoing", "completed"],
      default: "registration",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Competition", competitionSchema);
