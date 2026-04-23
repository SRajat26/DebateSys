const Match = require("../models/Match");
const Competition = require("../models/Competition");
const { generateMatches } = require("../utils/matchGenerator");

// @desc    Generate matches for the next round
// @route   POST /api/competitions/:id/generate
// @access  Private/OC
const triggerMatchGeneration = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    if (competition.currentRound >= competition.totalRounds) {
      return res.status(400).json({ message: "Competition already completed all rounds" });
    }

    // Check if previous round has all results submitted
    if (competition.currentRound > 0) {
      const pastMatches = await Match.find({
        competition: competition._id,
        roundNumber: competition.currentRound,
      });

      const uncompletedMatches = pastMatches.filter((m) => m.status !== "completed");
      if (uncompletedMatches.length > 0) {
        return res.status(400).json({ message: "All matches in the current round must be completed first" });
      }
    }

    const newMatches = await generateMatches(competition);

    competition.currentRound += 1;
    competition.status = competition.currentRound === competition.totalRounds ? "completed" : "ongoing";
    await competition.save();

    res.status(201).json({ message: `Round ${competition.currentRound} generated!`, matches: newMatches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get matches for a competition
// @route   GET /api/competitions/:id/matches
// @access  Public
const getCompetitionMatches = async (req, res) => {
  try {
    const matches = await Match.find({ competition: req.params.id })
      .populate("teamA", "name email")
      .populate("teamB", "name email")
      .populate("adjudicators", "name email")
      .populate("ocRunner", "name email")
      .sort({ roundNumber: 1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { triggerMatchGeneration, getCompetitionMatches };
