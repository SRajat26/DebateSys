const express = require("express");
const { rateAdjudicator, getLeaderboard, getAdjudicatorLeaderboard } = require("../controllers/resultController");
const { protect, approvedOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/:id/rate", protect, approvedOnly, rateAdjudicator);
router.get("/leaderboard/:competitionId", getLeaderboard);
router.get("/adjudicator-leaderboard/:competitionId", getAdjudicatorLeaderboard);

module.exports = router;
