require("dotenv").config();

const mongoose = require("mongoose");
const Medicine = require("../models/Medicine");
const medicines = require("../data/medicines");

const seedMedicines = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from the environment");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const operations = medicines.map((medicine) => ({
    updateOne: {
      filter: {
        barcode: medicine.barcode,
      },
      update: {
        $set: medicine,
      },
      upsert: true,
    },
  }));

  const result = await Medicine.bulkWrite(operations);

  console.log(
    `Medicine seed complete: ${result.upsertedCount} added, ${result.modifiedCount} updated.`
  );
};

if (require.main === module) {
  seedMedicines()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = seedMedicines;
