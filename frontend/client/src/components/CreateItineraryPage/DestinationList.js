// DestinationsList.js
import React, { useState } from 'react';
import './DestinationList.css';

function DestinationsList({ destinations, onRemoveDestination, onMoveDestination, onUpdateDestination }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleEditStart = (destination) => {
        setEditingId(destination.id);
        setEditName(destination.name);
    };

    const handleEditSave = (destinationId) => {
        if (editName.trim()) {
            onUpdateDestination(destinationId, { name: editName.trim() });
        }
        setEditingId(null);
        setEditName('');
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleKeyPress = (e, destinationId) => {
        if (e.key === 'Enter') {
            handleEditSave(destinationId);
        } else if (e.key === 'Escape') {
            handleEditCancel();
        }
    };

    return (
        <div className="destinations-list">
            {destinations
                .sort((a, b) => a.order - b.order)
                .map((destination, index) => (
                    <div key={destination.id} className="destination-item">
                        <div className="destination-order-container">
                            <button
                                className="move-btn"
                                onClick={() => onMoveDestination(index, -1)}
                                disabled={index === 0}
                                title="Move up"
                            >
                                ↑
                            </button>
                            <div className="destination-order">{index + 1}</div>
                            <button
                                className="move-btn"
                                onClick={() => onMoveDestination(index, 1)}
                                disabled={index === destinations.length - 1}
                                title="Move down"
                            >
                                ↓
                            </button>
                        </div>
                        <div className="destination-info">
                            {editingId === destination.id ? (
                                <div className="destination-name-edit">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, destination.id)}
                                        onBlur={() => handleEditSave(destination.id)}
                                        className="name-edit-input"
                                        autoFocus
                                    />
                                    <div className="edit-actions">
                                        <button
                                            className="save-edit-btn"
                                            onClick={() => handleEditSave(destination.id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="cancel-edit-btn"
                                            onClick={handleEditCancel}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="destination-name editable"
                                    onClick={() => handleEditStart(destination)}
                                    title="Click to edit name"
                                >
                                    {destination.name}
                                </div>
                            )}
                            <div className="destination-address">{destination.address}</div>
                            {destination.rating && (
                                <div className="destination-rating">
                                    <span className="star-icon">★</span>
                                    {destination.rating}
                                </div>
                            )}
                        </div>
                        <div className="destination-actions">
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
                    No destinations added yet. Click "Add Destination" to start building your pathway.
                </div>
            )}
        </div>
    );
}

export default DestinationsList;