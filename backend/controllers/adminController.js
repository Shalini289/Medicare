const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Medicine = require("../models/Medicine");
const Order = require("../models/Order");
const Hospital = require("../models/Hospital");
const Staff = require("../models/Staff");
const Invoice = require("../models/Invoice");
const InsuranceClaim = require("../models/InsuranceClaim");
const Ambulance = require("../models/Ambulance");
const Department = require("../models/Department");

const makeCode = (prefix) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const parseItems = (items = []) => {
  if (Array.isArray(items)) {
    return items
      .map((item) => ({
        name: item.name?.trim() || "",
        amount: Number(item.amount || 0),
      }))
      .filter((item) => item.name || item.amount);
  }

  return String(items || "")
    .split(",")
    .map((name) => ({ name: name.trim(), amount: 0 }))
    .filter((item) => item.name);
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      totalOrders,
      totalStaff,
      totalInvoices,
      openClaims,
      ambulancesAvailable,
      totalDepartments,
      lowStockMedicines,
      hospitals,
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Order.countDocuments(),
      Staff.countDocuments(),
      Invoice.countDocuments(),
      InsuranceClaim.countDocuments({ status: { $in: ["submitted", "under-review"] } }),
      Ambulance.countDocuments({ status: "available" }),
      Department.countDocuments(),
      Medicine.countDocuments({ $expr: { $lte: ["$stock", "$reorderLevel"] } }),
      Hospital.find(),
    ]);

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]);

    const invoiceAgg = await Invoice.aggregate([
      { $group: { _id: null, revenue: { $sum: "$amount" } } },
    ]);

    const totalBeds = hospitals.reduce((sum, hospital) =>
      sum + Number(hospital.beds?.ICU || 0) + Number(hospital.beds?.oxygen || 0) + Number(hospital.beds?.general || 0), 0);

    const occupiedBeds = hospitals.reduce((sum, hospital) =>
      sum + Number(hospital.occupiedBeds?.ICU || 0) + Number(hospital.occupiedBeds?.oxygen || 0) + Number(hospital.occupiedBeds?.general || 0), 0);

    res.json({
      totalUsers,
      totalDoctors,
      totalAppointments,
      totalOrders,
      revenue: revenueAgg[0]?.revenue || 0,
      totalStaff,
      totalInvoices,
      invoiceRevenue: invoiceAgg[0]?.revenue || 0,
      openClaims,
      ambulancesAvailable,
      totalDepartments,
      lowStockMedicines,
      totalBeds,
      occupiedBeds,
      availableBeds: Math.max(totalBeds - occupiedBeds, 0),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, msg: "User deleted" });
};

const getDoctorsAdmin = async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
};

const addDoctor = async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.json(doctor);
};

const updateDoctor = async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doctor) return res.status(404).json({ msg: "Doctor not found" });
  res.json(doctor);
};

const deleteDoctor = async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ success: true, msg: "Doctor deleted" });
};

const getAppointmentsAdmin = async (req, res) => {
  const appointments = await Appointment.find().populate("user doctor");
  res.json(appointments);
};

const updateAppointmentStatus = async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ msg: "Appointment not found" });
  appt.status = req.body.status;
  await appt.save();
  res.json(appt);
};

const getMedicinesAdmin = async (req, res) => {
  const meds = await Medicine.find().sort({ stock: 1, name: 1 });
  res.json(meds);
};

const addMedicine = async (req, res) => {
  const med = await Medicine.create({
    ...req.body,
    price: Number(req.body.price || 0),
    stock: Number(req.body.stock || 0),
    reorderLevel: Number(req.body.reorderLevel || 10),
  });
  res.json(med);
};

const updateMedicine = async (req, res) => {
  const med = await Medicine.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      price: Number(req.body.price || 0),
      stock: Number(req.body.stock || 0),
      reorderLevel: Number(req.body.reorderLevel || 10),
    },
    { new: true, runValidators: true }
  );
  if (!med) return res.status(404).json({ msg: "Medicine not found" });
  res.json(med);
};

const deleteMedicine = async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.json({ success: true, msg: "Medicine deleted" });
};

const getOrdersAdmin = async (req, res) => {
  const orders = await Order.find().populate("user items.medicine");
  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ msg: "Order not found" });
  order.status = req.body.status;
  await order.save();
  res.json(order);
};

const getHospitalsAdmin = async (req, res) => {
  const hospitals = await Hospital.find();
  res.json(hospitals);
};

const addHospital = async (req, res) => {
  const hospital = await Hospital.create(req.body);
  res.json(hospital);
};

const updateHospitalBeds = async (req, res) => {
  const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!hospital) return res.status(404).json({ msg: "Hospital not found" });
  req.app.get("io").emit("bedUpdate", hospital);
  res.json(hospital);
};

const getStaffAdmin = async (req, res) => {
  const staff = await Staff.find().sort({ department: 1, name: 1 });
  res.json(staff);
};

const addStaff = async (req, res) => {
  const staff = await Staff.create(req.body);
  res.json(staff);
};

const updateStaff = async (req, res) => {
  const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!staff) return res.status(404).json({ msg: "Staff member not found" });
  res.json(staff);
};

const deleteStaff = async (req, res) => {
  await Staff.findByIdAndDelete(req.params.id);
  res.json({ success: true, msg: "Staff member deleted" });
};

const getInvoicesAdmin = async (req, res) => {
  const invoices = await Invoice.find().sort({ createdAt: -1 });
  res.json(invoices);
};

const addInvoice = async (req, res) => {
  const items = parseItems(req.body.items);
  const invoice = await Invoice.create({
    ...req.body,
    invoiceNumber: makeCode("INV"),
    items,
    amount: Number(req.body.amount || items.reduce((sum, item) => sum + item.amount, 0)),
  });
  res.json(invoice);
};

const updateInvoice = async (req, res) => {
  const payload = { ...req.body };
  if (req.body.items) payload.items = parseItems(req.body.items);
  if (req.body.amount !== undefined) payload.amount = Number(req.body.amount || 0);

  const invoice = await Invoice.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!invoice) return res.status(404).json({ msg: "Invoice not found" });
  res.json(invoice);
};

const deleteInvoice = async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ success: true, msg: "Invoice deleted" });
};

const getInsuranceClaimsAdmin = async (req, res) => {
  const claims = await InsuranceClaim.find().sort({ createdAt: -1 });
  res.json(claims);
};

const addInsuranceClaim = async (req, res) => {
  const claim = await InsuranceClaim.create({
    ...req.body,
    claimNumber: makeCode("CLM"),
    amount: Number(req.body.amount || 0),
  });
  res.json(claim);
};

const updateInsuranceClaim = async (req, res) => {
  const claim = await InsuranceClaim.findByIdAndUpdate(
    req.params.id,
    { ...req.body, amount: Number(req.body.amount || 0) },
    { new: true, runValidators: true }
  );
  if (!claim) return res.status(404).json({ msg: "Claim not found" });
  res.json(claim);
};

const deleteInsuranceClaim = async (req, res) => {
  await InsuranceClaim.findByIdAndDelete(req.params.id);
  res.json({ success: true, msg: "Claim deleted" });
};

const getAmbulancesAdmin = async (req, res) => {
  const ambulances = await Ambulance.find().sort({ status: 1, vehicleNumber: 1 });
  res.json(ambulances);
};

const addAmbulance = async (req, res) => {
  const ambulance = await Ambulance.create(req.body);
  res.json(ambulance);
};

const updateAmbulance = async (req, res) => {
  const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!ambulance) return res.status(404).json({ msg: "Ambulance not found" });
  req.app.get("io").emit("ambulanceUpdate", ambulance);
  res.json(ambulance);
};

const deleteAmbulance = async (req, res) => {
  await Ambulance.findByIdAndDelete(req.params.id);
  res.json({ success: true, msg: "Ambulance deleted" });
};

const getDepartmentsAdmin = async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.json(departments);
};

const addDepartment = async (req, res) => {
  const department = await Department.create({ ...req.body, beds: Number(req.body.beds || 0) });
  res.json(department);
};

const updateDepartment = async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { ...req.body, beds: Number(req.body.beds || 0) },
    { new: true, runValidators: true }
  );
  if (!department) return res.status(404).json({ msg: "Department not found" });
  res.json(department);
};

const deleteDepartment = async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.json({ success: true, msg: "Department deleted" });
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
  updateHospitalBeds,
  getStaffAdmin,
  addStaff,
  updateStaff,
  deleteStaff,
  getInvoicesAdmin,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  getInsuranceClaimsAdmin,
  addInsuranceClaim,
  updateInsuranceClaim,
  deleteInsuranceClaim,
  getAmbulancesAdmin,
  addAmbulance,
  updateAmbulance,
  deleteAmbulance,
  getDepartmentsAdmin,
  addDepartment,
  updateDepartment,
  deleteDepartment,
};
