// CreateItinerarySidebar.js - Fixed
import React, { useState, useRef } from 'react';
import './CreateItinerarySidebar.css';
import './FormStyles.css';
import ItineraryForm from './ItineraryForm';
import DestinationManager from './DestinationManager';
import TagsManager from './TagsManager';

function CreateItinerarySidebar({ onStartLocationSelection, isSelectingLocation, onItinerarySave, onItineraryCancel, itineraryData, onUpdate }) {
    const [localItineraryData, setLocalItineraryData] = useState({
        title: '',
        description: '',
        tags: [],
        duration: '1 day',
        price: '$$',
        customTag: '',
        destinations: []
    });

    const actualItineraryData = {
        title: itineraryData?.title || localItineraryData.title,
        description: itineraryData?.description || localItineraryData.description,
        tags: itineraryData?.tags || localItineraryData.tags,
        duration: itineraryData?.duration || localItineraryData.duration,
        price: itineraryData?.price || localItineraryData.price,
        customTag: itineraryData?.customTag || localItineraryData.customTag,
        destinations: itineraryData?.destinations || localItineraryData.destinations
    };

    console.log('Sidebar itinerary data:', actualItineraryData);

    const handleSave = async () => {
        console.log('Saving itinerary with data:', actualItineraryData);
        const title = actualItineraryData.title || '';
        const destinations = actualItineraryData.destinations || [];
        if (title.trim() && destinations.length > 0) {
            onItinerarySave({
                ...actualItineraryData,
                id: Date.now(),
                rating: 0
            });
        } else {
            console.log('Cannot save - missing title or destinations');
        }

        try { 
            const res = await fetch("http://localhost:3000/api/create-itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: actualItineraryData.title,
                    description: actualItineraryData.description,
                    tags: JSON.stringify(actualItineraryData.tags || []),
                    duration: actualItineraryData.duration,
                    price: actualItineraryData.price,
                }),
            });
            const ct = res.headers.get("content-type") || "";
            const payload = ct.includes("application/json")
                ? await res.json()
                : { ok: false, raw: await res.text() };

            if (res.ok && payload.ok) {
                const saved = payload.itinerary;
                onItinerarySave(saved);
                return;

            } else {
                const msg =
                payload.errors?.join(", ") ||
                payload.raw ||
                `Create itinerary failed (status ${res.status})`;
                console.error(msg);
}

        }
        catch(err) {
            console.log('Cannot save - missing title or destinations');
        }
    };

    const updateItineraryData = (field, value) => {
        console.log('Updating itinerary data:', field, value);
        if (onUpdate) {
            onUpdate(field, value);
        } else {
            setLocalItineraryData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    return (
        <div className="create-itinerary-sidebar">
            <div className="create-header">
                <h1>Create New Itinerary</h1>
            </div>

            <div className="create-form-card">
                <ItineraryForm
                    itineraryData={actualItineraryData}
                    onUpdate={updateItineraryData}
                />

                <DestinationManager
                    itineraryData={actualItineraryData}
                    onUpdate={updateItineraryData}
                    onStartLocationSelection={onStartLocationSelection}
                    isSelectingLocation={isSelectingLocation}
                />

                <TagsManager
                    itineraryData={actualItineraryData}
                    onUpdate={updateItineraryData}
                />
            </div>

            <div className="create-actions">
                <button
                    className="cancel-btn"
                    onClick={onItineraryCancel}
                >
                    Cancel
                </button>
                <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={!actualItineraryData.title?.trim()}

                >
                    Create Itinerary ({(actualItineraryData.destinations || []).length} destinations)
                </button>
            </div>

            <div className="scroll-spacer"></div>
        </div>
    );
}

export default CreateItinerarySidebar;