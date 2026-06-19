require("dotenv").config();

const mongoose = require("mongoose");

const Ambulance = require("../models/Ambulance");
const Analytics = require("../models/Analytics");
const Appointment = require("../models/Appointment");
const BloodDonor = require("../models/BloodDonor");
const CarePlan = require("../models/CarePlan");
const Chat = require("../models/Chat");
const Department = require("../models/Department");
const Doctor = require("../models/Doctor");
const DoctorNote = require("../models/DoctorNote");
const Hospital = require("../models/Hospital");
const InsuranceClaim = require("../models/InsuranceClaim");
const Invoice = require("../models/Invoice");
const LabBooking = require("../models/LabBooking");
const LabTest = require("../models/LabTest");
const MedicalProfile = require("../models/MedicalProfile");
const Medicine = require("../models/Medicine");
const MedicineLog = require("../models/MedicineLog");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const Prescription = require("../models/Prescription");
const Review = require("../models/Review");
const Staff = require("../models/Staff");
const User = require("../models/User");
const Vaccination = require("../models/Vaccination");
const Vital = require("../models/Vital");

const demoPassword = "Demo@12345";
const demoDate = new Date("2026-05-23T09:00:00.000Z");

const connect = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from the environment");
  }

  await mongoose.connect(process.env.MONGO_URI);
};

const upsertUser = async ({ email, name, role, phone, familyMembers = [] }) => {
  const existing = await User.findOne({ email });

  if (existing) {
    existing.name = name;
    existing.role = role;
    existing.phone = phone;
    existing.familyMembers = familyMembers;
    await existing.save();
    return existing;
  }

  return User.create({
    email,
    name,
    role,
    phone,
    password: demoPassword,
    familyMembers,
  });
};

const upsertOne = (Model, filter, update) =>
  Model.findOneAndUpdate(filter, { $set: update }, {
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
    upsert: true,
  });

const seedDemo = async () => {
  await connect();

  const users = {
    admin: await upsertUser({
      email: "admin@medicare.demo",
      name: "MediCare Admin",
      role: "admin",
      phone: "+91 90000 00001",
    }),
    patient: await upsertUser({
      email: "arju@medicare.demo",
      name: "Arju Nayaka",
      role: "user",
      phone: "+91 98765 43210",
      familyMembers: [
        { name: "Meena Nayaka", age: 45, relation: "Mother" },
        { name: "Rohan Nayaka", age: 16, relation: "Brother" },
      ],
    }),
    secondPatient: await upsertUser({
      email: "ravi@medicare.demo",
      name: "Ravi Sharma",
      role: "user",
      phone: "+91 98765 11122",
    }),
    doctor: await upsertUser({
      email: "doctor@medicare.demo",
      name: "Dr. C. G. Dogne",
      role: "doctor",
      phone: "+91 90000 00002",
    }),
    pharmacy: await upsertUser({
      email: "pharmacy@medicare.demo",
      name: "MediCare Pharmacy Staff",
      role: "pharmacy",
      phone: "+91 90000 00003",
    }),
    pathology: await upsertUser({
      email: "pathology@medicare.demo",
      name: "MediCare Pathology Staff",
      role: "pathology",
      phone: "+91 90000 00004",
    }),
    hospital: await upsertUser({
      email: "hospital@medicare.demo",
      name: "City Hospital Staff",
      role: "hospital",
      phone: "+91 90000 00005",
    }),
  };

  const doctor = await upsertOne(Doctor, { user: users.doctor._id }, {
    user: users.doctor._id,
    name: "Dr. C. G. Dogne",
    specialization: "General Physician",
    image: "/doctor-hero.png",
    hospital: "City Hospital",
    city: "Indore",
    address: "AB Road, Indore",
    about: "Experienced physician for fever, infections, chronic care, and digital consultations.",
    experience: 12,
    fees: 500,
    rating: 4.7,
    availability: "Mon, Wed, Fri 09:00-17:00",
    availableToday: true,
    availabilitySchedule: [
      { day: "Monday", startTime: "09:00", endTime: "17:00", mode: "both" },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00", mode: "clinic" },
      { day: "Friday", startTime: "10:00", endTime: "16:00", mode: "video" },
    ],
    slotDurationMinutes: 20,
  });

  const secondDoctor = await upsertOne(Doctor, { name: "Dr. Priya Menon", specialization: "Cardiologist" }, {
    name: "Dr. Priya Menon",
    specialization: "Cardiologist",
    image: "/doctor-hero.png",
    hospital: "MediCare Heart Centre",
    city: "Indore",
    address: "Vijay Nagar, Indore",
    about: "Cardiology consultant for BP, chest pain, ECG review, and preventive heart care.",
    experience: 10,
    fees: 800,
    rating: 4.8,
    availability: "Tue, Thu 11:00-18:00",
    availableToday: true,
    availabilitySchedule: [
      { day: "Tuesday", startTime: "11:00", endTime: "18:00", mode: "both" },
      { day: "Thursday", startTime: "11:00", endTime: "18:00", mode: "both" },
    ],
    slotDurationMinutes: 30,
  });

  const hospital = await upsertOne(Hospital, { user: users.hospital._id }, {
    user: users.hospital._id,
    name: "City Hospital",
    city: "Indore",
    address: "AB Road, Near Palasia, Indore",
    phone: "+91 73100 11111",
    emergencyPhone: "+91 73100 10800",
    status: "active",
    beds: { ICU: 12, oxygen: 28, general: 75 },
    occupiedBeds: { ICU: 6, oxygen: 10, general: 52 },
  });

  const medicines = await Promise.all([
    upsertOne(Medicine, { barcode: "MC-PARA-500" }, {
      name: "Paracetamol 500mg",
      price: 25,
      stock: 180,
      createdBy: users.pharmacy._id,
      updatedBy: users.pharmacy._id,
      category: "Fever and pain",
      supplier: "MediSupply",
      reorderLevel: 30,
      barcode: "MC-PARA-500",
      batchNumber: "BATCH-P500-26",
      expiryDate: new Date("2027-12-31"),
      description: "Common fever and pain relief tablet.",
      image: "/medicine-placeholder.png",
    }),
    upsertOne(Medicine, { barcode: "MC-ORS-001" }, {
      name: "ORS Sachet",
      price: 18,
      stock: 90,
      createdBy: users.pharmacy._id,
      updatedBy: users.pharmacy._id,
      category: "Hydration",
      supplier: "HealthLine Pharma",
      reorderLevel: 20,
      barcode: "MC-ORS-001",
      batchNumber: "BATCH-ORS-26",
      expiryDate: new Date("2027-08-31"),
      description: "Oral rehydration salt for dehydration support.",
      image: "/medicine-placeholder.png",
    }),
  ]);

  const labTests = await Promise.all([
    upsertOne(LabTest, { name: "Complete Blood Count", category: "Hematology" }, {
      name: "Complete Blood Count",
      category: "Hematology",
      price: 350,
      sampleType: "Blood",
      fastingRequired: false,
      reportTime: "6 hours",
      description: "CBC test for hemoglobin, WBC, RBC, and platelets.",
      active: true,
    }),
    upsertOne(LabTest, { name: "Liver Function Test", category: "Biochemistry" }, {
      name: "Liver Function Test",
      category: "Biochemistry",
      price: 650,
      sampleType: "Blood",
      fastingRequired: false,
      reportTime: "24 hours",
      description: "LFT panel including SGOT and SGPT.",
      active: true,
    }),
  ]);

  const appointments = await Promise.all([
    upsertOne(Appointment, {
      doctor: doctor._id,
      date: "2026-05-24",
      time: "10:00",
      status: "booked",
    }, {
      user: users.patient._id,
      patient: users.patient._id,
      doctor: doctor._id,
      date: "2026-05-24",
      time: "10:00",
      status: "booked",
    }),
    upsertOne(Appointment, {
      doctor: doctor._id,
      date: "2026-05-24",
      time: "10:20",
      status: "booked",
    }, {
      user: users.secondPatient._id,
      patient: users.secondPatient._id,
      doctor: doctor._id,
      date: "2026-05-24",
      time: "10:20",
      status: "booked",
    }),
    upsertOne(Appointment, {
      doctor: secondDoctor._id,
      date: "2026-05-25",
      time: "12:00",
      status: "completed",
    }, {
      user: users.patient._id,
      patient: users.patient._id,
      doctor: secondDoctor._id,
      date: "2026-05-25",
      time: "12:00",
      status: "completed",
    }),
  ]);

  await Promise.all([
    upsertOne(MedicalProfile, { user: users.patient._id }, {
      user: users.patient._id,
      bloodGroup: "B+",
      allergies: ["Penicillin"],
      conditions: ["Mild anemia under review"],
      currentMedications: ["Iron supplement"],
      emergencyContacts: [
        { name: "Meena Nayaka", relation: "Mother", phone: "+91 98765 00001" },
      ],
      insurance: {
        provider: "Care Health",
        policyNumber: "CARE-DEMO-260414",
        validTill: new Date("2027-03-31"),
      },
      primaryDoctor: "Dr. C. G. Dogne",
      organDonor: false,
      notes: "Demo patient profile for prescription, lab booking, and appointment workflows.",
      medicalHistory: [
        {
          type: "lab",
          title: "CBC and Widal review",
          doctorName: "Dr. C. G. Dogne",
          facility: "MediCare Lab",
          date: demoDate,
          notes: "Hemoglobin low and Widal positive; correlate clinically.",
          attachments: ["demo-lab-note.pdf"],
        },
      ],
    }),
    upsertOne(Vital, { user: users.patient._id, recordedAt: demoDate }, {
      user: users.patient._id,
      recordedAt: demoDate,
      systolic: 112,
      diastolic: 74,
      pulse: 86,
      oxygen: 98,
      temperature: 99.1,
      bloodSugar: 94,
      weight: 54,
      notes: "Demo vitals after fever complaint.",
    }),
    upsertOne(Vaccination, { user: users.patient._id, vaccineName: "Tetanus Booster", dose: "Booster" }, {
      user: users.patient._id,
      vaccineName: "Tetanus Booster",
      dose: "Booster",
      dueDate: new Date("2026-06-15"),
      provider: "City Hospital",
      location: "Indore",
      status: "scheduled",
      notes: "Upcoming booster reminder.",
    }),
    upsertOne(MedicineLog, { user: users.patient._id, medicine: "Iron supplement", time: "09:00" }, {
      user: users.patient._id,
      medicine: "Iron supplement",
      dosage: "1 tablet",
      frequency: "daily",
      time: "09:00",
      startDate: demoDate,
      notes: "Take after breakfast.",
      taken: false,
      active: true,
    }),
  ]);

  await Promise.all([
    upsertOne(Prescription, { prescriptionCode: "RX-DEMO-ARJU-001" }, {
      user: users.patient._id,
      doctor: doctor._id,
      issuedBy: users.doctor._id,
      prescriptionCode: "RX-DEMO-ARJU-001",
      doctorName: "Dr. C. G. Dogne",
      diagnosis: "Fever with mild anemia review",
      issuedDate: demoDate,
      validUntil: new Date("2026-06-23"),
      followUpDate: new Date("2026-05-30"),
      status: "active",
      medicines: [
        {
          name: "Paracetamol 500mg",
          dosage: "500mg",
          frequency: "twice daily if fever",
          duration: "3 days",
          instructions: "Take after food only when fever is present.",
        },
        {
          name: "ORS Sachet",
          dosage: "1 sachet",
          frequency: "as needed",
          duration: "2 days",
          instructions: "Mix in clean water and sip slowly.",
        },
      ],
      patientInstructions: "Return immediately for persistent high fever, breathlessness, or weakness.",
      digitalSignature: "Dr. C. G. Dogne",
      notes: "Demo digital prescription.",
    }),
    upsertOne(DoctorNote, { doctor: doctor._id, patient: users.patient._id, title: "Demo consultation note" }, {
      doctor: doctor._id,
      patient: users.patient._id,
      appointment: appointments[0]._id,
      type: "consultation",
      title: "Demo consultation note",
      transcript: "Patient reports fever, weakness, and mild headache for two days.",
      summary: "Fever workup with CBC/Widal review.",
      diagnosisSuggestions: ["Upper respiratory infection pattern", "Anaemia risk"],
      plan: "Hydration, fever control, repeat CBC if symptoms continue, follow-up in one week.",
    }),
  ]);

  await Promise.all([
    upsertOne(LabBooking, { user: users.patient._id, collectionDate: new Date("2026-05-26"), slot: "08:00-09:00" }, {
      user: users.patient._id,
      tests: labTests.map((test) => ({ test: test._id, price: test.price })),
      collectionDate: new Date("2026-05-26"),
      slot: "08:00-09:00",
      address: "Arju Nayaka, Vijay Nagar, Indore",
      total: labTests.reduce((sum, test) => sum + test.price, 0),
      status: "sample_collected",
      notes: "Home collection demo booking.",
      pathologyNotes: "Sample collected and under processing.",
      reportSummary: "CBC and LFT booked for fever review.",
      sampleCollectedAt: new Date("2026-05-26T08:30:00.000Z"),
    }),
    upsertOne(BloodDonor, { user: users.secondPatient._id }, {
      user: users.secondPatient._id,
      name: "Ravi Sharma",
      bloodGroup: "O+",
      city: "Indore",
      phone: "+91 98765 11122",
      email: "ravi@medicare.demo",
      age: 29,
      lastDonationDate: new Date("2026-02-10"),
      available: true,
      emergencyOnly: false,
      notes: "Available after office hours.",
    }),
    upsertOne(CarePlan, { user: users.patient._id, title: "Anemia recovery plan" }, {
      user: users.patient._id,
      title: "Anemia recovery plan",
      category: "General",
      startDate: demoDate,
      endDate: new Date("2026-06-23"),
      status: "active",
      tasks: [
        { title: "Take iron-rich breakfast", schedule: "Daily", completed: false },
        { title: "Walk for 20 minutes", schedule: "Daily", completed: true, completedAt: demoDate },
      ],
      notes: "Demo care plan for patient dashboard.",
    }),
    upsertOne(Review, { user: users.patient._id, doctor: doctor._id }, {
      user: users.patient._id,
      doctor: doctor._id,
      rating: 5,
      comment: "Doctor explained the report clearly and suggested practical next steps.",
      helpful: 4,
    }),
  ]);

  await Promise.all([
    upsertOne(Order, { user: users.patient._id, paymentId: "pay_demo_001" }, {
      user: users.patient._id,
      items: [
        { medicine: medicines[0]._id, quantity: 2 },
        { medicine: medicines[1]._id, quantity: 4 },
      ],
      total: 122,
      status: "paid",
      paymentId: "pay_demo_001",
    }),
    upsertOne(Notification, { user: users.patient._id, title: "Demo appointment reminder" }, {
      user: users.patient._id,
      title: "Demo appointment reminder",
      message: "Your appointment with Dr. C. G. Dogne is scheduled for 24 May at 10:00 AM.",
      type: "appointment",
      read: false,
    }),
    upsertOne(Chat, { sender: users.patient._id, receiver: users.doctor._id, message: "Doctor, should I repeat CBC after fever?" }, {
      sender: users.patient._id,
      receiver: users.doctor._id,
      doctor: doctor._id,
      message: "Doctor, should I repeat CBC after fever?",
    }),
  ]);

  await Promise.all([
    upsertOne(Staff, { name: "Anita Verma", phone: "+91 90000 01001" }, {
      name: "Anita Verma",
      role: "Nurse",
      department: "Emergency",
      phone: "+91 90000 01001",
      shift: "Morning",
      status: "active",
    }),
    upsertOne(Invoice, { invoiceNumber: "INV-DEMO-001" }, {
      invoiceNumber: "INV-DEMO-001",
      patientName: "Arju Nayaka",
      items: [
        { name: "Consultation", amount: 500 },
        { name: "Lab tests", amount: 1000 },
      ],
      amount: 1500,
      dueDate: new Date("2026-06-01"),
      status: "unpaid",
    }),
    upsertOne(InsuranceClaim, { claimNumber: "CLM-DEMO-001" }, {
      claimNumber: "CLM-DEMO-001",
      patientName: "Arju Nayaka",
      provider: "Care Health",
      policyNumber: "CARE-DEMO-260414",
      amount: 1500,
      status: "under-review",
      notes: "Demo claim for consultation and tests.",
    }),
    upsertOne(Ambulance, { vehicleNumber: "MP09-AMB-108" }, {
      vehicleNumber: "MP09-AMB-108",
      driverName: "Suresh Patel",
      driverPhone: "+91 90000 02002",
      location: "Palasia, Indore",
      status: "available",
    }),
    upsertOne(Department, { name: "Emergency" }, {
      name: "Emergency",
      head: "Dr. Priya Menon",
      phone: "+91 73100 22222",
      beds: 18,
      status: "active",
    }),
  ]);

  await upsertOne(Analytics, {}, {
    totalUsers: await User.countDocuments(),
    totalDoctors: await Doctor.countDocuments(),
    totalAppointments: await Appointment.countDocuments(),
  });

  console.log("Demo seed complete.");
  console.log("Login accounts:");
  console.log("  admin@medicare.demo / Demo@12345");
  console.log("  arju@medicare.demo / Demo@12345");
  console.log("  doctor@medicare.demo / Demo@12345");
  console.log("  pharmacy@medicare.demo / Demo@12345");
  console.log("  pathology@medicare.demo / Demo@12345");
  console.log("  hospital@medicare.demo / Demo@12345");
};

if (require.main === module) {
  seedDemo()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = seedDemo;
