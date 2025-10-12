// ItineraryCard.js (updated)
import React, { useState } from 'react';
import './ItineraryCard.css';

function ItineraryCard({ title, description, rating, tags, duration, price }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleReadMore = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`itinerary-card ${isExpanded ? 'expanded' : ''}`}>
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

            <p className={isExpanded ? "expanded-description" : "collapsed-description"}>
                {description}
            </p>

            {/* Expanded content */}
            {isExpanded && (
                <div className="expanded-content">
                    <div className="itinerary-details">
                        <div className="detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{duration}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Price:</span>
                            <span className="detail-value">{price}</span>
                        </div>
                        {tags && tags.length > 0 && (
                            <div className="detail-item">
                                <span className="detail-label">Tags:</span>
                                <div className="tags-container">
                                    {tags.map((tag, index) => (
                                        <span key={index} className="tag">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button
                className="read-more"
                onClick={handleReadMore}
            >
                {isExpanded ? 'Show Less' : 'Read More'}
            </button>
        </div>
    );
}

export default ItineraryCard;