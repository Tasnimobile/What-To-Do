// src/components/UserProfilePage/ProfileStats.js
import React from "react";
import "./ProfileStats.css";

const ProfileStats = ({ userItineraries = [], savedItineraries = [] }) => {
  // Calculate stats for display - itineraries count and recent activity
  const stats = {
    itineraries: userItineraries.length,
    saved: savedItineraries.length, // Now using actual saved itineraries count
    recent: userItineraries.filter((itin) => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(itin.createdAt) > oneWeekAgo;
    }).length,
  };

  return (
    <div className="profile-stats-small">
      {/* Created itineraries count */}
      <div className="stat-item-small">
        <div className="stat-number-small">{stats.itineraries}</div>
        <div className="stat-label-small">Created</div>
      </div>

      {/* Saved itineraries count (now using actual data) */}
      <div className="stat-item-small">
        <div className="stat-number-small">{stats.saved}</div>
        <div className="stat-label-small">Saved</div>
      </div>

      {/* Completed itineraries count */}
      <div className="stat-item-small">
        <div className="stat-number-small">{stats.recent}</div>
        <div className="stat-label-small">Completed</div>
      </div>
    </div>
  );
};

export default ProfileStats;