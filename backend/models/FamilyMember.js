const mongoose = require("mongoose");

const familySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: String,
    age: Number,
    relation: String, // Father, Mother, Child

    gender: String,

    medicalHistory: [String] // optional quick notes
  },
  { timestamps: true }
);

module.exports = mongoose.model("FamilyMember", familySchema);