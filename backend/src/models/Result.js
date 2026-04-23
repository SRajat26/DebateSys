const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    // Adjudicator submission
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Role: Adjudicator
      required: true,
    },
    winningTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Role: Team, null if draw
    },
    teamAScore: {
      type: Number,
      required: true,
    },
    teamBScore: {
      type: Number,
      // If it's a BYE, team B won't have a score, or team A gets dummy score
    },
    feedback: {
      type: String,
    },
    // Teams rate adjudicators
    adjudicatorRatings: [
      {
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 10,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
