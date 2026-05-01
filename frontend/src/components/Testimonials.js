import"../styles/testimonials.css";
const TESTIMONIALS = [
  { name: "Meera Sharma", city: "Mumbai",    text: "Booking was so easy and the doctor was incredibly kind. I felt genuinely cared for.",   color: "rose" },
  { name: "Rohan Verma",  city: "Delhi",     text: "The lab test at home service is a game-changer. Results were ready the next morning!",  color: "mint" },
  { name: "Anjali Patel", city: "Bangalore", text: "I love how I can manage my entire family's health from one place. Highly recommended.", color: "lavender" },
];

export default function Testimonials() {
  return (
    <section className="section">
      <div className="section-header">
        <div className="section-tag">Patient stories</div>
        <h2>What our patients say</h2>
        <p>Real experiences from real people who trust MediCare with their health.</p>
      </div>
      <div className="testimonials__grid">
        {TESTIMONIALS.map(({ name, city, text, color }) => (
          <div key={name} className={`testi-card testi-card--${color}`}>
            <div className="testi-card__stars">5.0 rating</div>
            <p className="testi-card__text">&ldquo;{text}&rdquo;</p>
            <div className="testi-card__author">
              <div className={`testi-card__av testi-card__av--${color}`}>{name.charAt(0)}</div>
              <div>
                <div className="testi-card__name">{name}</div>
                <div className="testi-card__city">{city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
