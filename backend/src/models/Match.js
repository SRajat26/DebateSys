const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Role: Team
      required: true,
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Role: Team
      // Can be null if it's a BYE
    },
    isBye: {
      type: Boolean,
      default: false,
    },
    adjudicators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Role: Adjudicator
      },
    ],
    venue: {
      type: String,
      required: true,
    },
    ocRunner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Role: OC
    },
    status: {
      type: String,
      enum: ["pending", "completed", "issue_raised"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
