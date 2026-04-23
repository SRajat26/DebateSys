const express = require("express");
const { rateAdjudicator, getLeaderboard } = require("../controllers/resultController");
const { protect, approvedOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/:id/rate", protect, approvedOnly, rateAdjudicator);
router.get("/leaderboard/:competitionId", getLeaderboard);

module.exports = router;
