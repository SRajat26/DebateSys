const express = require("express");
const { submitResult } = require("../controllers/resultController");
const { protect, approvedOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:id/result", protect, approvedOnly, submitResult);

module.exports = router;
