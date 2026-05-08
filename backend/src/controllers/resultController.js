const Result = require("../models/Result");
const Match = require("../models/Match");
const User = require("../models/User");

// @desc    Submit match result (Adjudicator only)
// @route   POST /api/matches/:id/result
// @access  Private (Adjudicator)
const submitResult = async (req, res) => {
  const { winningTeam, teamAScore, teamBScore, feedback } = req.body;
  const matchId = req.params.id;

  // Validate score range (67-81)
  if (teamAScore < 67 || teamAScore > 81) {
    return res.status(400).json({ message: "Team A score must be between 67 and 81" });
  }
  if (teamBScore !== undefined && teamBScore !== null && (teamBScore < 67 || teamBScore > 81)) {
    return res.status(400).json({ message: "Team B score must be between 67 and 81" });
  }

  try {
    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!match.adjudicators.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not an adjudicator for this match" });
    }

    if (match.status === "completed") {
      return res.status(400).json({ message: "Result already submitted" });
    }

    const result = await Result.create({
      match: match._id,
      competition: match.competition,
      roundNumber: match.roundNumber,
      submittedBy: req.user._id,
      winningTeam: winningTeam || null, // null for draw
      teamAScore,
      teamBScore,
      feedback,
    });

    // Mark match as completed
    match.status = "completed";
    await match.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit adjudicator rating (Team only)
// @route   PUT /api/results/:id/rate
// @access  Private (Team)
const rateAdjudicator = async (req, res) => {
  const { adjudicatorId, rating } = req.body;
  
  if (rating < 0 || rating > 10) {
    return res.status(400).json({ message: "Rating must be between 0 and 10" });
  }

  if (!adjudicatorId) {
    return res.status(400).json({ message: "Adjudicator ID is required" });
  }

  try {
    const result = await Result.findOne({ match: req.params.id }).populate("match");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const isTeamInMatch =
      result.match.teamA.toString() === req.user._id.toString() ||
      (result.match.teamB && result.match.teamB.toString() === req.user._id.toString());

    if (!isTeamInMatch) {
      return res.status(403).json({ message: "Your team was not in this match" });
    }

    const isAdjudicatorInMatch = result.match.adjudicators.some(
      (adjId) => adjId.toString() === adjudicatorId
    );

    if (!isAdjudicatorInMatch) {
      return res.status(400).json({ message: "This adjudicator was not assigned to this match" });
    }

    // Add or update rating
    const existingRatingIndex = result.adjudicatorRatings.findIndex(
      (r) => r.team.toString() === req.user._id.toString() && r.adjudicator.toString() === adjudicatorId
    );

    if (existingRatingIndex >= 0) {
      result.adjudicatorRatings[existingRatingIndex].rating = rating;
    } else {
      result.adjudicatorRatings.push({ adjudicator: adjudicatorId, team: req.user._id, rating });
    }

    await result.save();
    res.json({ message: "Rating submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard for a competition
// @route   GET /api/results/leaderboard/:competitionId
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const competitionId = req.params.competitionId;

    const matches = await Match.find({ competition: competitionId });
    const results = await Result.find({ competition: competitionId });

    // Collect all unique team IDs from matches
    const teamIdSet = new Set();
    matches.forEach((m) => {
      if (m.teamA) teamIdSet.add(m.teamA.toString());
      if (m.teamB) teamIdSet.add(m.teamB.toString());
    });

    // Build stats map
    const statsMap = {};
    teamIdSet.forEach((id) => {
      statsMap[id] = { teamId: id, wins: 0, totalScore: 0, matchesPlayed: 0 };
    });

    matches.forEach((m) => {
      // Find result for this match
      const result = results.find(
        (r) => r.match.toString() === m._id.toString()
      );

      if (!result) return; // no result submitted yet

      // Team A
      if (m.teamA && statsMap[m.teamA.toString()]) {
        statsMap[m.teamA.toString()].matchesPlayed += 1;
        statsMap[m.teamA.toString()].totalScore += result.teamAScore || 0;
        if (
          result.winningTeam &&
          result.winningTeam.toString() === m.teamA.toString()
        ) {
          statsMap[m.teamA.toString()].wins += 1;
        }
      }

      // Team B
      if (m.teamB && statsMap[m.teamB.toString()]) {
        statsMap[m.teamB.toString()].matchesPlayed += 1;
        statsMap[m.teamB.toString()].totalScore += result.teamBScore || 0;
        if (
          result.winningTeam &&
          result.winningTeam.toString() === m.teamB.toString()
        ) {
          statsMap[m.teamB.toString()].wins += 1;
        }
      }
    });

    const standings = Object.values(statsMap);

    // Sort by wins DESC, then totalScore DESC
    standings.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.totalScore - a.totalScore;
    });

    // Populate team names
    const teamIds = standings.map((s) => s.teamId);
    const users = await User.find({ _id: { $in: teamIds } }).select(
      "name email"
    );
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    const leaderboard = standings.map((s, index) => ({
      rank: index + 1,
      teamId: s.teamId,
      teamName: userMap[s.teamId]?.name || "Unknown",
      teamEmail: userMap[s.teamId]?.email || "",
      wins: s.wins,
      totalScore: s.totalScore,
      matchesPlayed: s.matchesPlayed,
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get adjudicator leaderboard for a competition
// @route   GET /api/results/adjudicator-leaderboard/:competitionId
// @access  Public
const getAdjudicatorLeaderboard = async (req, res) => {
  try {
    const competitionId = req.params.competitionId;
    const results = await Result.find({ competition: competitionId });

    const statsMap = {};

    results.forEach((result) => {
      if (result.adjudicatorRatings && result.adjudicatorRatings.length > 0) {
        result.adjudicatorRatings.forEach((ratingEntry) => {
          if (!ratingEntry.adjudicator) return;
          const adjId = ratingEntry.adjudicator.toString();
          
          if (!statsMap[adjId]) {
            statsMap[adjId] = {
              adjudicatorId: adjId,
              totalRating: 0,
              ratingCount: 0,
            };
          }
          
          if (ratingEntry.rating !== undefined && ratingEntry.rating !== null) {
            statsMap[adjId].totalRating += ratingEntry.rating;
            statsMap[adjId].ratingCount += 1;
          }
        });
      }
    });

    const standings = Object.values(statsMap).map(s => ({
      ...s,
      averageRating: s.ratingCount > 0 ? (s.totalRating / s.ratingCount) : 0
    }));

    // Sort by average rating DESC
    standings.sort((a, b) => b.averageRating - a.averageRating);

    // Populate adjudicator names
    const adjIds = standings.map((s) => s.adjudicatorId);
    const users = await User.find({ _id: { $in: adjIds } }).select("name email");
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    const leaderboard = standings.map((s, index) => ({
      rank: index + 1,
      adjudicatorId: s.adjudicatorId,
      adjudicatorName: userMap[s.adjudicatorId]?.name || "Unknown",
      adjudicatorEmail: userMap[s.adjudicatorId]?.email || "",
      averageRating: s.averageRating,
      ratingCount: s.ratingCount,
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitResult, rateAdjudicator, getLeaderboard, getAdjudicatorLeaderboard };
