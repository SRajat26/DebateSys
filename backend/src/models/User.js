const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["User", "OC", "Adjudicator", "Team"],
      default: "User", // Defaults to simple user, can be updated or assigned based on registration flow
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // OC MUST approve Adjudicators and Teams
    },
    // If role is Team, they might have team members
    teamMembers: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
