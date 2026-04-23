const Match = require("../models/Match");
const Result = require("../models/Result");

const generateMatches = async (competition) => {
  const teams = [...competition.checkedInTeams];
  let adjudicators = [...competition.checkedInAdjudicators];
  
  if (teams.length < 2) {
    throw new Error("Not enough teams to generate matches");
  }

  const nextRound = competition.currentRound + 1;
  const numMatches = Math.floor(teams.length / 2);

  if (adjudicators.length < numMatches) {
    throw new Error(`Not enough adjudicators. Have ${adjudicators.length}, need at least ${numMatches} for 1 per match.`);
  }

  // 1. Calculate past scores
  const teamStats = teams.map((t) => ({ id: t.toString(), score: 0 }));
  
  if (nextRound > 1) {
    const pastResults = await Result.find({ competition: competition._id });
    // basic score aggregation
    pastResults.forEach((res) => {
      const match = res.match; // wait, need to know teamA and teamB from match
      // This is slightly inefficient if we don't populate match, let's fetch matches
    });
    // For a robust implementation, I'll fetch past matches and their results.
    const pastMatches = await Match.find({ competition: competition._id });
    
    pastMatches.forEach((m) => {
      const result = pastResults.find((r) => r.match.toString() === m._id.toString());
      if (result) {
        const teamAStat = teamStats.find((ts) => ts.id === m.teamA.toString());
        if (teamAStat) teamAStat.score += result.teamAScore || 0;
        
        if (m.teamB) {
          const teamBStat = teamStats.find((ts) => ts.id === m.teamB.toString());
          if (teamBStat) teamBStat.score += result.teamBScore || 0;
        }
      }
    });
  }

  // Sort by score DESC
  teamStats.sort((a, b) => b.score - a.score);

  // Byes for odd number
  let byeTeam = null;
  if (teamStats.length % 2 !== 0) {
    // Take the lowest scoring team for a bye
    const lowestTeam = teamStats.pop();
    byeTeam = lowestTeam.id;
  }

  // Determine Pairs
  const pairs = [];
  const pastMatches = await Match.find({ competition: competition._id });
  
  // A naive pairing avoiding duplicates
  while (teamStats.length >= 2) {
    const t1 = teamStats.shift();
    let partnerIndex = 0;
    let foundPartner = false;
    
    // Find highest ranked team that hasn't played t1 yet
    for (let i = 0; i < teamStats.length; i++) {
      const t2 = teamStats[i];
      const hasPlayed = pastMatches.some(
        (m) =>
          (m.teamA.toString() === t1.id && m.teamB?.toString() === t2.id) ||
          (m.teamA.toString() === t2.id && m.teamB?.toString() === t1.id)
      );
      if (!hasPlayed) {
        partnerIndex = i;
        foundPartner = true;
        break;
      }
    }
    
    // If all remaining have played, just take the first one
    if (!foundPartner) partnerIndex = 0;
    
    const t2 = teamStats.splice(partnerIndex, 1)[0];
    pairs.push({ teamA: t1.id, teamB: t2.id });
  }

  // Distribute Adjudicators
  const matchAdjudicators = pairs.map(() => []);
  const reqPerMatch = competition.adjudicatorsPerMatch;
  let currentAdjIndex = 0;
  
  // Guarantee 1 for each
  for (let i = 0; i < pairs.length; i++) {
    matchAdjudicators[i].push(adjudicators[currentAdjIndex++]);
  }
  
  // Distribute remaining based on priority (top matches first)
  let pairIndex = 0;
  while (currentAdjIndex < adjudicators.length) {
    // If giving more adjudicators, ensure we don't exceed what we want or just distribute them
    // The requirement: "give priority to the top teams and give fewer to the lower teams"
    // So we loop over top matches repeatedly until we run out of adjudicators
    matchAdjudicators[pairIndex].push(adjudicators[currentAdjIndex++]);
    pairIndex++;
    if (pairIndex >= pairs.length) {
      pairIndex = 0; // wrap around
    }
  }

  const generatedMatches = [];
  const venues = competition.venues;
  const ocMembers = competition.ocMembers;

  for (let i = 0; i < pairs.length; i++) {
    const venue = venues[i % venues.length];
    const ocRunner = ocMembers[i % ocMembers.length];
    
    const newMatch = await Match.create({
      competition: competition._id,
      roundNumber: nextRound,
      teamA: pairs[i].teamA,
      teamB: pairs[i].teamB,
      adjudicators: matchAdjudicators[i],
      venue,
      ocRunner,
    });
    generatedMatches.push(newMatch);
  }

  if (byeTeam) {
    const newMatch = await Match.create({
      competition: competition._id,
      roundNumber: nextRound,
      teamA: byeTeam,
      isBye: true,
      venue: "BYE", // Dummy venue
      status: "completed", // Byes are automatically completed
    });
    generatedMatches.push(newMatch);
  }

  return generatedMatches;
};

module.exports = { generateMatches };
