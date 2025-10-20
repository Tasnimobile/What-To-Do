export default function DestinationCard({ data }) {
  return (
    <div className="destination-card">
      <div className="destination-header">
        <span className="destination-name">{data.name}</span>
        <span className="destination-category">{data.category}</span>
      </div>
      <div className="destination-notes">{data.notes}</div>
    </div>
  );
}
