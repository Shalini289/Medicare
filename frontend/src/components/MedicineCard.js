import "../styles/medicineCard.css";

export default function MedicineCard({ med, add }) {
  const outOfStock = Number(med.stock || 0) <= 0;

  return (
    <div className="medicine-card">
      <div className="med-img">
        <img src={med.image || "/medicine.png"} alt={med.name} />
      </div>

      <div className="med-info">
        <h3>{med.name}</h3>

        <p className="med-desc">
          {med.description || "Effective medicine for your health"}
        </p>

        <div className="med-price">
          Rs {med.price}
        </div>

        <p className={`med-stock ${outOfStock ? "empty-stock" : ""}`}>
          {outOfStock ? "Out of stock" : `${med.stock || 0} in stock`}
        </p>
      </div>

      <button
        className="add-btn"
        onClick={() => add(med)}
        disabled={outOfStock}
      >
        {outOfStock ? "Unavailable" : "Add to Cart"}
      </button>
    </div>
  );
}
