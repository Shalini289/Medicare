function detectDoctor(symptoms) {
  const input = symptoms.toLowerCase();

  // Heart / chest
  if (input.includes("chest") || input.includes("heart")) {
    return "Cardiologist";
  }

  // Fever / cold
  if (input.includes("fever") || input.includes("cold") || input.includes("cough")) {
    return "General Physician";
  }

  // Skin
  if (input.includes("skin") || input.includes("rash")) {
    return "Dermatologist";
  }

  // Teeth
  if (input.includes("tooth") || input.includes("teeth")) {
    return "Dentist";
  }

  // Bones
  if (input.includes("bone") || input.includes("joint")) {
    return "Orthopedic";
  }

  // Default
  return "General Physician";
}

module.exports = detectDoctor;