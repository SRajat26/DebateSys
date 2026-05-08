const Issue = require("../models/Issue");

// @desc    Raise an issue
// @route   POST /api/issues
// @access  Private
const raiseIssue = async (req, res) => {
  const { matchId, description } = req.body;

  try {
    const issue = await Issue.create({
      raisedBy: req.user._id,
      match: matchId,
      description,
    });

    // Return the fully populated issue
    const populated = await Issue.findById(issue._id)
      .populate("raisedBy", "name email role")
      .populate({
        path: "match",
        populate: [
          { path: "teamA", select: "name" },
          { path: "teamB", select: "name" },
          { path: "adjudicators", select: "name" },
        ],
      });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues (with full match context)
// @route   GET /api/issues
// @access  Private/OC
const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find({})
      .populate("raisedBy", "name email role")
      .populate("resolvedBy", "name")
      .populate({
        path: "match",
        populate: [
          { path: "teamA", select: "name" },
          { path: "teamB", select: "name" },
          { path: "adjudicators", select: "name" },
        ],
      })
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve an issue
// @route   PUT /api/issues/:id/resolve
// @access  Private/OC
const resolveIssue = async (req, res) => {
  const { resolution } = req.body;

  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.status = "resolved";
    issue.resolution = resolution || "Resolved by OC";
    issue.resolvedBy = req.user._id;

    await issue.save();

    // Return the fully populated issue
    const populated = await Issue.findById(issue._id)
      .populate("raisedBy", "name email role")
      .populate("resolvedBy", "name")
      .populate({
        path: "match",
        populate: [
          { path: "teamA", select: "name" },
          { path: "teamB", select: "name" },
          { path: "adjudicators", select: "name" },
        ],
      });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { raiseIssue, getIssues, resolveIssue };
