const symptomMap = require("./symptomMap");

function predictSpecialists(input = []) {
  const scores = {};

  const text = input.join(" ").toLowerCase();

  console.log("TEXT 👉", text);

  for (let key in symptomMap) {
    const readable = key.replace("_", " ");

    if (text.includes(readable)) {
      console.log("MATCH FOUND 👉", readable);

      const mapping = symptomMap[key];

      for (let spec in mapping) {
        scores[spec] = (scores[spec] || 0) + mapping[spec];
      }
    }
  }

  console.log("SCORES 👉", scores);

  if (!Object.keys(scores).length) return [];

  const max = Math.max(...Object.values(scores));

  return Object.entries(scores).map(([spec, score]) => ({
    specialist: spec,
    confidence: +(score / max).toFixed(2)
  }));
}

module.exports = predictSpecialists;