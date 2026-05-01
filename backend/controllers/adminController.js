const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Medicine = require("../models/Medicine");
const Order = require("../models/Order");
const Hospital = require("../models/Hospital");

//
// 📊 DASHBOARD STATS
//
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" }
        }
      }
    ]);

    res.json({
      totalUsers,
      totalDoctors,
      totalAppointments,
      totalOrders,
      revenue: revenueAgg[0]?.revenue || 0
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

//
// 👤 USER MANAGEMENT
//
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: "User deleted"
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

//
// 🧑‍⚕️ DOCTOR MANAGEMENT
//
const getDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const addDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.json(doctor);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(doctor);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: "Doctor deleted"
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

//
// 📅 APPOINTMENTS
//
const getAppointmentsAdmin = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("user doctor");

    res.json(appointments);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    appt.status = req.body.status;
    await appt.save();

    res.json(appt);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

//
// 💊 MEDICINE
//
const getMedicinesAdmin = async (req, res) => {
  try {
    const meds = await Medicine.find();
    res.json(meds);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const addMedicine = async (req, res) => {
  try {
    const med = await Medicine.create(req.body);
    res.json(med);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(med);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      msg: "Medicine deleted"
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

//
// 📦 ORDERS
//
const getOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user items.medicine");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    order.status = req.body.status;
    await order.save();

    res.json(order);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

//
// 🏥 HOSPITAL
//
const getHospitalsAdmin = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const addHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.json(hospital);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateHospitalBeds = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ msg: "Hospital not found" });
    }

    req.app.get("io").emit("bedUpdate", hospital);

    res.json(hospital);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  getDashboardStats,

  getUsers,
  deleteUser,

  getDoctorsAdmin,
  addDoctor,
  updateDoctor,
  deleteDoctor,

  getAppointmentsAdmin,
  updateAppointmentStatus,

  getMedicinesAdmin,
  addMedicine,
  updateMedicine,
  deleteMedicine,

  getOrdersAdmin,
  updateOrderStatus,

  getHospitalsAdmin,
  addHospital,
  updateHospitalBeds
};
