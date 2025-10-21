// src/components/UserProfilePage/ProfileStats.js
import React from "react";
import "./ProfileStats.css";

const ProfileStats = ({ userItineraries = [] }) => {
  // Calculate stats for display - itineraries count and recent activity
  const stats = {
    itineraries: userItineraries.length,
    saved: 0, // Placeholder for future saved itineraries feature
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

      {/* Saved itineraries count (placeholder) */}
      <div className="stat-item-small">
        <div className="stat-number-small">{stats.saved}</div>
        <div className="stat-label-small">Saved</div>
      </div>

      {/* Recent activity count (last 7 days) */}
      <div className="stat-item-small">
        <div className="stat-number-small">{stats.recent}</div>
        <div className="stat-label-small">Recent</div>
      </div>
    </div>
  );
};

export default ProfileStats;