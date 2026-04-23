const express = require("express");
const { raiseIssue, getIssues, resolveIssue } = require("../controllers/issueController");
const { protect, adminOC } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, raiseIssue).get(protect, adminOC, getIssues);
router.route("/:id/resolve").put(protect, adminOC, resolveIssue);

module.exports = router;
