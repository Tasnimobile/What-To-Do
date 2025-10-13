import "./ItineraryPage.css";
import Destination from "./Destination";

export default function ItineraryPage({ itinerary }) {
  return (
    <div className="itinerary-page">
      <h1>{itinerary.name}</h1>
      <div className="themes">
        {itinerary.themes.map((theme) => (
          <span key={theme} className="theme-tag">
            {theme}
          </span>
        ))}
      </div>
      <h4> Description: </h4>
      <div className="description">{itinerary.description}</div>
      <div className="destinations">
        {itinerary.destinations.map((dest) => (
          <Destination key={dest.id} data={dest} />
        ))}
      </div>
    </div>
  );
}
