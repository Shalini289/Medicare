const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const toSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ msg: "User exists" });

  const user = await User.create({ name, email, password });

  res.json({ token: generateToken(user), user: toSafeUser(user) });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && await user.matchPassword(password)) {
    res.json({ token: generateToken(user), user: toSafeUser(user) });
  } else {
    res.status(400).json({ msg: "Invalid credentials" });
  }
};

module.exports = { register, login };
