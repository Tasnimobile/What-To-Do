// ItineraryCard.js
import React, { useState } from 'react';
import './ItineraryCard.css';

function ItineraryCard({
  title,
  description,
  rating,
  tags,
  duration,
  price,
  onClick,
  itineraryId,
  createdBy,
  currentUser,
  onRateItinerary
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const safeTags = React.useMemo(() => {
    if (!tags) return [];

    if (Array.isArray(tags)) {
      return tags;
    }

    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Failed to parse tags as JSON:', e);
        return [];
      }
    }

    return [];
  }, [tags]);

  // DEBUG: Check if current user can rate this itinerary
  const canRate = currentUser &&
    createdBy !== undefined &&
    currentUser.id !== undefined &&
    createdBy.toString() !== currentUser.id.toString();

  console.log('Rating Debug:', {
    itineraryId,
    title,
    currentUserId: currentUser?.id,
    createdBy,
    canRate,
    currentUser,
    createdByType: typeof createdBy,
    currentUserIdType: typeof currentUser?.id
  });

  const handleReadMore = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleCardClick = () => {
    if (onClick && itineraryId) {
      onClick(itineraryId);
    }
  };

  const handleRate = (e, newRating) => {
    e.stopPropagation();
    console.log('Rating clicked:', { itineraryId, newRating, canRate });

    if (canRate && onRateItinerary) {
      onRateItinerary(itineraryId, newRating);
    } else if (!canRate) {
      console.log('Cannot rate - user created this itinerary or not logged in');
    }
  };

  const handleMouseEnter = (starIndex) => {
    if (canRate) {
      setHoverRating(starIndex + 1);
    }
  };

  const handleMouseLeave = () => {
    if (canRate) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating || 0;

  return (
    <div
      className={`itinerary-card ${isExpanded ? 'expanded' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="itinerary-header">
        <h3>{title}</h3>
        <div className="rating">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={
                `star ${i < displayRating ? "filled" : ""} ${canRate ? "clickable" : ""}`
              }
              onClick={(e) => handleRate(e, i + 1)}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              title={canRate ? `Rate ${i + 1} star${i !== 0 ? 's' : ''}` : `Overall rating: ${rating || 0}`}
            >
              ★
            </span>
          ))}
          <span className="rating-text">({rating || 0})</span>
          {canRate && (
            <span className="rate-hint">Click to rate</span>
          )}
        </div>
      </div>

      <p className={isExpanded ? "expanded-description" : "collapsed-description"}>
        {description}
      </p>

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
            {safeTags.length > 0 && (
              <div className="detail-item">
                <span className="detail-label">Tags:</span>
                <div className="tags-container">
                  {safeTags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Rating:</span>
              <span className="detail-value">
                {rating || 0} stars {canRate ? '(You can rate this)' : '(You created this)'}
              </span>
            </div>
            {/* DEBUG INFO - Remove this after testing */}
            <div className="detail-item" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
              <span className="detail-label">Debug:</span>
              <span className="detail-value">
                User: {currentUser?.id}, CreatedBy: {createdBy}, CanRate: {canRate ? 'Yes' : 'No'}
              </span>
            </div>
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