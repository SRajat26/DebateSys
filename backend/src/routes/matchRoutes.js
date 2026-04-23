const express = require("express");
const { triggerMatchGeneration, getCompetitionMatches } = require("../controllers/matchController");
const { protect, adminOC } = require("../middleware/authMiddleware");

// We'll merge params so we can use /api/competitions/:id/matches as base
const router = express.Router({ mergeParams: true });

router.route("/").get(getCompetitionMatches);
router.route("/generate").post(protect, adminOC, triggerMatchGeneration);

module.exports = router;
