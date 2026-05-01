export default function EmptyState({ 
  title = "No Data Found",
  text = "Nothing to display here",
  actionText,
  onAction
}) {
  return (
    <div className="empty-state">

      {/* ICON */}
      <div className="empty-icon">No data</div>

      {/* TITLE */}
      <h3>{title}</h3>

      {/* TEXT */}
      <p>{text}</p>

      {/* ACTION */}
      {actionText && (
        <button className="btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}

    </div>
  );
}
