import ItineraryCard from "./ItineraryCard";
import "./Sidebar.css";

export default function Sidebar() {
    return (
        <div className="sidebar">
            <h1>Itineraries</h1>
            <h2>Create New</h2>

            <div className="search-filter">
                <input type="text" placeholder="Search" />
                <button>Filter</button>
            </div>

            <ItineraryCard title="Itinerary 1" rating={5} description="Description of Itinerary 1" />
            <ItineraryCard title="Itinerary 2" rating={4} description="Description of Itinerary 2" />
            <ItineraryCard title="Itinerary 3" rating={3} description="Description of Itinerary 3" />

        </div>
    );
}
