const Competition = require("../models/Competition");
const Match = require("../models/Match");
const Result = require("../models/Result");

// @desc    Create a new competition
// @route   POST /api/competitions
// @access  Private/OC
const createCompetition = async (req, res) => {
  const { name, totalRounds, teamSize, adjudicatorsPerMatch, venues } = req.body;

  try {
    const competition = await Competition.create({
      name,
      totalRounds,
      teamSize,
      adjudicatorsPerMatch,
      venues,
      ocMembers: [req.user._id],
    });

    res.status(201).json(competition);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all competitions
// @route   GET /api/competitions
// @access  Public
const getCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find({});
    res.json(competitions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get competition by ID
// @route   GET /api/competitions/:id
// @access  Public
const getCompetitionById = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate("ocMembers", "name email")
      .populate("approvedTeams", "name email")
      .populate("approvedAdjudicators", "name email")
      .populate("checkedInTeams", "name email")
      .populate("checkedInAdjudicators", "name email")
      .populate("pendingTeams", "name email role")
      .populate("pendingAdjudicators", "name email role");

    if (competition) {
      res.json(competition);
    } else {
      res.status(404).json({ message: "Competition not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register for a competition (Team or Adjudicator) — goes to pending
// @route   PUT /api/competitions/:id/register
// @access  Private
const registerForCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    if (competition.status !== "registration") {
      return res.status(400).json({ message: "Registration is closed for this tournament" });
    }

    const userId = req.user._id;

    if (req.user.role === "Team") {
      if (competition.pendingTeams.includes(userId)) return res.status(400).json({ message: "Already registered (pending)" });
      if (competition.approvedTeams.includes(userId) || competition.checkedInTeams.includes(userId)) {
        return res.status(400).json({ message: "Already approved for this tournament" });
      }
      competition.pendingTeams.push(userId);
    } else if (req.user.role === "Adjudicator") {
      if (competition.pendingAdjudicators.includes(userId)) return res.status(400).json({ message: "Already registered (pending)" });
      if (competition.approvedAdjudicators.includes(userId) || competition.checkedInAdjudicators.includes(userId)) {
        return res.status(400).json({ message: "Already approved for this tournament" });
      }
      competition.pendingAdjudicators.push(userId);
    } else {
      return res.status(400).json({ message: "Only Teams and Adjudicators can register" });
    }

    await competition.save();
    res.json({ message: "Registration submitted! Awaiting OC approval." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a participant for a competition (OC moves from pending to approved)
// @route   PUT /api/competitions/:id/approve/:userId
// @access  Private/OC
const approveParticipant = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    const userId = req.params.userId;

    // Check pendingTeams -> approvedTeams
    const teamIdx = competition.pendingTeams.findIndex(id => id.toString() === userId);
    if (teamIdx >= 0) {
      competition.pendingTeams.splice(teamIdx, 1);
      if (!competition.approvedTeams.includes(userId)) {
        competition.approvedTeams.push(userId);
      }
      await competition.save();
      return res.json({ message: "Team registration approved" });
    }

    // Check pendingAdjudicators -> approvedAdjudicators
    const adjIdx = competition.pendingAdjudicators.findIndex(id => id.toString() === userId);
    if (adjIdx >= 0) {
      competition.pendingAdjudicators.splice(adjIdx, 1);
      if (!competition.approvedAdjudicators.includes(userId)) {
        competition.approvedAdjudicators.push(userId);
      }
      await competition.save();
      return res.json({ message: "Adjudicator registration approved" });
    }

    return res.status(404).json({ message: "User not found in pending list" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a participant from a competition
// @route   PUT /api/competitions/:id/reject/:userId
// @access  Private/OC
const rejectParticipant = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "Competition not found" });

    const userId = req.params.userId;

    // Remove from pending
    const teamIdx = competition.pendingTeams.findIndex(id => id.toString() === userId);
    if (teamIdx >= 0) {
      competition.pendingTeams.splice(teamIdx, 1);
    } else {
      const adjIdx = competition.pendingAdjudicators.findIndex(id => id.toString() === userId);
      if (adjIdx >= 0) competition.pendingAdjudicators.splice(adjIdx, 1);
      else return res.status(404).json({ message: "User not found in pending list" });
    }

    await competition.save();
    res.json({ message: "Registration rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check-in to a competition (Participant moves from approved to checked-in)
// @route   PUT /api/competitions/:id/checkin
// @access  Private
const checkInParticipant = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "Competition not found" });

    const userId = req.user._id;

    // Move from approvedTeams -> checkedInTeams
    const teamIdx = competition.approvedTeams.findIndex(id => id.toString() === userId.toString());
    if (teamIdx >= 0) {
      competition.approvedTeams.splice(teamIdx, 1);
      if (!competition.checkedInTeams.includes(userId)) {
        competition.checkedInTeams.push(userId);
      }
      await competition.save();
      return res.json({ message: "Checked in successfully as Team" });
    }

    // Move from approvedAdjudicators -> checkedInAdjudicators
    const adjIdx = competition.approvedAdjudicators.findIndex(id => id.toString() === userId.toString());
    if (adjIdx >= 0) {
      competition.approvedAdjudicators.splice(adjIdx, 1);
      if (!competition.checkedInAdjudicators.includes(userId)) {
        competition.checkedInAdjudicators.push(userId);
      }
      await competition.save();
      return res.json({ message: "Checked in successfully as Adjudicator" });
    }

    return res.status(400).json({ message: "Required registration approval before check-in" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a competition
// @route   DELETE /api/competitions/:id
// @access  Private/OC
const deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ message: "Competition not found" });

    const matchIds = await Match.find({ competition: competition._id }).select("_id");
    await Result.deleteMany({ match: { $in: matchIds.map(m => m._id) } });
    await Match.deleteMany({ competition: competition._id });
    await Competition.findByIdAndDelete(competition._id);

    res.json({ message: "Competition deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCompetition,
  getCompetitions,
  getCompetitionById,
  registerForCompetition,
  approveParticipant,
  rejectParticipant,
  checkInParticipant,
  deleteCompetition,
};
