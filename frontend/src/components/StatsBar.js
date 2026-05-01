"use client";

import { useEffect, useState } from "react";
import "../styles/statsBar.css";

const stats = [
  { value: 850, suffix: "+", label: "Verified doctors" },
  { value: 50, suffix: "k+", label: "Happy patients" },
  { value: 30, suffix: "+", label: "Specialisations" },
  { value: 4.9, suffix: "*", label: "Average rating" },
];

export default function StatsBar() {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) =>
        prev.map((c, i) => {
          if (c < stats[i].value) {
            return +(c + stats[i].value / 20).toFixed(1);
          }
          return stats[i].value;
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="stats-bar">
      <div className="stats-inner">
        {stats.map((s, i) => (
          <div key={s.label} className="stat-card">
            <h2>
              {counts[i]}
              {s.suffix}
            </h2>

            <p>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
