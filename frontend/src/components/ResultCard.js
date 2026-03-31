// app/components/ResultCard.jsx

import { motion } from "framer-motion";

const css = `
  .result-empty {
    font-size: 13px;
    color: rgba(232,236,244,0.35);
    text-align: center;
    padding: 12px 0;
  }

  /* Specialist rows */
  .spec-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .spec-row:last-child { border-bottom: none; padding-bottom: 0; }
  .spec-row:first-child { padding-top: 0; }

  /* Rank badge */
  .spec-rank {
    width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 800;
  }
  .spec-rank.rank-1 {
    background: rgba(79,255,176,0.15); border: 1px solid rgba(79,255,176,0.3);
    color: #4fffb0;
  }
  .spec-rank.rank-2 {
    background: rgba(0,180,255,0.1); border: 1px solid rgba(0,180,255,0.2);
    color: #00b4ff;
  }
  .spec-rank.rank-n {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    color: rgba(232,236,244,0.45);
  }

  /* Name + bar */
  .spec-body { flex: 1; min-width: 0; }
  .spec-name-row {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 6px; gap: 8px;
  }
  .spec-name {
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
    color: #e8ecf4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .spec-pct {
    font-size: 12px; font-weight: 600; flex-shrink: 0;
  }
  .spec-pct.pct-high { color: #4fffb0; }
  .spec-pct.pct-mid  { color: #00b4ff; }
  .spec-pct.pct-low  { color: rgba(232,236,244,0.45); }

  /* Progress bar */
  .spec-track {
    height: 4px; border-radius: 2px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
  }
  .spec-fill {
    height: 100%; border-radius: 2px;
    transition: width .6s cubic-bezier(.22,1,.36,1);
  }
  .spec-fill.fill-high { background: linear-gradient(90deg, #4fffb0, #00e68a); }
  .spec-fill.fill-mid  { background: linear-gradient(90deg, #00b4ff, #0072ff); }
  .spec-fill.fill-low  { background: rgba(255,255,255,0.18); }
`;

let injected = false;
function ensureStyles() {
  if (injected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.textContent = css;
  document.head.appendChild(tag);
  injected = true;
}

function getTier(conf) {
  if (conf >= 0.65) return "high";
  if (conf >= 0.35) return "mid";
  return "low";
}

export default function ResultCard({ data }) {
  ensureStyles();

  if (!data || !data.specialists) {
    return <p className="result-empty">No recommendation yet.</p>;
  }

  return (
    <div>
      {data.specialists.map((s, i) => {
        const pct  = (s.confidence * 100).toFixed(0);
        const tier = getTier(s.confidence);
        const rankClass = i === 0 ? "rank-1" : i === 1 ? "rank-2" : "rank-n";

        return (
          <motion.div
            key={i}
            className="spec-row"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Rank badge */}
            <div className={`spec-rank ${rankClass}`}>
              {i === 0 ? "✦" : i + 1}
            </div>

            {/* Name + bar */}
            <div className="spec-body">
              <div className="spec-name-row">
                <span className="spec-name">{s.specialist}</span>
                <span className={`spec-pct pct-${tier}`}>{pct}%</span>
              </div>
              <div className="spec-track">
                <motion.div
                  className={`spec-fill fill-${tier}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.08 + 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}