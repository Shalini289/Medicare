// app/components/DoctorCard.jsx

import { motion } from "framer-motion";

const css = `
  .doc-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    padding: 20px 22px;
    margin-bottom: 14px;
    position: relative;
    overflow: hidden;
    transition: border-color .25s, background .25s, transform .2s;
  }
  .doc-card::before {
    content: '';
    position: absolute; inset: 0; border-radius: 18px;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 55%);
    pointer-events: none;
  }
  .doc-card:hover { border-color: rgba(79,255,176,0.22); transform: translateY(-2px); }
  .doc-card.is-selected {
    border-color: rgba(79,255,176,0.45);
    background: rgba(79,255,176,0.04);
  }

  .doc-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; gap:12px; }
  .doc-left { display:flex; align-items:center; gap:14px; }
  .doc-avatar {
    width:46px; height:46px; border-radius:13px; flex-shrink:0;
    background: linear-gradient(135deg, rgba(79,255,176,0.18), rgba(0,180,255,0.18));
    border: 1px solid rgba(79,255,176,0.2);
    display:flex; align-items:center; justify-content:center; font-size:22px;
  }
  .doc-name {
    font-family:'Syne',sans-serif; font-size:15px; font-weight:700;
    color:#e8ecf4; margin-bottom:4px;
  }
  .doc-meta-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .doc-spec { font-size:12px; color:rgba(232,236,244,0.55); }
  .doc-sep { width:3px; height:3px; border-radius:50%; background:rgba(255,255,255,0.2); flex-shrink:0; }
  .doc-exp { font-size:12px; color:rgba(232,236,244,0.45); }

  .doc-rating {
    background:rgba(255,200,0,0.1); border:1px solid rgba(255,200,0,0.2);
    border-radius:8px; padding:5px 10px;
    font-family:'Syne',sans-serif; font-size:13px; font-weight:700;
    color:#ffc800; white-space:nowrap; flex-shrink:0;
  }

  .doc-slots-label {
    font-size:10px; letter-spacing:.08em; text-transform:uppercase;
    color:rgba(232,236,244,0.35); margin-bottom:8px;
  }
  .doc-slots { display:flex; flex-wrap:wrap; gap:7px; }
  .slot-btn {
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09);
    border-radius:8px; padding:6px 13px;
    font-size:12px; font-family:'DM Sans',sans-serif; font-weight:500;
    color:rgba(232,236,244,0.55); cursor:pointer; transition:all .2s;
  }
  .slot-btn:hover { border-color:rgba(79,255,176,0.35); color:#e8ecf4; background:rgba(79,255,176,0.05); }
  .slot-btn.slot-active {
    background:rgba(79,255,176,0.12); border-color:#4fffb0;
    color:#4fffb0; font-weight:600;
    box-shadow:0 0 12px rgba(79,255,176,0.18);
  }
`;

let injected = false;
function ensureStyles() {
  if (injected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.textContent = css;
  document.head.appendChild(tag);
  injected = true;
}

export default function DoctorCard({ doc, isSelected, selectedSlot, onSelect }) {
  ensureStyles();

  return (
    <motion.div
      className={`doc-card ${isSelected ? "is-selected" : ""}`}
      whileHover={{ scale: 1.005 }}
      layout
    >
      <div className="doc-top">
        <div className="doc-left">
          <div className="doc-avatar">👨‍⚕️</div>
          <div>
            <div className="doc-name">{doc.name}</div>
            <div className="doc-meta-row">
              <span className="doc-spec">{doc.specialization}</span>
              <span className="doc-sep" />
              <span className="doc-exp">{doc.experience} yrs exp</span>
            </div>
          </div>
        </div>
        <div className="doc-rating">★ {doc.rating}</div>
      </div>

      {doc.availableSlots?.length > 0 && (
        <>
          <div className="doc-slots-label">Available Slots</div>
          <div className="doc-slots">
            {doc.availableSlots.map((slot, i) => (
              <motion.button
                key={i}
                className={`slot-btn ${isSelected && selectedSlot === slot ? "slot-active" : ""}`}
                onClick={() => onSelect(doc, slot)}
                whileTap={{ scale: 0.92 }}
              >
                {slot}
              </motion.button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}