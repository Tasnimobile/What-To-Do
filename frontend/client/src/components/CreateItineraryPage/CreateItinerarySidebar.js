// CreateItinerarySidebar.js
import React, { useState, useRef } from 'react';
import './CreateItinerarySidebar.css';
import './FormStyles.css';
import ItineraryForm from './ItineraryForm';
import DestinationManager from './DestinationManager';
import TagsManager from './TagsManager';

function CreateItinerarySidebar({ onSave, onCancel, onStartLocationSelection, isSelectingLocation }) {
    const [itineraryData, setItineraryData] = useState({
        title: '',
        description: '',
        tags: [],
        duration: '1 day',
        price: '$$',
        customTag: '',
        destinations: []
    });

    const handleSave = () => {
        if (itineraryData.title.trim() && itineraryData.destinations.length > 0) {
            onSave({
                ...itineraryData,
                id: Date.now(),
                rating: 0
            });
        }
    };

    const updateItineraryData = (field, value) => {
        setItineraryData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="create-itinerary-sidebar">
            <div className="create-header">
                <h1>Create New Itinerary</h1>
            </div>

            <div className="create-form-card">
                <ItineraryForm
                    itineraryData={itineraryData}
                    onUpdate={updateItineraryData}
                />

                <DestinationManager
                    itineraryData={itineraryData}
                    onUpdate={updateItineraryData}
                    onStartLocationSelection={onStartLocationSelection}
                    isSelectingLocation={isSelectingLocation}
                />

                <TagsManager
                    itineraryData={itineraryData}
                    onUpdate={updateItineraryData}
                />
            </div>

            <div className="create-actions">
                <button
                    className="cancel-btn"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={!itineraryData.title.trim() || itineraryData.destinations.length === 0}
                >
                    Create Itinerary ({itineraryData.destinations.length} destinations)
                </button>
            </div>

            <div className="scroll-spacer"></div>
        </div>
    );
}

export default CreateItinerarySidebar;