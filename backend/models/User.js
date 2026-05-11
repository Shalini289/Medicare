const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,

  role: {
    type: String,
    enum: ["user", "doctor", "admin"],
    default: "user"
  },

  familyMembers: [
    {
      name: String,
      age: Number,
      relation: String
    }
  ],

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorCodeHash: String,
  twoFactorExpire: Date
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 1000 * 60 * 15;

  return token;
};

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);
