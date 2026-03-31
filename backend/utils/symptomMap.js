const symptomMap = {
  fever: { general_physician: 0.8 },
  cough: { pulmonologist: 0.8 },
  chest_pain: { cardiologist: 0.95 },
  headache: { neurologist: 0.85 },
  skin_rash: { dermatologist: 0.95 },
  stomach_pain: { gastroenterologist: 0.9 }
};

module.exports = symptomMap;