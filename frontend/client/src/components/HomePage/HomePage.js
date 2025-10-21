// HomePage.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Map from './Map';
import Sidebar from './Sidebar';
import './HomePage.css';

function HomePage({ onBack, user, onNavigateToProfile, onNavigateToCreate, onViewItinerary, onNavigateToCreated, onNavigateToSaved, onNavigateToHome, showError, onLogout }) {
  // State for selected destinations and itineraries
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [allItineraries, setAllItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process tags from various formats (array, string, JSON string)
  const processTags = (tags) => {
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
  };

  // Handle rating an itinerary
  const handleRateItinerary = async (itineraryId, rating) => {
    try {
      console.log(`Rating itinerary ${itineraryId} with ${rating} stars`);

      const response = await fetch(`http://localhost:3000/api/itineraries/${itineraryId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Rating submitted:', result);

        loadItineraries();

        if (typeof showError === 'function') {
          showError(`Thanks for your ${rating}-star rating!`);
        }
      } else {
        console.error('Failed to submit rating');
        if (typeof showError === 'function') {
          showError('Failed to submit rating. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (typeof showError === 'function') {
        showError('Error submitting rating. Please check your connection.');
      }
    }
  };

  // Load all itineraries from API
  const loadItineraries = async () => {
    setIsLoading(true);
    try {
      console.log('=== DEBUG: Loading itineraries ===');
      console.log('Current user state:', user);
      console.log('User ID:', user?.id);
      console.log('Is user logged in?', !!user);

      const response = await fetch("http://localhost:3000/api/itineraries", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      console.log('API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('=== DEBUG: Raw API response ===', data);

        let itinerariesFromDB = [];

        // Handle different API response structures
        if (Array.isArray(data)) {
          itinerariesFromDB = data;
        } else if (data && Array.isArray(data.itineraries)) {
          itinerariesFromDB = data.itineraries;
        } else if (data && Array.isArray(data.data)) {
          itinerariesFromDB = data.data;
        } else {
          console.error('Unexpected API response structure:', data);
          itinerariesFromDB = [];
        }

        console.log('=== DEBUG: Raw itineraries from DB ===');
        itinerariesFromDB.forEach((it, index) => {
          console.log(`Itinerary ${index}:`, {
            id: it.id,
            title: it.title,
            authorid: it.authorid,
            createdBy: it.createdBy,
            hasAuthorId: !!it.authorid,
            hasCreatedBy: !!it.createdBy
          });
        });

        // Process and format itinerary data
        const processedItineraries = itinerariesFromDB.map(itinerary => ({
          ...itinerary,
          tags: processTags(itinerary.tags),
          title: itinerary.title || 'Untitled Itinerary',
          description: itinerary.description || 'No description',
          duration: itinerary.duration || '1 day',
          price: itinerary.price || '$$',
          rating: itinerary.rating || 0,
          destinations: itinerary.destinations || [],
          createdBy: itinerary.authorid,
          authorid: itinerary.authorid
        }));

        console.log('=== DEBUG: Processed itineraries ===');
        processedItineraries.forEach((it, index) => {
          console.log(`Processed ${index}:`, {
            id: it.id,
            title: it.title,
            createdBy: it.createdBy,
            authorid: it.authorid
          });
        });

        setAllItineraries(processedItineraries);

      } else {
        console.error('Failed to fetch itineraries from server, status:', response.status);
        setAllItineraries([]);
        if (typeof showError === 'function') {
          showError('Failed to load itineraries from server.');
        }
      }
    } catch (error) {
      console.error('Error loading itineraries from server:', error);
      setAllItineraries([]);
      if (typeof showError === 'function') {
        showError('Error loading itineraries. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const handleNavigateToHome = () => {
    console.log('Already on homepage');
  };

  const handleCreateNew = () => {
    if (onNavigateToCreate) {
      onNavigateToCreate();
    }
  };

  const handleViewItinerary = (itinerary) => {
    console.log('Viewing itinerary from homepage:', itinerary);
    if (onViewItinerary) {
      onViewItinerary(itinerary);
    }
  };

  // Load itineraries on component mount
  useEffect(() => {
    loadItineraries();
  }, []);

  console.log('HomePage render - itineraries count:', allItineraries.length);

  return (
    <div className="homepage">
      <div className="main-left">
        {/* Header component with navigation */}
        <Header
          onBack={onBack}
          user={user}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToHome={onNavigateToHome}
          onNavigateToCreated={onNavigateToCreated}
          onNavigateToSaved={onNavigateToSaved}
          onLogout={onLogout}
        />
        {/* Map component displaying destinations */}
        <Map
          selectedDestinations={selectedDestinations}
        />
      </div>

      <div className="sidebar-container">
        {/* Sidebar with itinerary listings and actions */}
        <Sidebar
          onCreateNew={handleCreateNew}
          onViewItinerary={handleViewItinerary}
          itineraries={allItineraries}
          isLoading={isLoading}
          currentUser={user}
          onRateItinerary={handleRateItinerary}
        />
      </div>
    </div>
  );
}

export default HomePage;