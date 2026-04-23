require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Base route
app.get("/", (req, res) => {
  res.send("Debate Tournament API is running.");
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const competitionRoutes = require("./routes/competitionRoutes");
const matchActionRoutes = require("./routes/matchActionRoutes");
const resultRoutes = require("./routes/resultRoutes");
const issueRoutes = require("./routes/issueRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/matches", matchActionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/issues", issueRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
