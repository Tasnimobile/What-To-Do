export default function Destination({ data, onEdit, onDelete }) {
  return (
    <div className="destination">
      <div className="destination-header">
        <span className="destination-name">{data.name}</span>
        <span className="destination-category">{data.category}</span>
      </div>
      {data.notes && <div className="destination-notes">{data.notes}</div>}

      {/* Buttons */}
      <button className="edit-button" onClick={onEdit}>
        Edit
      </button>
      <button className="delete-button" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}
