import "./ItineraryCard.css";

export default function ItineraryCard({ title, description, rating, href }) {
  return (
    <div className="itinerary-card">
      <div className="itinerary-header">
        <h3>{title}</h3>
        <div className="rating">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < rating ? "star filled" : "star"}>
              *
            </span>
          ))}
        </div>
      </div>
      <p>{description}</p>
      <a className="read-more" href={href}>
        Read More
      </a>{" "}
    </div>
  );
}
