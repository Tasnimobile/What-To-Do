// HomePage.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Map from './Map';
import Sidebar from './Sidebar';
import './HomePage.css';

function HomePage({ onBack, user, onNavigateToProfile, onNavigateToCreate, onViewItinerary, onNavigateToCreated }) {
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [allItineraries, setAllItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItineraries();
  }, []);

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

        alert(`Thanks for your ${rating}-star rating!`);
      } else {
        console.error('Failed to submit rating');
        alert('Failed to submit rating. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating. Please check your connection.');
    }
  };

  const loadItineraries = async () => {
    setIsLoading(true);
    try {
      console.log('Loading all itineraries for homepage...');

      const response = await fetch("http://localhost:3000/api/itineraries", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      console.log('API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);

        let itinerariesFromDB = [];

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

        console.log('Raw itineraries from DB:', itinerariesFromDB);

        const processedItineraries = itinerariesFromDB.map(itinerary => ({
          ...itinerary,
          tags: processTags(itinerary.tags),
          title: itinerary.title || 'Untitled Itinerary',
          description: itinerary.description || 'No description',
          duration: itinerary.duration || '1 day',
          price: itinerary.price || '$$',
          rating: itinerary.rating || 0,
          destinations: itinerary.destinations || [],
          createdBy: itinerary.authorid || itinerary.createdBy,
          authorid: itinerary.authorid
        }));

        console.log('Processed itineraries for display:', processedItineraries);
        setAllItineraries(processedItineraries);

        localStorage.setItem('userItineraries', JSON.stringify(processedItineraries));
      } else {
        console.error('Failed to fetch itineraries from server, status:', response.status);
        fallbackToLocalStorage();
      }
    } catch (error) {
      console.error('Error loading itineraries from server:', error);
      fallbackToLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackToLocalStorage = () => {
    console.log('Falling back to localStorage...');
    const savedItineraries = localStorage.getItem('userItineraries');
    if (savedItineraries) {
      try {
        const parsed = JSON.parse(savedItineraries);
        const processed = Array.isArray(parsed) ?
          parsed.map(itinerary => ({
            ...itinerary,
            tags: processTags(itinerary.tags)
          })) : [];
        console.log('Loaded from localStorage:', processed);
        setAllItineraries(processed);
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
        setAllItineraries([]);
      }
    } else {
      console.log('No data in localStorage');
      setAllItineraries([]);
    }
  };

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

  const addNewItinerary = (newItinerary) => {
    const itineraryWithId = {
      ...newItinerary,
      id: Date.now(),
      rating: 0,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || 'current-user'
    };

    const updatedItineraries = [...allItineraries, itineraryWithId];
    setAllItineraries(updatedItineraries);

    localStorage.setItem('userItineraries', JSON.stringify(updatedItineraries));

    console.log('New itinerary added to homepage:', itineraryWithId);
  };

  console.log('HomePage render - itineraries count:', allItineraries.length);

  return (
    <div className="homepage">
      <div className="main-left">
        <Header
          onBack={onBack}
          user={user}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToHome={handleNavigateToHome}
          onNavigateToCreated={onNavigateToCreated}
        />
        <Map
          selectedDestinations={selectedDestinations}
        />
      </div>

      <div className="sidebar-container">
        <Sidebar
          onCreateNew={handleCreateNew}
          onViewItinerary={handleViewItinerary}
          itineraries={allItineraries}
          onNewItinerary={addNewItinerary}
          isLoading={isLoading}
          currentUser={user}
          onRateItinerary={handleRateItinerary}
        />
      </div>
    </div>
  );
}

export default HomePage;