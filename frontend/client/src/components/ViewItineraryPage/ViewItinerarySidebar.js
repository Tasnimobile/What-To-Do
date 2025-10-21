// src/components/ViewItineraryPage/ViewItinerarySidebar.js
import React from "react";
import "./ViewItinerarySidebar.css";

function ViewItinerarySidebar({ itinerary, onBack }) {
  // Handle case where itinerary data is not available
  if (!itinerary) {
    return (
      <div className="view-itinerary-sidebar">
        <div className="create-header">
          <h1>View Itinerary</h1>
        </div>
        <div className="create-form-card">
          <div className="error-message">
            <h2>Itinerary Not Found</h2>
            <p>The requested itinerary could not be loaded.</p>
          </div>
        </div>
        <div className="create-actions">
          <button className="save-btn" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Destructure itinerary data with default values for missing properties
  const {
    title = "Untitled Itinerary",
    description = "No description provided.",
    rating = 0,
    tags = [],
    duration = "Not specified",
    price = "Not specified",
    destinations = [],
  } = itinerary;

  return (
    <div className="view-itinerary-sidebar">
      {/* Itinerary Title Header */}
      <div className="create-header">
        <h1 className="itinerary-main-title">{title}</h1>
      </div>

      {/* Main Itinerary Details Card */}
      <div className="create-form-card">
        {/* Description Section */}
        <div className="form-section">
          <div className="input-group">
            <div className="view-field">
              <label className="form-label">Description</label>
              <div className="view-value description">{description}</div>
            </div>
          </div>

          {/* Duration and Price Section */}
          <div className="form-row">
            <div className="input-group duration-dropdown-wrapper">
              <div className="view-field">
                <label className="form-label">Duration</label>
                <div className="view-value">{duration}</div>
              </div>
            </div>

            <div className="input-group price-select-wrapper">
              <div className="view-field">
                <label className="form-label">Price Level</label>
                <div className="view-value">{price}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Section with Star Display */}
        <div className="form-section">
          <div className="input-group">
            <div className="view-field">
              <label className="form-label">Rating</label>
              <div className="rating-display">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < rating ? "star filled" : "star"}>
                    ★
                  </span>
                ))}
                <span className="rating-text">({rating}/5)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section (only shown if tags exist) */}
        {tags.length > 0 && (
          <div className="form-section">
            <div className="input-group">
              <div className="view-field">
                <label className="form-label">Tags</label>
                <div className="tags-container">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Destinations Section */}
        <div className="form-section">
          <div className="input-group">
            <div className="view-field">
              <label className="form-label">
                Destinations ({destinations.length})
              </label>
              {destinations.length > 0 ? (
                <div className="destinations-list">
                  {destinations.map((destination, index) => (
                    <div
                      key={destination.id || index}
                      className="destination-item view-destination"
                    >
                      <div className="destination-order">{index + 1}</div>
                      <div className="destination-info">
                        <div className="destination-name">
                          {destination.name || `Destination ${index + 1}`}
                        </div>
                        {destination.address && (
                          <div className="destination-address">
                            {destination.address}
                          </div>
                        )}
                        {destination.rating && (
                          <div className="destination-rating">
                            <span className="star-icon">★</span>
                            <span>{destination.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-destinations">
                  No destinations added to this itinerary.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button (Save Itinerary) */}
      <div className="create-actions">
        <button className="save-btn">Save Itinerary</button>
      </div>
    </div>
  );
}

export default ViewItinerarySidebar;