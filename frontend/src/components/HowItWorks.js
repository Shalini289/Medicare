const STEPS = [
  { num: "01", title: "Search & discover",  desc: "Browse verified doctors by specialty or symptom.",      color: "rose" },
  { num: "02", title: "Pick a slot",        desc: "Choose from real-time available time slots.",            color: "mint" },
  { num: "03", title: "Confirm & attend",   desc: "Get instant confirmation and visit your doctor.",       color: "sky" },
  { num: "04", title: "Follow-up care",     desc: "Access prescriptions, reminders, and chat support.",      color: "lavender" },
];
import "../styles/howItWork.css"

export default function HowItWorks() {
  return (
    <section className="section hiw">

      {/* HEADER */}
      <div className="section-header">
        <div className="section-tag">Simple process</div>
        <h2>How MediCare works</h2>
        <p>Getting quality healthcare has never been this easy.</p>
      </div>

      {/* STEPS */}
      <div className="hiw-grid">
        {STEPS.map(({ num, title, desc, color }, i) => (
          <div key={num} className="hiw-card">

            {/* NUMBER */}
            <div className={`hiw-num hiw-num--${color}`}>
              {num}
            </div>

            {/* CONTENT */}
            <h3>{title}</h3>
            <p>{desc}</p>

          </div>
        ))}
      </div>

    </section>
  );
}
