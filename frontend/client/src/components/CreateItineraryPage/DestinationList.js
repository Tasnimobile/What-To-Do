// DestinationsList.js
import React from 'react';
import './DestinationList.css';


function DestinationsList({ destinations, onRemoveDestination, onMoveDestination }) {
    return (
        <div className="destinations-list">
            {destinations
                .sort((a, b) => a.order - b.order)
                .map((destination, index) => (
                    <div key={destination.id} className="destination-item">
                        <div className="destination-order">{index + 1}</div>
                        <div className="destination-info">
                            <div className="destination-name">{destination.name}</div>
                            <div className="destination-address">{destination.address}</div>
                            {destination.rating && (
                                <div className="destination-rating">
                                    ⭐ {destination.rating}
                                </div>
                            )}
                        </div>
                        <div className="destination-actions">
                            <button
                                className="move-btn"
                                onClick={() => onMoveDestination(index, -1)}
                                disabled={index === 0}
                                title="Move up"
                            >
                                ↑
                            </button>
                            <button
                                className="move-btn"
                                onClick={() => onMoveDestination(index, 1)}
                                disabled={index === destinations.length - 1}
                                title="Move down"
                            >
                                ↓
                            </button>
                            <button
                                className="remove-btn"
                                onClick={() => onRemoveDestination(destination.id)}
                                title="Remove destination"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}

            {destinations.length === 0 && (
                <div className="no-destinations">
                    No destinations added yet. Click "Add Destination 1" to start building your pathway.
                </div>
            )}
        </div>
    );
}

export default DestinationsList;