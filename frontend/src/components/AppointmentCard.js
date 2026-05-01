import "../styles/card.css";

export default function AppointmentCard({ item, onCancel, onRebook }) {
  const isCancelled = item.status === "cancelled";

  return (
    <div className="appointment-card">
      <div className="appointment-top">
        <div>
          <h3 className="doctor-name">
            {item.doctor?.name || "Doctor"}
          </h3>
          <p className="appointment-time">
            {item.date} at {item.time}
          </p>
          <p className="appointment-meta">
            {item.doctor?.specialization || "General consultation"}
          </p>
        </div>

        <span className={`status ${item.status}`}>
          {item.status}
        </span>
      </div>

      <div className="appointment-footer">
        <button
          className="btn-ghost"
          onClick={() => onCancel(item._id)}
          disabled={isCancelled}
        >
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={() => onRebook(item)}
        >
          Rebook
        </button>
      </div>
    </div>
  );
}
