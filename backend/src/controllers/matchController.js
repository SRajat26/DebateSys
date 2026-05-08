const Match = require("../models/Match");
const Competition = require("../models/Competition");
const { generateMatches } = require("../utils/matchGenerator");

// @desc    Generate matches for the next round
// @route   POST /api/competitions/:id/generate
// @access  Private/OC
const triggerMatchGeneration = async (req, res) => {
  const { forceOverride } = req.body || {};

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

      const Result = require("../models/Result");
      const currentResults = await Result.find({
        competition: competition._id,
        roundNumber: competition.currentRound,
      }).populate("match");

      let missingRatings = false;

      for (const resDoc of currentResults) {
        const match = resDoc.match;
        if (match.isBye) continue;

        const teamsToRate = [match.teamA.toString()];
        if (match.teamB) teamsToRate.push(match.teamB.toString());
        
        for (const adjId of match.adjudicators) {
          const adjIdStr = adjId.toString();
          for (const teamId of teamsToRate) {
            const hasRated = resDoc.adjudicatorRatings.some(
              r => r.team.toString() === teamId && r.adjudicator && r.adjudicator.toString() === adjIdStr
            );
            if (!hasRated) {
              missingRatings = true;
              break;
            }
          }
          if (missingRatings) break;
        }
        if (missingRatings) break;
      }

      if (missingRatings && !forceOverride) {
        return res.status(400).json({ message: "Not all teams have rated their adjudicators. Teams must rate adjudicators before the next round can begin." });
      }

      if (missingRatings && forceOverride) {
        // Calculate average ratings for all adjudicators across ALL results
        const allResults = await Result.find({ competition: competition._id });
        const avgMap = {};
        const countMap = {};
        allResults.forEach(r => {
           r.adjudicatorRatings.forEach(ar => {
             if (!ar.adjudicator || ar.rating === undefined || ar.rating === null) return;
             const aId = ar.adjudicator.toString();
             avgMap[aId] = (avgMap[aId] || 0) + ar.rating;
             countMap[aId] = (countMap[aId] || 0) + 1;
           });
        });
        
        // Fill in missing ratings
        for (const resDoc of currentResults) {
          const match = resDoc.match;
          if (match.isBye) continue;

          const teamsToRate = [match.teamA.toString()];
          if (match.teamB) teamsToRate.push(match.teamB.toString());
          
          let modified = false;
          for (const adjId of match.adjudicators) {
            const adjIdStr = adjId.toString();
            const avgRating = countMap[adjIdStr] ? avgMap[adjIdStr] / countMap[adjIdStr] : 5; // default 5 if no ratings

            for (const teamId of teamsToRate) {
              const hasRated = resDoc.adjudicatorRatings.some(
                r => r.team.toString() === teamId && r.adjudicator && r.adjudicator.toString() === adjIdStr
              );
              if (!hasRated) {
                resDoc.adjudicatorRatings.push({
                  adjudicator: adjIdStr,
                  team: teamId,
                  rating: avgRating
                });
                modified = true;
              }
            }
          }
          if (modified) {
            await resDoc.save();
          }
        }
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
