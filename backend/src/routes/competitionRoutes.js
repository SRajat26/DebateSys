const express = require("express");
const {
  createCompetition,
  getCompetitions,
  getCompetitionById,
  registerForCompetition,
  approveParticipant,
  rejectParticipant,
  checkInParticipant,
  deleteCompetition,
} = require("../controllers/competitionController");
const { protect, adminOC } = require("../middleware/authMiddleware");

const matchRoutes = require("./matchRoutes");

const router = express.Router();

router.use("/:id/matches", matchRoutes);

router.route("/").get(getCompetitions).post(protect, adminOC, createCompetition);
router.route("/:id").get(getCompetitionById).delete(protect, adminOC, deleteCompetition);
router.route("/:id/register").put(protect, registerForCompetition);
router.route("/:id/checkin").put(protect, checkInParticipant);
router.route("/:id/approve/:userId").put(protect, adminOC, approveParticipant);
router.route("/:id/reject/:userId").put(protect, adminOC, rejectParticipant);

module.exports = router;
