const Doctor = require("../models/Doctor");
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
  addDoctor,
  deleteDoctor
};
