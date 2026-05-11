require("dotenv").config();

const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const doctors = require("../data/doctors");

const seedDoctors = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from the environment");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const operations = doctors.map((doctor) => ({
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
  }));

  const result = await Doctor.bulkWrite(operations);

  console.log(
    `Doctor seed complete: ${result.upsertedCount} added, ${result.modifiedCount} updated.`
  );
};

if (require.main === module) {
  seedDoctors()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = seedDoctors;
