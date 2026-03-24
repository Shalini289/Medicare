function calculateWaitTime(count) {
  const avgTimePerPatient = 10; // minutes

  return count * avgTimePerPatient;
}

module.exports = calculateWaitTime;