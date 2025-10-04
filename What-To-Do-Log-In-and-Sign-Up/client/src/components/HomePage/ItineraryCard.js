import React from 'react';
import './ItineraryCard.css';

function ItineraryCard({ title, description, rating }) {
    return (
        <div className="itinerary-card">
            <div className="itinerary-header">
                <h3>{title}</h3>
                <div className="rating">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < rating ? "star filled" : "star"}>
                            ★
                        </span>
                    ))}
                </div>
            </div>

            <p>{description}</p>

            <button className="read-more">Read More</button>
        </div>
    );
}

export default ItineraryCard;