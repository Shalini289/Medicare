const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  familyMembers: [
    {
      name: String,
      age: Number,
      relation: String
    }
  ]
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);
