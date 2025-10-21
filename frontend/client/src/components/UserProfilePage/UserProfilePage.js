// src/components/UserProfilePage/UserProfilePage.js
import React, { useState, useEffect } from "react";
import Header from "../HomePage/Header";
import ProfileInfo from "./ProfileInfo";
import ProfileStats from "./ProfileStats";
import ItineraryView from "./ItineraryView";
import "./UserProfilePage.css";

const UserProfilePage = ({ onBack, onUpdate, user, onNavigateToProfile, onNavigateToCreate, onViewItinerary, onNavigateToCreated, onNavigateToSaved, onNavigateToHome, showError, onLogout }) => {
  // State for edit mode, loading, active tab, and user itineraries
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("itineraries");
  const [userItineraries, setUserItineraries] = useState([]);

  // Helper to process tags from various formats (array, JSON string, etc.)
  const processTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
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

  // Load user data and itineraries on component mount
  useEffect(() => {
    if (user) {
      setIsLoading(false);
      loadUserItineraries();
    } else {
      const timer = setTimeout(() => {
        if (!user) {
          console.error("No user data available");
          onBack();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, onBack]);

  // Fetch user's itineraries from backend API
  const loadUserItineraries = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching user itineraries for profile:', user?.id);

      const response = await fetch("http://localhost:3000/api/my-itineraries", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile API Response:', data);

        let userItinerariesFromDB = [];

        if (data.ok && Array.isArray(data.itineraries)) {
          userItinerariesFromDB = data.itineraries;
        } else {
          console.error('Unexpected API response structure:', data);
          userItinerariesFromDB = [];
        }

        // Process and normalize itinerary data for consistent display
        const processedItineraries = userItinerariesFromDB.map(itinerary => ({
          ...itinerary,
          tags: processTags(itinerary.tags),
          title: itinerary.title || 'Untitled Itinerary',
          description: itinerary.description || '',
          duration: itinerary.duration || '1 day',
          price: itinerary.price || '$$',
          rating: itinerary.rating || 0,
          destinations: itinerary.destinations || [],
          createdBy: itinerary.createdBy || itinerary.authorid || user?.id || 'unknown'
        }));

        console.log('User itineraries loaded for profile:', processedItineraries);
        setUserItineraries(processedItineraries);
      }
    } catch (error) {
      console.error('Error loading user itineraries for profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Profile editing handlers
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedUser) => {
    setIsEditing(false);
    onUpdate(updatedUser);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Tab navigation handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Navigation handlers
  const handleNavigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const handleViewItinerary = (itinerary) => {
    if (onViewItinerary) {
      onViewItinerary(itinerary);
    }
  };

  // Loading state display
  if (isLoading || !user) {
    return (
      <div className="user-profile-page">
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#71C19D",
          }}
        >
          <div>Loading user data...</div>
          <button
            className="back-button"
            onClick={onBack}
            style={{ marginTop: "20px" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#71C19D">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page account-page">
      {/* Full Width Header */}
      <div className="profile-header-full">
        <Header
          onBack={onBack}
          user={user}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToHome={onNavigateToHome}
          onNavigateToCreated={onNavigateToCreated}
          onNavigateToSaved={onNavigateToSaved}
          onLogout={onLogout}
        />
      </div>

      {/* Main Profile Content Area */}
      <div className="profile-content-main">
        {/* Edit Profile Button (only shown when not editing) */}
        {!isEditing && (
          <div className="edit-profile-top-right">
            <button className="edit-profile-btn-small" onClick={handleEdit}>
              Edit Profile
            </button>
          </div>
        )}

        {/* Profile Info Section (handles both view and edit modes) */}
        <ProfileInfo
          user={user}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* Profile Stats Section (itineraries count, saved, recent) */}
        <ProfileStats userItineraries={userItineraries} />
      </div>

      {/* Itinerary Display Section with Tabs */}
      <ItineraryView
        activeTab={activeTab}
        onTabClick={handleTabClick}
        userItineraries={userItineraries}
        user={user}
        onViewItinerary={handleViewItinerary}
      />
    </div>
  );
};

export default UserProfilePage;