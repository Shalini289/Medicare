const getAvailableDoctors = async (req, res) => {
  try {
    const { date, time, specialization, location, name } = req.query;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Date and time are required"
      });
    }

    // 🔥 Build filter
    const filter = {};

    if (specialization) filter.specialization = specialization;
    if (location) filter.location = location;

    // ✅ NEW: Name search (case-insensitive)
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // Step 1: Get doctors
    const doctors = await Doctor.find(filter);

    const doctorIds = doctors.map(doc => doc._id);

    // Step 2: Find booked slots
    const booked = await Appointment.find({
      doctorId: { $in: doctorIds },
      date: new Date(date),
      time: time
    });

    const bookedDoctorIds = booked.map(b => b.doctorId.toString());

    // Step 3: Filter available
    const availableDoctors = doctors.filter(
      doc =>
        !bookedDoctorIds.includes(doc._id.toString()) &&
        doc.availableSlots.includes(time)
    );

    res.json({
      success: true,
      count: availableDoctors.length,
      data: availableDoctors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getAvailableDoctors }; 