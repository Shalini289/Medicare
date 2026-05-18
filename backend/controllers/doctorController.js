const Doctor = require("../models/Doctor");
const User = require("../models/User");
const doctors = require("../data/doctors");

const seedDemoDoctorsIfEmpty = async () => {
  const count = await Doctor.countDocuments();

  if (count > 0) {
    return;
  }

  await Doctor.bulkWrite(
    doctors.map((doctor) => ({
      updateOne: {
        filter: {
          name: doctor.name,
          specialization: doctor.specialization
        },
        update: {
          $set: doctor
        },
        upsert: true
      }
    }))
  );
};

const getDoctors = async (req, res) => {
  await seedDemoDoctorsIfEmpty();

  const doctorsList = await Doctor.find().sort({
    specialization: 1,
    name: 1
  });

  res.json(doctorsList);
};

const getDoctorById = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ msg: "Doctor not found" });
  }
  res.json(doctor);
};

const getMyDoctorProfile = async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ msg: "Doctor account required" });
  }

  let doctor = await Doctor.findOne({ user: req.user.id });

  if (!doctor) {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "Doctor account not found" });
    }

    doctor = await Doctor.create({
      user: user._id,
      name: user.name || "Doctor",
      specialization: "General Physician",
      hospital: "MediCare Online Clinic",
      city: "",
      address: "",
      about: `${user.name || "This doctor"} is available for appointments, patient notes, prescriptions, and digital consultations.`,
      experience: 0,
      fees: 0,
      image: "/doctor-hero.png",
      availability: "Online consultation",
      availableToday: true,
      availabilitySchedule: [
        { day: "Monday", startTime: "09:00", endTime: "17:00", mode: "both" },
        { day: "Wednesday", startTime: "09:00", endTime: "17:00", mode: "both" },
        { day: "Friday", startTime: "09:00", endTime: "17:00", mode: "both" },
      ],
    });
  }

  res.json(doctor);
};

const addDoctor = async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.json(doctor);
};

const deleteDoctor = async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};

module.exports = {
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  addDoctor,
  deleteDoctor
};
