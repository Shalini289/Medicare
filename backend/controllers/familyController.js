const FamilyMember = require("../models/FamilyMember");

// ✅ Add member
const addMember = async (req, res) => {
  try {
    const member = await FamilyMember.create(req.body);
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get all family members
const getMembers = async (req, res) => {
  const members = await FamilyMember.find({
    ownerId: req.params.ownerId
  });

  res.json({
    success: true,
    data: members
  });
};

module.exports = { addMember, getMembers };