// DestinationManager.js
import React, { useState, useRef } from 'react';
import './DestinationManager.css';
import DestinationSearch from './DestinationSearch';
import DestinationsList from './DestinationList';

function DestinationManager({ itineraryData, onUpdate, onStartLocationSelection, isSelectingLocation }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showSearch, setShowSearch] = useState(false);

    const handleAddDestination = () => {
        setShowSearch(true);
    };

    const handleDestinationSelected = (newDestination) => {
        const updatedDestinations = [...itineraryData.destinations, newDestination];
        onUpdate('destinations', updatedDestinations);
        setCurrentStep(prev => prev + 1);
        setShowSearch(false);
    };

    const handleRemoveDestination = (destinationId) => {
        const updatedDestinations = itineraryData.destinations.filter(dest => dest.id !== destinationId);
        onUpdate('destinations', updatedDestinations);
        setCurrentStep(updatedDestinations.length + 1);
    };

    const handleMoveDestination = (index, direction) => {
        const newDestinations = [...itineraryData.destinations];
        const newIndex = index + direction;

        if (newIndex >= 0 && newIndex < newDestinations.length) {
            [newDestinations[index], newDestinations[newIndex]] =
                [newDestinations[newIndex], newDestinations[index]];

            newDestinations.forEach((dest, idx) => {
                dest.order = idx;
            });

            onUpdate('destinations', newDestinations);
        }
    };

    const handleClearDestinations = () => {
        onUpdate('destinations', []);
        setCurrentStep(1);
    };

    const cancelSearch = () => {
        setShowSearch(false);
    };

    return (
        <div className="input-group">
            <label className="form-label">Destinations Pathway</label>

            {!showSearch ? (
                <div className="destination-controls">
                    <button
                        className="add-destination-btn"
                        onClick={handleAddDestination}
                    >
                        Add Destination {currentStep}
                    </button>

                    {itineraryData.destinations.length > 0 && (
                        <button
                            className="clear-destinations-btn"
                            onClick={handleClearDestinations}
                        >
                            Clear All
                        </button>
                    )}
                </div>
            ) : (
                <DestinationSearch
                    currentStep={currentStep}
                    onDestinationSelected={handleDestinationSelected}
                    onMapSelection={onStartLocationSelection}
                    onCancel={cancelSearch}
                />
            )}

            <DestinationsList
                destinations={itineraryData.destinations}
                onRemoveDestination={handleRemoveDestination}
                onMoveDestination={handleMoveDestination}
            />
        </div>
    );
}

export default DestinationManager;