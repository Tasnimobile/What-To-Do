// DestinationManager.js - Fixed version
import React, { useState, useRef, useEffect } from 'react';
import './DestinationManager.css';
import DestinationSearch from './DestinationSearch';
import DestinationsList from './DestinationList';

function DestinationManager({ itineraryData, onUpdate, onStartLocationSelection, isSelectingLocation }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showSearch, setShowSearch] = useState(false);

    console.log('DestinationManager props:', {
        destinations: itineraryData?.destinations,
        isSelectingLocation
    });

    useEffect(() => {
        setCurrentStep((itineraryData?.destinations?.length || 0) + 1);
    }, [itineraryData?.destinations]);

    const handleAddDestination = () => {
        console.log('Add destination clicked');
        setShowSearch(true);
    };

    const handleDestinationSelected = (newDestination) => {
        console.log('Destination selected in manager:', newDestination);
        const updatedDestinations = [...(itineraryData?.destinations || []), newDestination];
        onUpdate('destinations', updatedDestinations);
        setCurrentStep(prev => prev + 1);
        setShowSearch(false);
    };

    const handleRemoveDestination = (destinationId) => {
        console.log('Removing destination:', destinationId);
        const updatedDestinations = (itineraryData?.destinations || []).filter(dest => dest.id !== destinationId);
        onUpdate('destinations', updatedDestinations);
        setCurrentStep(updatedDestinations.length + 1);
    };

    const handleMoveDestination = (index, direction) => {
        console.log('Moving destination:', index, direction);
        const newDestinations = [...(itineraryData?.destinations || [])];
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

    const handleUpdateDestination = (destinationId, updates) => {
        console.log('Updating destination:', destinationId, updates);
        const updatedDestinations = (itineraryData?.destinations || []).map(dest =>
            dest.id === destinationId ? { ...dest, ...updates } : dest
        );
        onUpdate('destinations', updatedDestinations);
    };

    const handleClearDestinations = () => {
        console.log('Clearing all destinations');
        onUpdate('destinations', []);
        setCurrentStep(1);
    };

    const handleMapSelection = () => {
        console.log('Starting map selection from DestinationManager');
        onStartLocationSelection();
        setShowSearch(false);
    };

    const cancelSearch = () => {
        console.log('Canceling search');
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
                        Add Destination
                    </button>

                    {(itineraryData?.destinations?.length || 0) > 0 && (
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
                    onMapSelection={handleMapSelection}
                    onCancel={cancelSearch}
                />
            )}

            <DestinationsList
                destinations={itineraryData?.destinations || []}
                onRemoveDestination={handleRemoveDestination}
                onMoveDestination={handleMoveDestination}
                onUpdateDestination={handleUpdateDestination}
            />
        </div>
    );
}

export default DestinationManager;